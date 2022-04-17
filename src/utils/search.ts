import init, { get_matches } from 'fuzzy_complete'

const wasm = init()
// let timer
// function debounce(fn: Function, timeout = 100) {
//   return function (...args) {
//     if (!timer) {
//       fn(...args)
//       timer = setTimeout(() => {
//         timer = null
//       }, timeout)
//     } else {
//       clearTimeout(timer)
//       timer = null
//     }
//   }
// }

export const search = async (words: string[], pattern: string) => {
  await wasm
  return get_matches(words, pattern, 20)
}
