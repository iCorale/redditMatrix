import { writable } from 'svelte/store'
import type { Post, SortType } from '@utils/api'

export const posts = writable<Post[]>([])
export const loading = writable<boolean>(false)
type ModeLiterals = 'search' | 'idle' | 'selection'
export const mode = writable<ModeLiterals>('idle')
export const query = writable<string>('')
export const sort = writable<SortType>('hot')

export type TopRange = 'day' | 'week' | 'month' | 'year' | 'all'
export const TOP_RANGES: TopRange[] = ['day', 'week', 'month', 'year', 'all']
const RANGE_KEY = 'redditMatrix:top-range'
const savedRange = localStorage.getItem(RANGE_KEY) as TopRange | null
/** Time window for the `top` sort. */
export const topRange = writable<TopRange>(
  savedRange && TOP_RANGES.includes(savedRange) ? savedRange : 'week'
)
topRange.subscribe((value) => localStorage.setItem(RANGE_KEY, value))
/** Incrementing counter — changing this value forces a content refresh in [subreddit].svelte */
export const refreshSignal = writable<number>(0)
