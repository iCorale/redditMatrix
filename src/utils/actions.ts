function absorbEvent_(event: Event) {
  var e = event || window.event
  e.preventDefault && e.preventDefault()
  e.stopPropagation && e.stopPropagation()
  e.cancelBubble = true
  return false
}

export function longpress(
  node: HTMLElement,
  { callback, delay = 700 }: { callback: Function; delay?: number }
) {
  let isTouching = false
  let timer: number

  function handleTouchStart() {
    isTouching = true
    if (!timer) {
      timer = setTimeout(callback, delay)
    }
  }

  function handleTouchEnd(e) {
    isTouching = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  node.addEventListener('contextmenu', (e) => {
    if (isTouching) {
      absorbEvent_(e)
    }
  })

  node.addEventListener('touchstart', handleTouchStart)
  node.addEventListener('touchend', handleTouchEnd)
  node.addEventListener('touchmove', handleTouchEnd)
  // node.addEventListener('mousedown', handleTouchStart)
  // node.addEventListener('mouseup', handleTouchEnd)

  return {
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchend', handleTouchEnd)
      node.removeEventListener('touchmove', handleTouchEnd)
      // node.removeEventListener('mousedown', handleTouchStart)
      // node.removeEventListener('mouseup', handleTouchEnd)
    }
  }
}
