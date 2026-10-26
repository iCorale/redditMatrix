importScripts('parse.js')

const PARTIAL = 'text/vnd.reddit.partial+html, text/html'
const PAGE_TARGET = 50
const MAX_PAGES = 4

function feedUrlFromAppUrl(appUrl) {
  let url
  try {
    url = new URL(appUrl)
  } catch {
    return null
  }
  const match = url.pathname.match(/\/r\/([^/]+)\/([^/]+)\.json$/)
  if (!match) return null
  const kind = match[2]
  const target = {
    subreddit: decodeURIComponent(match[1]),
    kind,
    after: url.searchParams.get('after') || '',
    query: url.searchParams.get('q') || '',
    sort: url.searchParams.get('sort') || ''
  }
  if (kind === 'search' && !target.query) return null
  return target
}

const SEARCH_SORTS = new Set(['relevance', 'hot', 'new', 'top', 'comments'])

function searchSort(sort) {
  if (sort === 'best') return 'relevance'
  if (sort === 'rising') return 'hot'
  return SEARCH_SORTS.has(sort) ? sort : 'relevance'
}

function searchPageUrl(target, cursor) {
  const feed = new URL(`https://www.reddit.com/svc/shreddit/r/${encodeURIComponent(target.subreddit)}/search/`)
  feed.searchParams.set('q', target.query)
  feed.searchParams.set('type', 'posts')
  feed.searchParams.set('sort', searchSort(target.sort))
  if (cursor) feed.searchParams.set('cursor', cursor)
  return feed.toString()
}

function nextSearchCursor(html, current) {
  const text = html.replace(/&amp;/g, '&')
  for (const match of text.matchAll(/[?&]cursor=([^"'&\s]+)/g)) {
    let value = match[1]
    try {
      value = decodeURIComponent(value)
    } catch {
      continue
    }
    if (value && value !== current) return value
  }
  return ''
}

const searchCursorAfter = new Map()

function feedUrlFor(target, after) {
  const feed = new URL(`https://www.reddit.com/svc/shreddit/community-more-posts/${target.kind}/`)
  feed.searchParams.set('name', target.subreddit)
  feed.searchParams.set('feedLength', String(PAGE_TARGET))
  if (target.kind === 'top') feed.searchParams.set('t', 'day')
  if (after) feed.searchParams.set('after', btoa(after))
  return feed.toString()
}

async function fetchPartial(feedUrl) {
  const res = await fetch(feedUrl, {
    credentials: 'include',
    headers: { Accept: PARTIAL }
  })
  if (!res.ok) return ''
  return res.text()
}

async function waitForTab(tabId) {
  const existing = await chrome.tabs.get(tabId)
  if (existing.status === 'complete') return
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(onUpdated)
      reject(new Error('Reddit tab timed out'))
    }, 20000)
    function onUpdated(id, info) {
      if (id === tabId && info.status === 'complete') {
        clearTimeout(timer)
        chrome.tabs.onUpdated.removeListener(onUpdated)
        resolve()
      }
    }
    chrome.tabs.onUpdated.addListener(onUpdated)
  })
}

let challengeTabId = null

async function fetchPartialFromTab(target, feedUrl) {
  let tabId = challengeTabId
  try {
    if (tabId != null) await chrome.tabs.get(tabId)
    else throw new Error('no tab')
  } catch {
    const tab = await chrome.tabs.create({
      url: `https://www.reddit.com/r/${target.subreddit}/${target.kind}/`,
      active: false
    })
    tabId = tab.id
    challengeTabId = tabId
    await waitForTab(tabId)
  }

  await chrome.scripting.executeScript({ target: { tabId }, files: ['parse.js'] })
  const [injected] = await chrome.scripting.executeScript({
    target: { tabId },
    args: [feedUrl, PARTIAL],
    func: async (feedUrl, accept) => {
      const res = await fetch(feedUrl, {
        credentials: 'include',
        headers: { Accept: accept }
      })
      const html = await res.text()
      return typeof parsePosts === 'function' ? parsePosts(html) : null
    }
  })
  return injected?.result ?? null
}

async function htmlFromTab(target, feedUrl) {
  let tabId = challengeTabId
  try {
    if (tabId != null) await chrome.tabs.get(tabId)
    else throw new Error('no tab')
  } catch {
    const tab = await chrome.tabs.create({
      url: `https://www.reddit.com/r/${target.subreddit}/`,
      active: false
    })
    tabId = tab.id
    challengeTabId = tabId
    await waitForTab(tabId)
  }
  const [injected] = await chrome.scripting.executeScript({
    target: { tabId },
    args: [feedUrl, PARTIAL],
    func: async (feedUrl, accept) => {
      const res = await fetch(feedUrl, {
        credentials: 'include',
        headers: { Accept: accept }
      })
      return res.text()
    }
  })
  return injected?.result || ''
}

