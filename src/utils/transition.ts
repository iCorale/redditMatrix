import { elasticOut } from 'svelte/easing'
export function spinup(
  node: HTMLElement,
  params: { delay?: number; duration?: number; easing?: (t: number) => number } = {}
) {
  const existingTransform = getComputedStyle(node).transform.replace('none', '')

  return {
    delay: params.delay || 0,
    duration: params.duration || 1000,
    easing: params.easing || elasticOut,
    css: (t: number, u: number) =>
      `transform: rotate(${90 * u}deg) ${existingTransform} scale(${t})`
  }
}
