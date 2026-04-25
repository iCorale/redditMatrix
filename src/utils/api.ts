import { Capacitor } from '@capacitor/core'
import { Http } from '@capacitor-community/http'

export type SortType = 'best' | 'hot' | 'new' | 'top' | 'rising'

export type Post = {
  id: string
  /**
   * Original Reddit post name (e.g. "t3_abc123"). Used as the `after` pagination
   * cursor. For gallery posts the `id` is a composite "postName_mediaId" which
   * Reddit does not accept as a cursor, so we store them separately.
   */
  postName: string
  title: string
  /** Thumbnail / preview URL shown in the grid */
  url: string
  /** Full-quality original image URL used by the lightbox (image posts only) */
  fullUrl?: string
  /** iframe embed URL for video/gif posts (e.g. redgifs). When set, the
   *  lightbox shows an iframe instead of an <img>. */
  embedUrl?: string
}

/**
 * Platform-aware Reddit GET request:
 * - Native Capacitor: uses Http plugin (bypasses CORS at the OS level)
 * - Local browser (localhost/127.0.0.1): routes through Vite dev/preview proxy
 *   (/reddit-api → reddit.com) because Reddit blocks CORS for localhost origins.
 * - Production web (GitHub Pages etc.): calls Reddit API directly.
 */
async function redditGet(
  url: string,
  params: Record<string, string>
): Promise<any[] | false> {
  if (Capacitor.isNativePlatform()) {
    const res = await Http.get({ url, params })
    if (res.status !== 200) return false
    return res.data.data.children
  }

  const query = new URLSearchParams(params).toString()
  const apiUrl = query ? `${url}?${query}` : url

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  const fetchUrl = isLocal
    ? apiUrl.replace('https://www.reddit.com', '/reddit-api')
    : apiUrl

  const res = await fetch(fetchUrl)
  if (!res.ok) return false
  const json = await res.json()
  return json.data.children
}

/** Map Reddit MIME type to file extension */
function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  }
  return map[mime] ?? 'jpg'
}

/** Non-image hosts that should be skipped */
const SKIP_URL_PREFIXES = [
  'https://macdesktops.com/index.phtml',
  'https://gfycat.com',
  'https://v.redd.it',
  'https://youtu.be'
]

/**
 * Convert a single raw Reddit post into zero, one, or many Post objects.
 * Gallery posts are expanded into individual images.
 */
function extractPosts(raw: any, subreddit: string): Post[] {
  const item = raw.data

  // Skip text-only posts
  if (item.is_self) return []

  // Skip links back to the same subreddit's comment threads
  if (item.url.startsWith(`https://www.reddit.com/r/${subreddit}/comments`))
    return []

  // Skip non-image hosting sites
  if (SKIP_URL_PREFIXES.some((p) => item.url.startsWith(p))) return []
  if (item.url.endsWith('.gifv')) return []

  // ── Gallery post (multiple images) ────────────────────────────────────────
  if (item.is_gallery && item.gallery_data?.items && item.media_metadata) {
    const images: Post[] = []

    for (const { media_id, is_deleted } of item.gallery_data.items) {
      if (is_deleted) continue

      const meta = item.media_metadata[media_id]
      if (!meta || meta.status !== 'valid' || meta.e !== 'Image') continue

      // Grid thumbnail: use the largest CDN preview (≤ 1080px) for fast loading
      const previews: Array<{ x: number; u: string }> = meta.p ?? []
      const bestPreview = previews.at(-1)
      const thumbnailUrl = bestPreview
        ? bestPreview.u.replace(/&amp;/g, '&')
        : meta.s?.u?.replace(/&amp;/g, '&')
      if (!thumbnailUrl) continue

      // Lightbox original: i.redd.it direct URL, no CDN compression
      const ext = mimeToExt(meta.m)
      const fullUrl = `https://i.redd.it/${media_id}.${ext}`

      images.push({
        id: `${item.name}_${media_id}`,
        postName: item.name,
        title: item.title,
        url: thumbnailUrl,
        fullUrl
      })
    }

    return images
  }

  // ── Redgifs post ───────────────────────────────────────────────────────────
  if (item.url.startsWith('https://www.redgifs.com/watch/')) {
    // Thumbnail: prefer the Reddit-hosted external preview, fall back to oembed thumbnail
    const previewUrl: string | undefined =
      item.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') ??
      item.media?.oembed?.thumbnail_url
    if (!previewUrl) return []

    const slug = item.url.replace('https://www.redgifs.com/watch/', '')
    return [
      {
        id: item.name,
        postName: item.name,
        title: item.title,
        url: previewUrl,
        embedUrl: `https://www.redgifs.com/ifr/${slug}?autoplay=1`
      }
    ]
  }

  // ── Single image post ──────────────────────────────────────────────────────
  // Skip gallery index pages that slipped through
  if (item.url.startsWith('https://www.reddit.com/gallery')) return []

  return [{ id: item.name, postName: item.name, title: item.title, url: item.url }]
}

export const getPosts = async (
  subreddit: string,
  query: string,
  after: string,
  sort: SortType = 'hot'
) => {
  const params: Record<string, string> = {
    restrict_sr: '1',
    nsfw: '1',
    include_over_18: 'on'
  }
  if (query) {
    params.q = query
    params.sort = sort
  }
  if (after) {
    params.after = after
  }

  const url = query
    ? `https://www.reddit.com/r/${subreddit}/search.json`
    : `https://www.reddit.com/r/${subreddit}/${sort}.json`

  const posts = await redditGet(url, params)
  if (!Array.isArray(posts)) return false

  return posts.flatMap((post) => extractPosts(post, subreddit))
}
