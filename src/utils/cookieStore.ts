/**
 * Persistent store for the Reddit session cookie.
 *
 * When set (via the hidden cookie dialog), the value is sent to the Worker as
 * the X-Reddit-Cookie header, which uses it to authenticate proxy requests.
 * Stored in localStorage so it survives page refreshes.
 */

const KEY = 'reddit_matrix_cookie'

export function getCookie(): string | null {
  return localStorage.getItem(KEY)
}

export function setCookie(value: string): void {
  if (value.trim()) {
    localStorage.setItem(KEY, value.trim())
  } else {
    clearCookie()
  }
}

export function clearCookie(): void {
  localStorage.removeItem(KEY)
}

export function hasCookie(): boolean {
  return (localStorage.getItem(KEY) || '').length > 0
}
