/**
 * Reddit Matrix API Proxy — Cloudflare Worker
 *
 * Proxies requests to the Reddit JSON API. Two auth modes (tried in order):
 *
 * 1. OAuth  – Application-only OAuth (anonymous, for production / shared use)
 * 2. Cookie – User session cookie (for local dev when OAuth creds unavailable)
 *
 * Set REDDIT_COOKIE in .dev.vars for cookie mode (bypasses OAuth entirely).
 * Set REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET for OAuth mode.
 */

// ── Config ────────────────────────────────────────────────────────────────────

const REDDIT_API = 'https://oauth.reddit.com'
const REDDIT_API_WWW = 'https://www.reddit.com'
const TOKEN_URL = 'https://www.reddit.com/api/v1/access_token'
const USER_AGENT = 'RedditMatrix/2.0 (Cloudflare Worker)'

const RATE_LIMIT = 60
const RATE_WINDOW = 60_000

// ── OAuth token cache ─────────────────────────────────────────────────────────

let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getOAuthToken(env: Env): Promise<string | null> {
  if (!env.REDDIT_CLIENT_ID || !env.REDDIT_CLIENT_SECRET) return null
  if (env.REDDIT_CLIENT_ID === 'placeholder') return null

  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const credentials = btoa(`${env.REDDIT_CLIENT_ID}:${env.REDDIT_CLIENT_SECRET}`)

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=https://oauth.reddit.com/grants/installed_client'
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`OAuth failed (${res.status}): ${text.slice(0, 200)}`)
    return null
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = data.access_token
  tokenExpiresAt = Date.now() + data.expires_in * 1000
  return cachedToken
}

// ── Rate limiter ──────────────────────────────────────────────────────────────

const rateMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

// ── CORS helpers ───────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Reddit-Cookie',
  'Access-Control-Max-Age': '86400'
}

function corsResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  })
}

// ── Env type ───────────────────────────────────────────────────────────────────

interface Env {
  REDDIT_CLIENT_ID?: string
  REDDIT_CLIENT_SECRET?: string
  REDDIT_COOKIE?: string
}

// ── Main handler ───────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method !== 'GET') {
      return corsResponse(405, { error: 'Method not allowed' })
    }

    const url = new URL(request.url)

    if (url.pathname === '/health') {
      return corsResponse(200, {
        status: 'ok',
        auth: env.REDDIT_COOKIE ? 'cookie' : 'oauth'
      })
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    if (isRateLimited(ip)) {
      return corsResponse(429, { error: 'Rate limited', retryAfter: RATE_WINDOW / 1000 })
    }

    const redditPath = url.pathname + url.search
    if (!redditPath.startsWith('/r/')) {
      return corsResponse(400, { error: 'Invalid path' })
    }

    // ── Choose auth strategy ──────────────────────────────────────────────

    // Check for per-request cookie from client (X-Reddit-Cookie header) first,
    // then fall back to the env REDDIT_COOKIE.
    const requestCookie =
      request.headers.get('X-Reddit-Cookie') || env.REDDIT_COOKIE || ''

    // Strategy 1: Cookie-based (per-request from client, or static env var)
    if (requestCookie) {
      try {
        const redditRes = await fetch(`${REDDIT_API_WWW}${redditPath}`, {
          headers: {
            'User-Agent': USER_AGENT,
            Cookie: requestCookie
          }
        })

        if (redditRes.status === 403) {
          return corsResponse(403, { error: 'Reddit 403 — cookie may have expired' })
        }
        if (redditRes.status === 404) {
          return corsResponse(404, { error: 'Subreddit not found' })
        }
        if (!redditRes.ok) {
          return corsResponse(502, { error: `Reddit API returned ${redditRes.status}` })
        }

        const data = await redditRes.json()
        return corsResponse(200, data)
      } catch (err) {
        console.error('Cookie proxy error:', String(err))
        return corsResponse(502, { error: 'Proxy error' })
      }
    }

    // Strategy 2: OAuth (anonymous, for production)
    try {
      const token = await getOAuthToken(env)
      if (!token) {
        return corsResponse(401, {
          error: 'No auth configured. Set REDDIT_COOKIE or REDDIT_CLIENT_ID+REDDIT_CLIENT_SECRET.'
        })
      }

      const redditRes = await fetch(`${REDDIT_API}${redditPath}`, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': USER_AGENT }
      })

      if (redditRes.status === 403) {
        return corsResponse(403, { error: 'Reddit 403 — subreddit may be private or banned' })
      }
      if (redditRes.status === 404) {
        return corsResponse(404, { error: 'Subreddit not found' })
      }
      if (!redditRes.ok) {
        return corsResponse(502, { error: `Reddit API returned ${redditRes.status}` })
      }

      const data = await redditRes.json()
      return corsResponse(200, data)
    } catch (err) {
      console.error('OAuth proxy error:', String(err))
      return corsResponse(502, { error: 'Proxy error' })
    }
  }
}
