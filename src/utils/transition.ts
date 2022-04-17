import { elasticOut } from 'svelte/easing'
export function spinup(node: HTMLElement, params) {
  const existingTransform = getComputedStyle(node).transform.replace('none', '')

  return {
    delay: params.delay || 0,
    duration: params.duration || 1000,
    easing: params.easing || elasticOut,
    css: (t, u) =>
      `transform: rotate(${90 * u}deg) ${existingTransform} scale(${t})`
  }
}
