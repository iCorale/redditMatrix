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
  if (kind === 'search') return null
  return {
    subreddit: decodeURIComponent(match[1]),
    kind,
    after: url.searchParams.get('after') || ''
  }
}

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

async function postsFrom(target, after) {
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
    if (!batch?.length) break
    const before = children.length
    for (const child of batch) {
      const name = child?.data?.name
      if (!name || seen.has(name)) continue
      seen.add(name)
      children.push(child)
    }
    if (children.length === before) break
    after = children[children.length - 1].data.name
  }
  if (!children.length) return null

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
