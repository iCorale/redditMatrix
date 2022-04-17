import { writable } from 'svelte/store'
import { Storage } from '@capacitor/storage'

const root = document.documentElement

async function getInitialValue(key: string, set) {
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
export const searches = nativeStorageStore<string[]>('searches', [])

export type Theme = {
  accentColor: string
  backgroundColor: string
  foregroundColor: string
}

export const theme = nativeStorageStore<Theme>('theme', {
  accentColor: getComputedStyle(root).getPropertyValue('--accent-color').trim(),
  backgroundColor: getComputedStyle(root)
    .getPropertyValue('--background-color')
    .trim(),
  foregroundColor: getComputedStyle(root)
    .getPropertyValue('--foreground-color')
    .trim()
})
