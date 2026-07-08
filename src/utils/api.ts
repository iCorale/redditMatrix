import { getCookie } from '@utils/cookieStore'

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
  /** iframe embed URL for video/gif posts (redgifs). Lightbox shows an iframe. */
  embedUrl?: string
}

/**
 * Worker proxy URL.
 *
 * In development (wrangler dev):  http://localhost:8787
 * In preview (vite preview):     served by the Vite proxy at /api → Worker
 * In production:                  https://reddit-matrix-api.<name>.workers.dev
 *
 * Set VITE_API_URL in .env.local to override.
 */
const WORKER_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Single code path for all platforms — every client talks to the Cloudflare
 * Worker, which handles OAuth and proxies to Reddit.
 */
async function redditGet(
  url: string,
  params: Record<string, string>
): Promise<any[] | false> {
  const query = new URLSearchParams(params).toString()
  const apiUrl = query ? `${url}?${query}` : url

  // Strip the Reddit base URL, keep only the path (e.g. /r/cats/hot.json?...)
  const path = apiUrl.replace(/^https?:\/\/[^/]+/, '')

  const headers: Record<string, string> = {}
  const cookie = getCookie()
  if (cookie) headers['X-Reddit-Cookie'] = cookie

  const res = await fetch(`${WORKER_URL}${path}`, { headers })

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
  // Matches all known URL shapes:
  //   https://www.redgifs.com/watch/<slug>
  //   https://redgifs.com/watch/<slug>
  //   http://v3.redgifs.com/watch/<slug>
  const redgifsMatch = item.url.match(
    /https?:\/\/(?:\w+\.)?redgifs\.com\/watch\/([a-z0-9]+)/i
  )
  if (redgifsMatch) {
    const slug = redgifsMatch[1]

    // Reddit puts oembed data in either `media` or `secure_media` (HTTPS links).
    // thumbnail_url is e.g. https://media.redgifs.com/PascalCaseName-poster.jpg
    // media.redgifs.com uses hotlink protection (Referer check). All <img> elements
    // that may point there carry referrerpolicy="no-referrer" (see Card.svelte).
    const oembedThumb: string =
      item.media?.oembed?.thumbnail_url ??
      item.secure_media?.oembed?.thumbnail_url ??
      ''

    // Thumbnail priority:
    //  1. Reddit CDN preview (external-preview.redd.it) — no hotlink restriction
    //  2. redgifs oembed poster (media.redgifs.com) — needs no-referrer on <img>
    //  3. item.thumbnail field
    const thumbUrl: string =
      item.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') ??
      (oembedThumb || undefined) ??
      (typeof item.thumbnail === 'string' && item.thumbnail.startsWith('https://')
        ? item.thumbnail
        : '')

    return [
      {
        id: item.name,
        postName: item.name,
        title: item.title,
        url: thumbUrl,
        embedUrl: `https://www.redgifs.com/ifr/${slug}`
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

  const extracted = posts.flatMap((post) => extractPosts(post, subreddit))

  // Drop posts where we still have no thumbnail (card would be invisible anyway)
  return extracted.filter((p) => p.url)
}
