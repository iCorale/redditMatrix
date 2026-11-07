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

function boxOfId(fragment, id) {
  if (!id) return null
  const safe = String(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // A gallery's first <img> for an id is often the carousel slide without a size.
  const re = new RegExp('<img\\b[^>]*' + safe + '[^>]*>', 'gi')
  let match
  while ((match = re.exec(fragment))) {
    const x = Number(attr(match[0], 'width'))
    const y = Number(attr(match[0], 'height'))
    if (x > 0 && y > 0) return { x, y }
  }
  return null
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

function usableCover(url) {
  if (/[?&]blur=/i.test(url)) return false
  if (/snoovatar|profileicon|award_images|\/styles\/|\/emoji\//i.test(url)) return false
  return true
}

function firstClearUrl(text, source) {
  const re = new RegExp(source, 'gi')
  let match
  while ((match = re.exec(text))) {
    if (usableCover(match[0])) return match[0]
  }
  return ''
}

function coverUrl(html) {
  const text = decodeEntities(html)
  const patterns = [
    'https:\\/\\/media\\.redgifs\\.com\\/[^\\s"\'<>]+-poster\\.[a-z0-9]+',
    'https:\\/\\/thumbs\\d*\\.redgifs\\.com\\/[^\\s"\'<>]+',
    'https:\\/\\/i\\.redd\\.it\\/[a-z0-9]+\\.(?:jpe?g|png|gif|webp)',
    'https:\\/\\/preview\\.redd\\.it\\/[^\\s"\'<>]+',
    'https:\\/\\/external-preview\\.redd\\.it\\/[^\\s"\'<>]+'
  ]
  for (let i = 0; i < patterns.length; i++) {
    const found = firstClearUrl(text, patterns[i])
    if (found) return found
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

function epochSeconds(stamp) {
  const iso = String(stamp || '')
    .replace(/\.(\d{3})\d*/, '.$1')
    .replace(/([+-]\d\d)(\d\d)$/, '$1:$2')
  const ms = Date.parse(iso)
  return ms > 0 ? ms / 1000 : 0
}

function countOf(value) {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function withMeta(data, meta) {
  if (meta.author) data.author = meta.author
  if (meta.score != null) data.score = meta.score
  if (meta.comments != null) data.num_comments = meta.comments
  if (meta.created) data.created_utc = meta.created
  if (meta.permalink) data.permalink = meta.permalink
  return data
}

function feedMeta(tag) {
  return {
    author: attr(tag, 'author'),
    score: countOf(attr(tag, 'score')),
    comments: countOf(attr(tag, 'comment-count')),
    created: epochSeconds(attr(tag, 'created-timestamp')),
    permalink: attr(tag, 'permalink')
  }
}

function searchMeta(slice) {
  const author = slice.match(/"profile"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/)
  const counts = slice.match(
    /search-counter-row[\s\S]*?<faceplate-number[^>]*\bnumber="(\d+)"[\s\S]*?<faceplate-number[^>]*\bnumber="(\d+)"/
  )
  const stamp = slice.match(/<faceplate-timeago[^>]*\bts="([^"]+)"/)
  const link = slice.match(/href="(\/r\/[^"/]+\/comments\/[^"]+)"/)
  return {
    author: author ? author[1] : '',
    score: counts ? countOf(counts[1]) : null,
    comments: counts ? countOf(counts[2]) : null,
    created: stamp ? epochSeconds(stamp[1]) : 0,
    permalink: link ? link[1] : ''
  }
}

function parsePosts(html) {
  if (!html || /Prove your humanity|g-recaptcha|blocked by network security/i.test(html)) return null
  // Past the last post Reddit still answers 200 with a bare partial (loaders, no posts): the list has ended.
  if (!html.includes('<shreddit-post')) return /<faceplate-|<ac-track|<ac-publish/i.test(html) ? [] : null

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
    const meta = feedMeta(tag)

    if (type === 'gallery' && images.length) {
      seen.add(name)
      const media_metadata = {}
      for (const image of images) {
        const box = boxOfId(tag + body, image.id)
        media_metadata[image.id] = {
          status: 'valid',
          e: 'Image',
          m: mimeFor(image.ext),
          s: box ? { u: image.url, x: box.x, y: box.y } : { u: image.url },
          p: [{ x: 1080, u: image.url }]
        }
      }
      children.push({
        data: withMeta({
          name,
          title,
          url: images[0].url,
          is_self: false,
          over_18: nsfw,
          is_gallery: true,
          gallery_data: { items: images.map((image) => ({ media_id: image.id })) },
          media_metadata
        }, meta)
      })
      continue
    }

    if (slug) {
      seen.add(name)
      const poster = coverUrl(tag + body)
      const data = withMeta({
        name,
        title,
        url: `https://www.redgifs.com/watch/${slug}`,
        is_self: false,
        over_18: nsfw
      }, meta)
      if (poster) data.preview = { images: [{ source: { url: poster } }] }
      const box = boxOfId(tag + body, slug)
      if (box) {
        data.width = box.x
        data.height = box.y
      }
      children.push({ data })
      continue
    }

    const direct = images[0]?.url || (/^https?:\/\/i\.redd\.it\//i.test(href) ? href : '')
    if (!direct) continue
    seen.add(name)
    const single = withMeta({
      name,
      title,
      url: direct,
      is_self: false,
      over_18: nsfw
    }, meta)
    const box = boxOfId(tag + body, images[0]?.id || '')
    if (box) {
      single.width = box.x
      single.height = box.y
    }
    children.push({ data: single })
  }

  return children
}

function trackerSlice(html, thingIndex) {
  const start = html.lastIndexOf('<search-telemetry-tracker', thingIndex)
  if (start < 0) return ''
  const open = '<search-telemetry-tracker'
  const close = '</search-telemetry-tracker>'
  let depth = 0
  let i = start
  while (i < html.length) {
    const nextOpen = html.indexOf(open, i)
    const nextClose = html.indexOf(close, i)
    if (nextClose < 0) break
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++
      i = nextOpen + open.length
      continue
    }
    depth--
    i = nextClose + close.length
    if (depth === 0) return html.slice(start, i)
  }
  return ''
}

function parseSearchPosts(html) {
  if (!html || html.includes('Prove your humanity')) return null
  if (!html.includes('data-thingid="t3_')) return []
  const children = []
  const seen = new Set()
  const re = /data-thingid="(t3_[a-z0-9]+)"/gi
  let match
  while ((match = re.exec(html))) {
    const name = match[1]
    if (seen.has(name)) continue
    const slice = decodeEntities(trackerSlice(html, match.index))
    if (!slice) continue
    const titleMatch = slice.match(/"title"\s*:\s*"((?:\\.|[^"\\])*)"/)
    const title = titleMatch
      ? titleMatch[1]
          .replace(/\\"/g, '"')
          .replace(/\\u([0-9a-f]{4})/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
      : ''
    const nsfw = /"nsfw"\s*:\s*true/.test(slice.slice(0, 2500))
    const slug = redgifsSlug(slice)
    const images = collectImages(slice)
    const meta = searchMeta(slice)
    if (slug) {
      seen.add(name)
      const poster = coverUrl(slice) || images[0]?.url || ''
      const data = withMeta({
        name,
        title,
        url: `https://www.redgifs.com/watch/${slug}`,
        is_self: false,
        over_18: nsfw
      }, meta)
      if (poster) data.preview = { images: [{ source: { url: poster } }] }
      children.push({ data })
      continue
    }
    const direct = images[0]?.url
    if (!direct) continue
    seen.add(name)
    if (images.length > 1) {
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
        data: withMeta({
          name,
          title,
          url: direct,
          is_self: false,
          over_18: nsfw,
          is_gallery: true,
          gallery_data: { items: images.map((image) => ({ media_id: image.id })) },
          media_metadata
        }, meta)
      })
      continue
    }
    children.push({
      data: withMeta({
        name,
        title,
        url: direct,
        is_self: false,
        over_18: nsfw
      }, meta)
    })
  }
  return children
}
