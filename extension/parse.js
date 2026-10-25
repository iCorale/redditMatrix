function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function attr(tag, name) {
  const match = new RegExp('(?:^|\\s)' + name + '="([^"]*)"', 'i').exec(tag)
  return match ? decodeEntities(match[1]) : ''
}

function splitTag(fragment) {
  let quote = ''
  for (let i = 0; i < fragment.length; i++) {
    const ch = fragment[i]
    if (quote) {
      if (ch === quote) quote = ''
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === '>') return { tag: fragment.slice(0, i), rest: fragment.slice(i + 1) }
  }
  return null
}

function redgifsSlug(html) {
  const text = html.replace(/&amp;/g, '&')
  const plain = text.match(/https?:\/\/(?:[\w.-]+\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9-]+)/i)
  if (plain) return plain[1]
  const encoded = text.match(/redgifs\.com(?:%2F|\/)(?:watch|ifr)(?:%2F|\/)([a-z0-9-]+)/i)
  if (encoded) return encoded[1]
  const poster = text.match(/media\.redgifs\.com\/([a-z0-9-]+)-poster/i)
  if (poster) return poster[1]
  return ''
}

function coverUrl(html) {
  const text = decodeEntities(html)
  const patterns = [
    /https:\/\/(?:external-preview|preview)\.redd\.it\/[^\s"'<>]+/i,
    /https:\/\/media\.redgifs\.com\/[^\s"'<>]+-poster\.[a-z0-9]+/i,
    /https:\/\/thumbs\d*\.redgifs\.com\/[^\s"'<>]+/i,
    /https:\/\/i\.redd\.it\/[a-z0-9]+\.(?:jpe?g|png|gif|webp)/i
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  return ''
}

function imageFromUrl(raw) {
  let url
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  if (/profileicon|snoovatar|\/styles\//i.test(url.pathname)) return null
  const base = decodeURIComponent(url.pathname.split('/').pop() || '')
  let filename = base
  if (host === 'preview.redd.it') {
    const hyphen = base.lastIndexOf('-')
    if (hyphen >= 0) filename = base.slice(hyphen + 1)
  } else if (host !== 'i.redd.it') {
    return null
  }
  const match = filename.match(/^([a-z0-9]+)\.(jpe?g|png|gif|webp)$/i)
  if (!match) return null
  const id = match[1].toLowerCase()
  const ext = match[2].toLowerCase()
  return { id, ext, url: `https://i.redd.it/${id}.${ext}` }
}

function collectImages(html) {
  const found = []
  const seen = new Set()
  const re = /https:\/\/(?:preview|i)\.redd\.it\/[^\s"'<>]+/gi
  let match
  while ((match = re.exec(html))) {
    const image = imageFromUrl(match[0])
    if (!image || seen.has(image.id)) continue
    seen.add(image.id)
    found.push(image)
  }
  return found
}

function imageFiles(html) {
  const found = []
  const seen = new Set()
  const re = /https:\/\/i\.redd\.it\/([a-z0-9]+)\.(jpe?g|png|gif|webp)/gi
  let match
  while ((match = re.exec(html))) {
    const id = match[1].toLowerCase()
    if (seen.has(id)) continue
    seen.add(id)
    const ext = match[2].toLowerCase()
    found.push({ id, ext, url: `https://i.redd.it/${id}.${ext}` })
  }
  return found
}

function galleryImages(html) {
  const text = decodeEntities(html)
  const carousel = text.match(/<gallery-carousel\b[\s\S]*?<\/gallery-carousel>/i)
  const fromCarousel = carousel ? collectImages(carousel[0]) : []
  return fromCarousel.length ? fromCarousel : collectImages(text)
}

function mimeFor(ext) {
  if (ext === 'png') return 'image/png'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

function parsePosts(html) {
  if (!html || html.includes('Prove your humanity') || !html.includes('<shreddit-post')) {
    return null
  }

  const children = []
  const seen = new Set()
  for (const part of html.split(/<shreddit-post(?=[\s>])/).slice(1)) {
    const split = splitTag(part)
    if (!split) continue
    const { tag, rest } = split
    if (/\bpromoted\b/i.test(tag)) continue

    const name = attr(tag, 'id')
    if (!name || seen.has(name)) continue
    const type = attr(tag, 'post-type')
    if (type === 'text' || type === 'self') continue

    const title = attr(tag, 'post-title')
    const href = attr(tag, 'content-href')
    const closeAt = rest.indexOf('</shreddit-post>')
    const body = closeAt > 0 ? rest.slice(0, closeAt) : rest
    const images = type === 'gallery' ? galleryImages(tag + body) : imageFiles(tag + body)
    const nsfw = /\bnsfw\b/i.test(tag)
    const slug = redgifsSlug(tag + body)

    if (type === 'gallery' && images.length) {
      seen.add(name)
      const media_metadata = {}
      for (const image of images) {
        media_metadata[image.id] = {
          status: 'valid',
          e: 'Image',
          m: mimeFor(image.ext),
          s: { u: image.url },
          p: [{ x: 1080, u: image.url }]
        }
      }
      children.push({
        data: {
          name,
          title,
          url: images[0].url,
          is_self: false,
          over_18: nsfw,
          is_gallery: true,
          gallery_data: { items: images.map((image) => ({ media_id: image.id })) },
          media_metadata
        }
      })
      continue
    }

    if (slug) {
      seen.add(name)
      const poster = coverUrl(tag + body)
      const data = {
        name,
        title,
        url: `https://www.redgifs.com/watch/${slug}`,
        is_self: false,
        over_18: nsfw
      }
      if (poster) data.preview = { images: [{ source: { url: poster } }] }
      children.push({ data })
      continue
    }

    const direct = images[0]?.url || (/^https?:\/\/i\.redd\.it\//i.test(href) ? href : '')
    if (!direct) continue
    seen.add(name)
    children.push({
      data: {
        name,
        title,
        url: direct,
        is_self: false,
        over_18: nsfw
      }
    })
  }

  return children
}
