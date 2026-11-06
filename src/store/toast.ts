import { writable } from 'svelte/store'

export type Toast = {
  id: number
  message: string
  action?: { label: string; run: () => void }
}

export const toast = writable<Toast | null>(null)

let seq = 0
let timer: ReturnType<typeof setTimeout> | undefined

export function showToast(message: string, action?: Toast['action'], duration = 2600) {
  clearTimeout(timer)
  const id = ++seq
  toast.set({ id, message, action })
  timer = setTimeout(() => {
    toast.update((current) => (current?.id === id ? null : current))
  }, duration)
}

export function dismissToast() {
  clearTimeout(timer)
  toast.set(null)
}
