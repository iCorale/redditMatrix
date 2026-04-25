import { writable } from 'svelte/store'
import type { Post, SortType } from '@utils/api'

export const posts = writable<Post[]>([])
export const loading = writable<boolean>(false)
export const drawer = writable<boolean>(false)
type ModeLiterals = 'search' | 'idle' | 'selection'
export const mode = writable<ModeLiterals>('idle')
export const query = writable<string>('')
export const sort = writable<SortType>('hot')