async function searchBatch(target, after) {
  const key = `${target.subreddit}\n${target.query}\n${searchSort(target.sort)}`
  const cursorKey = `${key}\n${after}`
  if (after && !searchCursorAfter.has(cursorKey)) return []
  const cursor = after ? searchCursorAfter.get(cursorKey) : ''
  const pageUrl = searchPageUrl(target, cursor)
  let html = await fetchPartial(pageUrl)
  let posts = parseSearchPosts(html)
  if (!posts) {
    html = await htmlFromTab(target, pageUrl)
    posts = parseSearchPosts(html)
  }
  if (!posts) return null
  const next = nextSearchCursor(html, cursor)
  const lastName = posts[posts.length - 1]?.data?.name
  if (next && lastName) searchCursorAfter.set(`${key}\n${lastName}`, next)
  return posts
}

async function postsFrom(target, after) {
  if (target.kind === 'search') return searchBatch(target, after)
  const feedUrl = feedUrlFor(target, after)
  const direct = parsePosts(await fetchPartial(feedUrl))
  if (direct) return direct
  return fetchPartialFromTab(target, feedUrl)
}

function watchSlug(child) {
  const url = child?.data?.url || ''
  const match = url.match(/redgifs\.com\/watch\/([a-z0-9-]+)/i)
  return match ? match[1] : ''
}

function stillFromGif(gif) {
  const urls = gif?.urls || {}
  for (const url of [urls.thumbnail, urls.poster]) {
    if (typeof url !== 'string' || !url.startsWith('https://')) continue
    if (/\.(mp4|webm|m3u8)(\?|$)/i.test(url)) continue
    return url
  }
  return ''
}

let rgToken = ''
let rgTokenAt = 0

async function redgifsToken(force) {
  if (!force && rgToken && Date.now() - rgTokenAt < 10 * 60 * 1000) return rgToken
  const res = await fetch('https://api.redgifs.com/v2/auth/temporary', {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) throw new Error(`redgifs auth ${res.status}`)
  const json = await res.json()
  if (!json?.token) throw new Error('redgifs auth missing token')
  rgToken = json.token
  rgTokenAt = Date.now()
  return rgToken
}

async function posterForSlug(slug, token) {
  const res = await fetch(`https://api.redgifs.com/v2/gifs/${encodeURIComponent(slug)}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'x-customheader': `https://www.redgifs.com/watch/${slug}`
    }
  })
  if (res.status === 401) return { unauthorized: true, poster: '' }
  if (!res.ok) return { unauthorized: false, poster: '' }
  const json = await res.json()
  return { unauthorized: false, poster: stillFromGif(json?.gif) }
}

async function attachRedgifsPosters(children) {
  const need = children.filter((child) => watchSlug(child))
  if (!need.length) return

  let token
  try {
    token = await redgifsToken(false)
  } catch (err) {
    console.error(err)
    return
  }

  const missed = []
  await Promise.all(
    need.map(async (child) => {
      try {
        const result = await posterForSlug(watchSlug(child), token)
        if (result.unauthorized) missed.push(child)
        else if (result.poster) {
          child.data.preview = { images: [{ source: { url: result.poster } }] }
        }
      } catch (err) {
        console.error(err)
      }
    })
  )
  if (!missed.length) return

  try {
    token = await redgifsToken(true)
  } catch (err) {
    console.error(err)
    return
  }
  await Promise.all(
    missed.map(async (child) => {
      try {
        const result = await posterForSlug(watchSlug(child), token)
        if (result.poster) {
          child.data.preview = { images: [{ source: { url: result.poster } }] }
        }
      } catch (err) {
        console.error(err)
      }
    })
  )
}

async function listingFor(appUrl) {
  const target = feedUrlFromAppUrl(appUrl)
  if (!target) return null

  const children = []
  const seen = new Set()
  let after = target.after
  for (let page = 0; page < MAX_PAGES && children.length < PAGE_TARGET; page++) {
    const batch = await postsFrom(target, after)
    if (batch == null) return children.length ? { data: { children } } : null
    if (!batch.length) break
    const before = children.length
    for (const child of batch) {
      const name = child?.data?.name
      if (!name || seen.has(name)) continue
      seen.add(name)
      children.push(child)
    }
    if (children.length === before) break
    after =
      target.kind === 'search'
        ? batch[batch.length - 1]?.data?.name || after
        : children[children.length - 1].data.name
  }
  if (!children.length) return { data: { children: [] } }

  await attachRedgifsPosters(children)
  return { data: { children } }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'rm-req') return
  listingFor(message.url)
    .then((body) => sendResponse({ body }))
    .catch((err) => {
      console.error(err)
      sendResponse({ body: null })
    })
  return true
})
