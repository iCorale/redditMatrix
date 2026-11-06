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
  /** Redgifs embed id, kept so the lightbox can resolve the HD file. */
  embedUrl?: string
  /** Pixel size when known. The grid reserves a box before the original loads. */
  width?: number
  height?: number
  author?: string
  score?: number
  comments?: number
  /** Milliseconds since the epoch. */
  createdAt?: number
  /** Path on reddit.com, e.g. "/r/pics/comments/abc123/title/". */
  permalink?: string
}

/**
 * The Chrome extension intercepts listing fetches and reads Reddit in this
 * browser. Without the extension the request cannot be read.
 */
async function redditGet(
  url: string,
  params: Record<string, string>
): Promise<any[] | false> {
  const query = new URLSearchParams(params).toString()
  const apiUrl = query ? `${url}?${query}` : url

  try {
    const res = await fetch(apiUrl)
    if (!res.ok) return false
    const json = await res.json()
    const children = json?.data?.children
    return Array.isArray(children) ? children : false
  } catch {
    return false
  }
}

/** Width and height from a post or its preview, when Reddit provided both. */
function pixelSize(item: any): { width?: number; height?: number } {
  const source = item?.preview?.images?.[0]?.source
  const width = Number(item?.width ?? source?.width)
  const height = Number(item?.height ?? source?.height)
  if (!(width > 0 && height > 0)) return {}
  return { width, height }
}

function pixelSizeMeta(meta: any): { width?: number; height?: number } {
  const width = Number(meta?.s?.x)
  const height = Number(meta?.s?.y)
  if (!(width > 0 && height > 0)) return {}
  return { width, height }
}

