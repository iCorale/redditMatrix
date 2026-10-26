import { get, writable } from 'svelte/store'

export type FeedPhase = 'idle' | 'preparing' | 'ended'
export type JumpDir = 'up' | 'down'

/** Fast-forward button state. Idle on pages that are not the image feed. */
export const feedPhase = writable<FeedPhase>('idle')
export const feedBound = writable(false)
/** True while a leap animation is driving scroll, so the button ignores that motion. */
export const feedLeaping = writable(false)

let jump: ((dir: JumpDir) => void) | null = null

export function bindFeedJump(fn: ((dir: JumpDir) => void) | null) {
  jump = fn
  feedBound.set(fn != null)
  if (!fn) {
    feedPhase.set('idle')
    feedLeaping.set(false)
  }
}

export function requestFeedJump(dir: JumpDir) {
  jump?.(dir)
}

export function setFeedLeaping(next: boolean) {
  if (get(feedLeaping) !== next) feedLeaping.set(next)
}

export function setFeedPhase(next: FeedPhase) {
  if (get(feedPhase) !== next) feedPhase.set(next)
}
