import { writable } from 'svelte/store'

export const posts = writable([])
export const loading = writable<boolean>(false)
export const drawer = writable<boolean>(false)
type ModeLiterals = 'search' | 'idle' | 'selection'
export const mode = writable<ModeLiterals>('idle')
export const query = writable<string>('')