function postMeta(item: any): Partial<Post> {
  const meta: Partial<Post> = {}
  const author = item?.author
  if (typeof author === 'string' && author && author !== '[deleted]') meta.author = author
  const score = Number(item?.score)
  if (item?.score != null && Number.isFinite(score)) meta.score = score
  const comments = Number(item?.num_comments)
  if (item?.num_comments != null && Number.isFinite(comments)) meta.comments = comments
  const created = Number(item?.created_utc)
  if (created > 0) meta.createdAt = created * 1000
  const permalink = item?.permalink
  if (typeof permalink === 'string' && permalink.startsWith('/r/')) meta.permalink = permalink
  return meta
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

/** A frosted preview, watch page, or author avatar is not a usable cover. */
export function sharpCover(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  if (/[?&]blur=/i.test(value)) return ''
  if (/snoovatar|profileicon|award_images|\/styles\/|\/emoji\//i.test(value)) return ''
  if (/redgifs\.com\/(?:watch|ifr)\//i.test(value)) return ''
  return value
}

export type RedgifsMedia = { poster: string; video: string }

const redgifsCache = new Map<string, RedgifsMedia>()
const redgifsInflight = new Map<string, Promise<RedgifsMedia | false>>()

export function redgifsSlug(embedUrl: string): string {
  return /\/ifr\/([a-z0-9-]+)/i.exec(embedUrl)?.[1] || ''
}

export function peekRedgifsMedia(slug: string): RedgifsMedia | undefined {
  return redgifsCache.get(slug.toLowerCase())
}

function videoFile(value: unknown): string {
  if (typeof value !== 'string' || !/^https:\/\/media\.redgifs\.com\//i.test(value)) return ''
  if (!/\.mp4(\?|$)/i.test(value)) return ''
  return value
}

/** Poster plus HD file. `false` when the lookup failed and can be retried. */
export async function getRedgifsMedia(slug: string): Promise<RedgifsMedia | false> {
  const key = slug.toLowerCase()
  const cached = redgifsCache.get(key)
  if (cached) return cached
  let pending = redgifsInflight.get(key)
  if (!pending) {
    pending = fetchRedgifsMedia(slug).finally(() => redgifsInflight.delete(key))
    redgifsInflight.set(key, pending)
  }
  return pending
}

async function fetchRedgifsMedia(slug: string): Promise<RedgifsMedia | false> {
  try {
    const res = await fetch(
      `https://www.reddit.com/svc/rm/redgifs-poster.json?slug=${encodeURIComponent(slug)}`
    )
    if (!res.ok) return false
    const json = await res.json()
    if (typeof json?.url !== 'string') return false
    const media = { poster: json.url, video: videoFile(json.video) }
    redgifsCache.set(slug.toLowerCase(), media)
    return media
  } catch {
    return false
  }
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
  const meta = postMeta(item)

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

      const media = item.media_metadata[media_id]
      if (!media || media.status !== 'valid' || media.e !== 'Image') continue

      // Grid thumbnail: use the largest CDN preview (≤ 1080px) for fast loading
      const previews: Array<{ x: number; u: string }> = media.p ?? []
      const bestPreview = previews.at(-1)
      const thumbnailUrl = bestPreview
        ? bestPreview.u.replace(/&amp;/g, '&')
        : media.s?.u?.replace(/&amp;/g, '&')
      if (!thumbnailUrl) continue

      // Lightbox original: i.redd.it direct URL, no CDN compression
      const ext = mimeToExt(media.m)
      const direct = media.s?.u?.replace(/&amp;/g, '&')
      const fullUrl = direct?.includes('://i.redd.it/')
        ? direct
        : `https://i.redd.it/${media_id}.${ext}`

      images.push({
        id: `${item.name}_${media_id}`,
        postName: item.name,
        title: item.title,
        url: thumbnailUrl,
        fullUrl,
        ...pixelSizeMeta(media),
        ...meta
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
    /https?:\/\/(?:\w+\.)?redgifs\.com\/watch\/([a-z0-9-]+)/i
  )
  if (redgifsMatch) {
    const slug = redgifsMatch[1]

    const oembedThumb: string =
      item.media?.oembed?.thumbnail_url ??
      item.secure_media?.oembed?.thumbnail_url ??
      ''
    const fromPreview = item.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&')
    const fromThumbnail =
      typeof item.thumbnail === 'string' && item.thumbnail.startsWith('https://')
        ? item.thumbnail
        : ''
    const thumbUrl = [fromPreview, oembedThumb, fromThumbnail].find((value) => sharpCover(value)) || ''

    return [
      {
        id: item.name,
        postName: item.name,
        title: item.title,
        url: thumbUrl,
        embedUrl: `https://www.redgifs.com/ifr/${slug}`,
        ...pixelSize(item),
        ...meta
      }
    ]
  }

  // ── Single image post ──────────────────────────────────────────────────────
  // Skip gallery index pages that slipped through
  if (item.url.startsWith('https://www.reddit.com/gallery')) return []

  return [
    { id: item.name, postName: item.name, title: item.title, url: item.url, ...pixelSize(item), ...meta }
  ]
}

export const getPosts = async (
  subreddit: string,
  query: string,
  after: string,
  sort: SortType = 'hot',
  range = 'week'
) => {
  const params: Record<string, string> = {
    restrict_sr: '1',
    nsfw: '1',
    include_over_18: 'on'
  }
  if (query) {
    params.q = query
    params.sort = sort
  } else if (sort === 'top') {
    params.t = range
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

  // Drop posts where we still have no thumbnail (card would be invisible anyway).
  // Redgifs can still be opened from the play button when the cover is missing.
  return extracted.filter((p) => p.url || p.embedUrl)
}

/** Related communities from the subreddit's community info. `false` when unread. */
export async function getRelated(subreddit: string): Promise<string[] | false> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/related.json`
    )
    if (!res.ok) return false
    const json = await res.json()
    const names = json?.names
    if (!Array.isArray(names)) return false
    return names.filter(
      (name: unknown): name is string =>
        typeof name === 'string' && /^[A-Za-z0-9_]+$/.test(name)
    )
  } catch {
    return false
  }
}
