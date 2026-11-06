import { writable } from 'svelte/store'
import { Storage } from '@capacitor/storage'

const root = document.documentElement

async function getInitialValue<T>(key: string, set: (value: T) => void) {
  const { value } = await Storage.get({ key })
  value && set(JSON.parse(value))
}

function nativeStorageStore<T>(key: string, default_value: T) {
  const { subscribe, set, update } = writable(default_value)

  getInitialValue(key, set).catch((err) => console.error(err))

  subscribe(async (value: T) => {
    value !== default_value &&
      (await Storage.set({ key, value: JSON.stringify(value) }))
  })

  return {
    subscribe,
    set,
    update
  }
}

export const subreddits = nativeStorageStore<string[]>('subreddits', [])

export function rememberSubreddit(name: string) {
  const key = name.trim().toLowerCase()
  if (!key) return
  subreddits.update((items) => [key, ...items.filter((item) => item !== key)])
}
export function forgetSubreddit(name: string) {
  const key = name.trim().toLowerCase()
  subreddits.update((items) => items.filter((item) => item !== key))
}

export function restoreSubreddit(name: string, index: number) {
  const key = name.trim().toLowerCase()
  subreddits.update((items) => {
    const rest = items.filter((item) => item !== key)
    rest.splice(Math.min(Math.max(0, index), rest.length), 0, key)
    return rest
  })
}

export const searches = nativeStorageStore<string[]>('searches', [])

/** First picture last seen in each subreddit, keyed by lower-case name. */
export const covers = nativeStorageStore<Record<string, string>>('covers', {})

export function rememberCover(name: string, url: string) {
  const key = name.trim().toLowerCase()
  if (!key || !url) return
  covers.update((all) => (all[key] === url ? all : { ...all, [key]: url }))
}

export type Scheme = 'system' | 'dark' | 'light'
export const ACCENTS = ['rose', 'violet', 'sky', 'lime', 'amber'] as const
export type Accent = (typeof ACCENTS)[number]

export type Theme = {
  scheme: Scheme
  accent: Accent
  /** A hex colour picked by hand. Empty uses the preset. */
  customAccent: string
}

// The old `theme` key stored the colours read at first launch. Applying those
// would pin the page to whichever scheme the system had back then.
export const theme = nativeStorageStore<Theme>('theme.v2', {
  scheme: 'system',
  accent: 'rose',
  customAccent: ''
})

const systemLight =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: light)') : null

function isBright(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!match) return false
  const n = parseInt(match[1], 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 165
}

function applyTheme(value: Theme) {
  if (value.scheme === 'system') delete root.dataset.scheme
  else root.dataset.scheme = value.scheme
  if (value.accent && value.accent !== 'rose') root.dataset.accent = value.accent
  else delete root.dataset.accent
  if (value.customAccent) {
    root.style.setProperty('--accent-color', value.customAccent)
    root.style.setProperty(
      '--accent-2',
      `color-mix(in oklab, ${value.customAccent} 72%, #ffb36b)`
    )
    root.style.setProperty('--on-accent', isBright(value.customAccent) ? '#111114' : '#ffffff')
  } else {
    root.style.removeProperty('--accent-color')
    root.style.removeProperty('--accent-2')
    root.style.removeProperty('--on-accent')
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  const background = getComputedStyle(root).getPropertyValue('--background-color').trim()
  if (meta && background) meta.setAttribute('content', background)
}

let currentTheme: Theme | null = null
theme.subscribe((value) => {
  currentTheme = value
  applyTheme(value)
})
systemLight?.addEventListener('change', () => {
  if (currentTheme) applyTheme(currentTheme)
})
