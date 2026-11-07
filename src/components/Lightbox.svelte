<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte'
  const dispatch = createEventDispatcher()

  import Close from '~icons/mdi/close'
  import ChevronLeft from '~icons/mdi/chevron-left'
  import ChevronRight from '~icons/mdi/chevron-right'
  import Reddit from '~icons/mdi/reddit'
  import ShareVariant from '~icons/mdi/share-variant-outline'
  import LinkVariant from '~icons/mdi/link-variant'
  import MagnifyPlus from '~icons/mdi/magnify-plus-outline'
  import MagnifyMinus from '~icons/mdi/magnify-minus-outline'
  import VolumeOff from '~icons/mdi/volume-off'
  import VolumeHigh from '~icons/mdi/volume-high'
  import Fullscreen from '~icons/mdi/fullscreen'
  import ArrowUp from '~icons/mdi/arrow-up-bold-outline'
  import CommentOutline from '~icons/mdi/comment-outline'

  import { getRedgifsMedia, peekRedgifsMedia, redgifsSlug, sharpCover, type Post } from '@utils/api'
  import { dropSource, releaseImage } from '@utils/actions'
  import { showToast } from '@store/toast'

  export let posts: Post[] = []
  export let currentIndex: number = 0
  /** True while the parent is fetching the next batch in the background */
  export let loadingMore: boolean = false
  /** The listing has no more posts. */
  export let done: boolean = false

  $: current   = posts[currentIndex]
  $: url       = current?.fullUrl ?? current?.url ?? ''
  $: title     = current?.title ?? ''
  $: embedUrl  = current?.embedUrl ?? null
  $: shareUrl  = embedUrl ? embedUrl.replace('/ifr/', '/watch/') : url
  $: postUrl   = current ? `https://www.reddit.com${current.permalink || `/comments/${current.postName.replace(/^t3_/, '')}/`}` : ''
  $: gallery   = galleryAt(posts, currentIndex)
  let playback: 'loading' | 'video' | 'iframe' = 'loading'
  let playbackSlug = ''
  let videoUrl = ''
  let posterUrl = ''
  let videoEl: HTMLVideoElement | undefined
  let videoTall = true

  const SOUND_KEY = 'redditMatrix:sound'
  const SWIPED_KEY = 'redditMatrix:lightbox:swiped'
  const KEYS_HINT_KEY = 'redditMatrix:hint:lightbox-keys'

  function readFlag(key: string) {
    try {
      return localStorage.getItem(key) === '1'
    } catch {
      return false
    }
  }

  function writeFlag(key: string, on: boolean) {
    try {
      localStorage.setItem(key, on ? '1' : '0')
    } catch {}
  }

  let soundOn = readFlag(SOUND_KEY)
  /** After the first swipe the touch arrows give way to the gesture. */
  let swipedOnce = readFlag(SWIPED_KEY)

  /** Position inside a gallery post, which the listing splits into neighbours. */
  function galleryAt(list: Post[], index: number) {
    const name = list[index]?.postName
    if (!name) return null
    let start = index
    let end = index
    while (start > 0 && list[start - 1].postName === name) start--
    while (end < list.length - 1 && list[end + 1].postName === name) end++
    return end > start ? { at: index - start + 1, count: end - start + 1 } : null
  }

  function compact(n: number) {
    if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}万`
    return String(n)
  }

  function ago(ms: number) {
    const minutes = Math.max(0, Math.floor((Date.now() - ms) / 60000))
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} 小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} 天前`
    if (days < 365) return `${Math.floor(days / 30)} 个月前`
    return `${Math.floor(days / 365)} 年前`
  }

  // ── Share / copy ──────────────────────────────────────────────────────────
  async function copyLink() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast('已复制链接')
    } catch {
      showToast('复制失败，浏览器没有允许访问剪贴板')
    }
  }

  async function share() {
    if (!shareUrl) return
    if (canShare) {
      try {
        await navigator.share({ title, url: shareUrl })
        return
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return
      }
    }
    copyLink()
  }

  function openPost() {
    if (postUrl) window.open(postUrl, '_blank', 'noopener,noreferrer')
  }

  // ── Edge hints ────────────────────────────────────────────────────────────
  let hint = ''
  let hintTimer: ReturnType<typeof setTimeout> | undefined

  function flashHint(text: string, ms = 1400) {
    hint = text
    clearTimeout(hintTimer)
    hintTimer = setTimeout(() => {
      hint = ''
    }, ms)
  }

  /** The user pushed past either end. Past the last one it asks the parent for more. */
  function hitEdge(dir: -1 | 1) {
    if (dir < 0) {
      flashHint('已经是第一张')
      return
    }
    if (loadingMore) return
    if (done) {
      flashHint('已经是最后一张')
      return
    }
    dispatch('edge')
  }

  let swipeX = 0
  let swipeY = 0
  let swipeAt = 0
  let swipeBlocked = false
  let ignoreClick = false
  let wheelDx = 0
  let wheelDy = 0
  let wheelReady = true
  let wheelTimer: ReturnType<typeof setTimeout> | undefined
  let wheelPeak = 0
  let wheelTrough = Infinity
  let wheelFalling = false
  let wheelKind: 'mouse' | 'pad' | null = null
  let mouseStepAt = -Infinity
  let paused = true
  let started = false
  let currentTime = 0
  let duration = 0
  let scrubbing = false

  function syncPlayback(slug: string) {
    started = false
    currentTime = 0
    duration = 0
    const known = peekRedgifsMedia(slug)
    const still = known?.poster || sharpCover(url)
    if (known?.video) {
      posterUrl = still
      videoUrl = known.video
      playback = 'video'
      return
    }
    if (known) {
      posterUrl = still
      videoUrl = ''
      playback = 'iframe'
      return
    }
    posterUrl = sharpCover(url)
    videoUrl = ''
    playback = 'loading'
    const requested = slug
    getRedgifsMedia(requested).then((result) => {
      if (redgifsSlug(posts[currentIndex]?.embedUrl || '') !== requested) return
      const post = posts[currentIndex]
      const fallback = sharpCover(post?.fullUrl ?? post?.url ?? '')
      if (result && result.video) {
        posterUrl = result.poster || fallback
        videoUrl = result.video
        playback = 'video'
      } else {
        if (result && result.poster) posterUrl = result.poster
        videoUrl = ''
        playback = 'iframe'
      }
    })
  }

  function applySound(node: HTMLVideoElement) {
    const muted = !soundOn
    node.defaultMuted = muted
    node.muted = muted
    if (muted) node.setAttribute('muted', '')
    else node.removeAttribute('muted')
  }

  function toggleSound() {
    soundOn = !soundOn
    writeFlag(SOUND_KEY, soundOn)
    if (!videoEl) return
    applySound(videoEl)
    if (!videoEl.paused) videoEl.play().catch(() => {})
  }

  /** Without a recent tap the browser refuses sound; play muted rather than not at all. */
  function start(node: HTMLVideoElement) {
    node.play().catch((err) => {
      if ((err as DOMException)?.name !== 'NotAllowedError' || node.muted) return
      soundOn = false
      applySound(node)
      node.play().catch(() => {})
    })
  }

  function togglePlay() {
    const video = videoEl
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function onPlay() { paused = false; started = true }
  function onPause() { paused = true }

  function onTime() {
    const video = videoEl
    if (!video || scrubbing) return
    currentTime = video.currentTime
    if (isFinite(video.duration)) duration = video.duration
  }

  function clock(seconds: number) {
    const safe = isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
  }

  function seekTo(event: PointerEvent, scrub: HTMLElement) {
    const video = videoEl
    if (!video || !(video.duration > 0)) return
    const rect = scrub.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    video.currentTime = ratio * video.duration
    currentTime = video.currentTime
    duration = video.duration
  }

  function scrubStart(event: PointerEvent) {
    const scrub = event.currentTarget as HTMLElement
    scrubbing = true
    scrub.setPointerCapture(event.pointerId)
    seekTo(event, scrub)
  }

  function scrubMove(event: PointerEvent) {
    if (!scrubbing) return
    seekTo(event, event.currentTarget as HTMLElement)
  }

  function scrubEnd(event: PointerEvent) {
    if (!scrubbing) return
    seekTo(event, event.currentTarget as HTMLElement)
    scrubbing = false
  }

  function enterFullscreen() {
    const video = videoEl as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | undefined
    if (!video) return
    if (typeof video.webkitEnterFullscreen === 'function') {
      video.webkitEnterFullscreen()
      return
    }
    video.requestFullscreen?.().catch(() => {})
  }

  function onFullscreenChange() {
    const video = videoEl
    if (!video) return
    video.controls = document.fullscreenElement === video
  }

  function fitVideoBox() {
    const video = videoEl
    if (!video) return
    const vw = video.videoWidth || current?.width || 0
    const vh = video.videoHeight || current?.height || 0
    if (!(vw > 0 && vh > 0)) return
    const scale = Math.min(window.innerWidth / vw, window.innerHeight / vh)
    const height = Math.floor(vh * scale)
    video.style.width = `${Math.floor(vw * scale)}px`
    video.style.height = `${height}px`
    // Leaves room under the clip for the caption; otherwise it would sit on the scrub bar.
    videoTall = height > window.innerHeight - 150
    if (video.duration > 0) duration = video.duration
  }

  // ── Touch: the picture follows the finger ────────────────────────────────
  // Clips are never moved or faded: on iPhone a transformed video goes black.
  $: followable = !embedUrl
  let dragX = 0
  let dragY = 0
  let dragAxis: 'x' | 'y' | null = null
  let settling = false
  let touchMoved = false
  let tapBlocked = false
  let tapTimer: ReturnType<typeof setTimeout> | undefined
  let lastTap = { at: 0, x: 0, y: 0 }
  let viewW = 0
  let viewH = 0

  $: dragScale = dragAxis === 'y' ? Math.max(0.72, 1 - Math.abs(dragY) / (viewH * 1.6 || 1)) : 1
  $: fade = dragAxis === 'y' ? Math.max(0, 1 - Math.abs(dragY) / (viewH * 0.55 || 1)) : 1
  $: stageStyle =
    followable && !isZoomed && (dragX || dragY)
      ? `transform: translate3d(${dragX}px, ${dragY}px, 0) scale(${dragScale})`
      : ''

  function wait(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms))
  }

  function frame() {
    return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }

  function springBack() {
    settling = true
    dragX = 0
    dragY = 0
    setTimeout(() => {
      settling = false
      dragAxis = null
    }, 280)
  }

  async function slideTo(index: number, dir: -1 | 1) {
    if (!followable) {
      go(index)
      return
    }
    settling = true
    dragAxis = 'x'
    dragX = dir * (viewW + 48)
    await wait(190)
    settling = false
    go(index)
    dragX = -dir * viewW * 0.22
    await tick()
    await frame()
    settling = true
    dragX = 0
    await wait(280)
    settling = false
    dragAxis = null
  }

  function dismiss(dir: number) {
    if (!followable) {
      close()
      return
    }
    settling = true
    dragAxis = 'y'
    dragY = (dir || -1) * viewH * 0.6
    setTimeout(() => close('drag'), 170)
  }

  // ── Pinch ─────────────────────────────────────────────────────────────────
  let pinching = false
  let pinchD0 = 0
  let pinchMid0 = { x: 0, y: 0 }
  let pinchMid = { x: 0, y: 0 }
  let pinchScale = 1
  let pinchRect: DOMRect | null = null

  function touchPair(event: TouchEvent) {
    const [a, b] = [event.touches[0], event.touches[1]]
    return {
      distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
      mid: { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
    }
  }

  function startPinch(event: TouchEvent) {
    if (!imgEl) return
    const { distance, mid } = touchPair(event)
    pinching = true
    tapZoom = null
    pinchD0 = distance || 1
    beginScale(mid)
  }

  function beginScale(mid: { x: number; y: number }) {
    if (!imgEl) return
    clearTimeout(tapTimer)
    swipeBlocked = true
    tapBlocked = true
    dragX = 0
    dragY = 0
    dragAxis = null
    pinchMid0 = mid
    pinchMid = mid
    pinchScale = 1
    pinchRect = imgEl.getBoundingClientRect()
    imgEl.style.transition = 'none'
    imgEl.style.transformOrigin = `${mid.x - pinchRect.left}px ${mid.y - pinchRect.top}px`
  }

  // ── One thumb: tap, then hold the second tap and slide down to zoom in ────
  let tapZoom: { y: number; on: boolean } | null = null

  function moveTapZoom(touch: Touch) {
    if (!imgEl || !tapZoom) return
    const dy = touch.clientY - tapZoom.y
    if (!tapZoom.on) {
      if (Math.hypot(touch.clientX - swipeX, dy) <= 10) return
      tapZoom = { y: touch.clientY, on: true }
      beginScale({ x: swipeX, y: swipeY })
      return
    }
    const least = pinchRect ? Math.min(0.6, (0.6 * fitWidth()) / pinchRect.width) : 0.6
    pinchScale = Math.min(gestureCap(), Math.max(least, Math.exp(dy / 140)))
    imgEl.style.transform = `scale(${pinchScale})`
  }

  function movePinch(event: TouchEvent) {
    if (!imgEl || event.touches.length < 2) return
    const { distance, mid } = touchPair(event)
    pinchScale = Math.min(gestureCap(), Math.max(0.6, distance / pinchD0))
    pinchMid = mid
    imgEl.style.transform = `translate(${mid.x - pinchMid0.x}px, ${mid.y - pinchMid0.y}px) scale(${pinchScale})`
  }

  async function endPinch() {
    pinching = false
    const img = imgEl
    const rect = pinchRect
    if (!img || !rect) return
    const width = rect.width * pinchScale
    const fracX = (pinchMid0.x - rect.left) / rect.width
    const fracY = (pinchMid0.y - rect.top) / rect.height
    markGesture()
    if (width <= fitWidth() * 1.08) {
      img.style.transition = 'transform 0.26s var(--ease-out)'
      img.style.transform = ''
      if (isZoomed) zoomOut()
      setTimeout(() => {
        img.style.transition = ''
        img.style.transformOrigin = ''
      }, 280)
      return
    }
    img.style.transform = ''
    img.style.transformOrigin = ''
    img.style.transition = ''
    await zoomAt(fracX, fracY, pinchMid.x, pinchMid.y, width)
  }

  // ── Taps: one toggles the controls, two zoom ──────────────────────────────
  function handleTap(x: number, y: number, at: number) {
    if (at - lastTap.at < 320 && Math.hypot(x - lastTap.x, y - lastTap.y) < 40) {
      clearTimeout(tapTimer)
      lastTap.at = 0
      if (embedUrl) return
      if (isZoomed) zoomOut()
      else if (imgEl && imgLoaded) {
        const r = imgEl.getBoundingClientRect()
        const clamp = (v: number) => Math.min(1, Math.max(0, v))
        zoomAt(clamp((x - r.left) / r.width), clamp((y - r.top) / r.height), x, y, fitWidth() * 2.5)
      }
      return
    }
    lastTap = { at, x, y }
    clearTimeout(tapTimer)
    tapTimer = setTimeout(() => {
      chromeHidden = !chromeHidden
    }, 320)
  }

  function swipeStart(event: TouchEvent) {
    if (event.touches.length === 2 && followable && imgLoaded) {
      startPinch(event)
      return
    }
    if (event.touches.length !== 1) {
      swipeBlocked = true
      tapBlocked = true
      return
    }
    const touch = event.touches[0]
    const target = event.target
    swipeX = touch.clientX
    swipeY = touch.clientY
    swipeAt = event.timeStamp
    touchMoved = false
    if (!settling) dragAxis = null
    const control = target instanceof Element && !!target.closest('button, a, .scrub')
    swipeBlocked = isZoomed || control
    tapBlocked = control || (target instanceof Element && !!target.closest('.player, .embed-frame'))
    const secondTap =
      !embedUrl && imgLoaded && !tapBlocked &&
      event.timeStamp - lastTap.at < 320 &&
      Math.hypot(touch.clientX - lastTap.x, touch.clientY - lastTap.y) < 40
    tapZoom = secondTap ? { y: touch.clientY, on: false } : null
    if (secondTap) clearTimeout(tapTimer)
  }

  function swipeMove(event: TouchEvent) {
    if (pinching) {
      event.preventDefault()
      movePinch(event)
      return
    }
    if (tapZoom && event.touches.length === 1) {
      event.preventDefault()
      moveTapZoom(event.touches[0])
      if (tapZoom.on) return
    }
    if (event.touches.length !== 1) return
    const touch = event.touches[0]
    const dx = touch.clientX - swipeX
    const dy = touch.clientY - swipeY
    if (!touchMoved && Math.hypot(dx, dy) > 10) touchMoved = true
    if (swipeBlocked || isZoomed) return
    event.preventDefault()
    if (!followable || settling || !touchMoved) return
    if (!dragAxis) dragAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (dragAxis === 'x') {
      const edge = (dx > 0 && currentIndex === 0) || (dx < 0 && currentIndex >= posts.length - 1)
      dragX = edge ? dx * 0.3 : dx
    } else {
      dragY = dy
    }
  }

  function onWheel(event: WheelEvent) {
    if (isZoomed || event.ctrlKey) return
    event.preventDefault()
    const target = event.target
    if (target instanceof Element && target.closest('button:not(.nav-zone), a, .scrub')) return

    if (!wheelKind) wheelKind = isMouseWheel(event) ? 'mouse' : 'pad'
    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => {
      wheelDx = 0
      wheelDy = 0
      wheelReady = true
      wheelKind = null
    }, 280)

    // A mouse wheel turns pages, one notch at a time. Only a trackpad swipe closes.
    if (wheelKind === 'mouse') {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
      if (event.timeStamp - mouseStepAt < 180) return
      mouseStepAt = event.timeStamp
      markGesture()
      if (event.deltaY > 0) next()
      else prev()
      return
    }

    if (!wheelReady && isNewSwipe(Math.hypot(event.deltaX, event.deltaY))) {
      wheelReady = true
      wheelDx = 0
      wheelDy = 0
    }
    if (!wheelReady) return

    // 先转回手指方向：向右、向下为正。和手机一样，向左是下一张，上下滑都关闭。
    // 只有 Safari 报告是否自然滚动；Chrome 报不出来，按 macOS 默认的自然滚动算。
    const natural = (event as WheelEvent & { webkitDirectionInvertedFromDevice?: boolean }).webkitDirectionInvertedFromDevice ?? true
    const sign = natural ? -1 : 1
    wheelDx += sign * event.deltaX
    wheelDy += sign * event.deltaY
    const absX = Math.abs(wheelDx)
    const absY = Math.abs(wheelDy)
    // 轻拨就能过。48 以下是手指搭上去的抖动，不算滑动。
    if (absX < 48 && absY < 48) return
    const dx = wheelDx
    const dy = wheelDy
    wheelDx = 0
    wheelDy = 0
    wheelReady = false
    wheelPeak = 0
    wheelTrough = Infinity
    wheelFalling = false
    if (absX >= absY) {
      markGesture()
      if (dx < 0) next()
      else prev()
      return
    }
    if (Math.abs(dy) >= 48) {
      markGesture()
      close('wheel')
    }
  }

  /**
   * Decided on the first event of a gesture: a trackpad starts with small
   * deltas, a mouse notch is a whole 120 in `wheelDelta` (or lines in Firefox).
   */
  function isMouseWheel(event: WheelEvent) {
    if (event.deltaMode !== 0) return true
    const notch = (event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY
    return event.deltaX === 0 && typeof notch === 'number' && notch !== 0 && notch % 120 === 0
  }

  /**
   * Trackpad momentum only decays. Once it has fallen below half its peak, a
   * clear rise again means the finger started a new swipe.
   */
  function isNewSwipe(magnitude: number) {
    if (!wheelFalling) {
      if (magnitude >= wheelPeak) wheelPeak = magnitude
      else if (magnitude < wheelPeak * 0.5) {
        wheelFalling = true
        wheelTrough = magnitude
      }
      return false
    }
    if (magnitude < wheelTrough) {
      wheelTrough = magnitude
      return false
    }
    return magnitude >= wheelTrough * 2 && magnitude >= wheelTrough + 6
  }

  function markGesture() {
    ignoreClick = true
    setTimeout(() => {
      ignoreClick = false
    }, 400)
  }

  function swipeEnd(event: TouchEvent) {
    if (pinching) {
      if (event.touches.length < 2) endPinch()
      return
    }
    if (tapZoom?.on) {
      tapZoom = null
      lastTap.at = 0
      endPinch()
      return
    }
    tapZoom = null
    if (event.changedTouches.length !== 1 || event.touches.length) return
    const touch = event.changedTouches[0]
    if (!touchMoved && !tapBlocked && event.timeStamp - swipeAt < 350) {
      event.preventDefault()
      handleTap(touch.clientX, touch.clientY, event.timeStamp)
      return
    }
    if (swipeBlocked || isZoomed) return
    const dx = touch.clientX - swipeX
    const dy = touch.clientY - swipeY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const travel = Math.max(absX, absY)
    const speed = travel / Math.max(16, event.timeStamp - swipeAt)
    // 慢滑要过一个指头宽（64px）。很快的轻扫 32px 也算，点按时带偏的小距离不算。
    const passed = travel >= 64 || (travel >= 32 && speed >= 0.5)
    const axis = dragAxis ?? (absX >= absY ? 'x' : 'y')
    if (axis === 'x') {
      const target = dx < 0 ? currentIndex + 1 : currentIndex - 1
      if (passed && target >= 0 && target < posts.length) {
        markGesture()
        if (!swipedOnce) {
          swipedOnce = true
          writeFlag(SWIPED_KEY, true)
        }
        slideTo(target, dx < 0 ? -1 : 1)
        return
      }
      if (passed) hitEdge(dx < 0 ? 1 : -1)
      if (dragX) springBack()
      return
    }
    if (passed) {
      markGesture()
      dismiss(Math.sign(dy))
    } else if (dragY) springBack()
  }

  function swallowClick(event: MouseEvent) {
    if (!ignoreClick) return
    ignoreClick = false
    event.preventDefault()
    event.stopPropagation()
  }

  function playClip(event: Event) {
    const video = event.currentTarget as HTMLVideoElement
    videoReady = true
    start(video)
  }

  function mountVideo(node: HTMLVideoElement) {
    applySound(node)
    node.playsInline = true
    node.setAttribute('playsinline', '')
    fitVideoBox()
    start(node)
    return {
      destroy() {
        node.pause()
      }
    }
  }

  $: {
    const slug = embedUrl ? redgifsSlug(embedUrl) : ''
    if (!embedUrl) {
      if (playbackSlug) {
        playbackSlug = ''
        playback = 'loading'
      }
    } else if (slug !== playbackSlug) {
      playbackSlug = slug
      syncPlayback(slug)
    }
  }

  // After syncPlayback, so the cover from this pass is included.
  $: backdrop = embedUrl ? posterUrl || sharpCover(url) : url
  $: played = duration > 0 ? Math.min(1, currentTime / duration) : 0

  async function go(index: number) {
    currentIndex = index
    await tick()
    if (playback === 'video' && videoEl) start(videoEl)
  }

  let imgLoaded = false
  let videoReady = false
  $: if (currentIndex !== undefined) {
    imgLoaded = false
    videoReady = false
    isZoomed = false
    clearZoomBox()
  }

  // Wait for the current item first so neighbours do not take its bandwidth.
  $: ready = embedUrl ? playback === 'iframe' || videoReady : imgLoaded
  $: if (ready && posts) preloadNeighbours()

  // Download only. Neighbours are decoded when they are shown, so this costs
  // their files in memory, not decoded bitmaps.
  let preloaders: HTMLImageElement[] = []

  function warm(src: string, keep: HTMLImageElement[]) {
    if (!src) return
    const known = preloaders.find((img) => img.src === src)
    if (known) {
      keep.push(known)
      return
    }
    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    img.src = src
    keep.push(img)
  }

  function preloadNeighbours() {
    const next: HTMLImageElement[] = []
    for (const index of [currentIndex + 1, currentIndex - 1]) {
      const post = posts[index]
      if (!post) continue
      if (!post.embedUrl) {
        warm(post.fullUrl ?? post.url, next)
        continue
      }
      // A clip needs its lookup before the player can start. The file itself is
      // left to the player: Safari does not buffer video for detached elements.
      const slug = redgifsSlug(post.embedUrl)
      const known = slug ? peekRedgifsMedia(slug) : undefined
      if (known) warm(known.poster, next)
      else if (slug) {
        getRedgifsMedia(slug).then((media) => {
          if (media && media.poster) warm(media.poster, preloaders)
        })
      }
    }
    for (const img of preloaders) if (!next.includes(img)) dropSource(img)
    preloaders = next
  }

  // ── Zoom (Reddit-style: natural resolution + scroll clamp) ────────────────
  // iPhone and iPad tabs are killed far sooner than desktop ones.
  const ZOOM_DEVICE_PIXELS = navigator.maxTouchPoints > 0 ? 32_000_000 : 64_000_000
  let isZoomed = false
  let scrollContainer: HTMLDivElement
  let imgEl: HTMLImageElement

  /** Width the picture has when it fits the screen. */
  function fitWidth() {
    const nw = imgEl?.naturalWidth || 0
    const nh = imgEl?.naturalHeight || 0
    if (!(nw > 0 && nh > 0)) return imgEl?.getBoundingClientRect().width || 0
    return nw * Math.min(1, window.innerWidth / nw, window.innerHeight / nh)
  }

  /** Widest layout width a zoom may reach: 8× the fit, and within the decode budget. */
  function widestZoom() {
    const nw = imgEl?.naturalWidth || 0
    const nh = imgEl?.naturalHeight || 0
    if (!(nw > 0 && nh > 0)) return Infinity
    const dpr = window.devicePixelRatio || 1
    return Math.min(8 * fitWidth(), (nw * Math.sqrt(ZOOM_DEVICE_PIXELS / (nw * nh))) / dpr)
  }

  /** Gesture scale limit. While a finger is down the picture grows by transform, and Safari decodes for that size too. */
  function gestureCap() {
    return pinchRect ? Math.max(1, widestZoom() / pinchRect.width) : 1
  }

  function zoomIn(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLImageElement).getBoundingClientRect()
    const fracX = (e.clientX - rect.left) / rect.width
    const fracY = (e.clientY - rect.top) / rect.height
    zoomAt(fracX, fracY, window.innerWidth / 2, window.innerHeight / 2)
  }

  function zoomCenter() {
    if (imgEl && imgLoaded) zoomAt(0.5, 0.5, window.innerWidth / 2, window.innerHeight / 2)
  }

  /**
   * Show the picture at a larger layout size and scroll so the point at
   * (fracX, fracY) of the picture lands at (viewX, viewY) on screen.
   * Without `wantWidth` it doubles the fitted size.
   */
  async function zoomAt(fracX: number, fracY: number, viewX: number, viewY: number, wantWidth = 0) {
    const img = imgEl
    if (!img) return
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    if (!(nw > 0 && nh > 0)) return
    const fitW = fitWidth()

    isZoomed = true
    await tick()  // wait for CSS to switch to natural-size mode

    const dpr = window.devicePixelRatio || 1
    let scale = wantWidth ? wantWidth / nw : Math.max(1 / dpr, (2 * fitW) / nw)
    // Safari decodes at the drawn size in device pixels. Past the budget the
    // tab runs out of memory and WebKit reloads the page.
    scale = Math.min(scale, widestZoom() / nw)
    const dw = Math.max(1, Math.floor(nw * scale))
    const dh = Math.max(1, Math.floor(nh * scale))
    img.style.width = `${dw}px`
    img.style.height = `${dh}px`
    const cw = scrollContainer.clientWidth
    const ch = scrollContainer.clientHeight

    // If the image is smaller than the viewport in either dimension,
    // add margin to keep it centred in the scroll space.
    // (Using justify/align: flex-start so scroll coords start at 0.)
    const ml = Math.max(0, Math.floor((cw - dw) / 2))
    const mt = Math.max(0, Math.floor((ch - dh) / 2))
    img.style.marginLeft = ml ? `${ml}px` : ''
    img.style.marginTop  = mt ? `${mt}px` : ''

    // Target scroll: bring the chosen point under (viewX, viewY), offset by margin
    const wantX = ml + dw * fracX - viewX
    const wantY = mt + dh * fracY - viewY

    // Clamp: never expose non-image area beyond the image edges
    const maxX = Math.max(0, ml * 2 + dw - cw)
    const maxY = Math.max(0, mt * 2 + dh - ch)
    scrollContainer.scrollLeft = Math.max(0, Math.min(maxX, wantX))
    scrollContainer.scrollTop  = Math.max(0, Math.min(maxY, wantY))
  }

  function clearZoomBox() {
    if (!imgEl) return
    imgEl.style.width = ''
    imgEl.style.height = ''
    imgEl.style.marginLeft = ''
    imgEl.style.marginTop = ''
  }

  function zoomOut() {
    isZoomed = false
    clearZoomBox()
  }

  function toggleZoom() {
    if (isZoomed) zoomOut()
    else zoomCenter()
  }

  // ── Mouse: drag the zoomed picture ────────────────────────────────────────
  let pan: { x: number; y: number; left: number; top: number; moved: boolean } | null = null
  let panning = false

  function panStart(event: PointerEvent) {
    if (!isZoomed || event.pointerType !== 'mouse' || event.button !== 0) return
    if (event.target !== imgEl) return
    event.preventDefault()
    pan = {
      x: event.clientX,
      y: event.clientY,
      left: scrollContainer.scrollLeft,
      top: scrollContainer.scrollTop,
      moved: false
    }
    scrollContainer.setPointerCapture(event.pointerId)
  }

  function panMove(event: PointerEvent) {
    if (!pan) return
    const dx = event.clientX - pan.x
    const dy = event.clientY - pan.y
    if (!pan.moved && Math.hypot(dx, dy) < 4) return
    pan.moved = true
    panning = true
    scrollContainer.scrollLeft = pan.left - dx
    scrollContainer.scrollTop = pan.top - dy
  }

  function panEnd() {
    if (pan?.moved) markGesture()
    pan = null
    panning = false
  }
  function close(gesture?: 'wheel' | 'drag') {
    videoEl?.pause()
    dispatch('close', { gesture })
  }

  // ── Controls hide on a tap (touch) or after the mouse rests (desktop) ─────
  let chromeHidden = false
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  const finePointer =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const canShare = !finePointer && typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  function wake(event?: MouseEvent) {
    if (!finePointer) return
    chromeHidden = false
    clearTimeout(idleTimer)
    const target = event?.target
    if (target instanceof Element && target.closest('button:not(.nav-zone), a, .caption')) return
    idleTimer = setTimeout(() => {
      chromeHidden = true
    }, 2800)
  }

  $: chromeOff = chromeHidden || (dragAxis === 'y' && dragY !== 0)
  // A mouse gets whole side strips to click. Clips keep plain arrows so the strips never cover the scrub bar.
  $: useZones = finePointer && !embedUrl
  $: arrowsHidden = !finePointer && swipedOnce
  $: atStart = currentIndex <= 0
  $: atEnd = currentIndex >= posts.length - 1
  $: showCaption = !!current && (!embedUrl || (playback === 'video' && !videoTall))

  function prev() {
    if (currentIndex > 0) go(currentIndex - 1)
    else hitEdge(-1)
  }

  function next() {
    if (currentIndex < posts.length - 1) go(currentIndex + 1)
    else hitEdge(1)
  }

  let lockedScroll = 0
  let overlayEl: HTMLDivElement
  let inerted: Element[] = []
  let returnFocus: HTMLElement | null = null

  onMount(() => {
    // Lifted out of the page so the page itself can be made inert.
    document.body.appendChild(overlayEl)
    inerted = [...document.body.children].filter((el) => el !== overlayEl && !el.hasAttribute('inert'))
    inerted.forEach((el) => el.setAttribute('inert', ''))
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    overlayEl.focus({ preventScroll: true })

    lockedScroll = window.scrollY
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${lockedScroll}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    wake()
    if (finePointer && !readFlag(KEYS_HINT_KEY)) {
      writeFlag(KEYS_HINT_KEY, true)
      flashHint('← → 或滚轮翻页 · Z 放大 · C 复制链接 · O 原帖 · Esc 关闭', 4200)
    }
  })

  onDestroy(() => {
    clearTimeout(wheelTimer)
    clearTimeout(tapTimer)
    clearTimeout(idleTimer)
    clearTimeout(hintTimer)
    videoEl?.pause()
    preloaders.forEach(dropSource)
    inerted.forEach((el) => el.removeAttribute('inert'))
    returnFocus?.focus({ preventScroll: true })
    const body = document.body
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
    window.scrollTo(0, lockedScroll)
  })

  function handleKeydown(e: KeyboardEvent) {
    wake()
    if (e.key === 'Escape')     { isZoomed ? zoomOut() : close() }
    if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat) {
      const key = e.key.toLowerCase()
      if (key === 'z' && !embedUrl) toggleZoom()
      if (key === 'c') copyLink()
      if (key === 'o') openPost()
      if (key === 'm' && playback === 'video') toggleSound()
      if (key === 'f' && playback === 'video') enterFullscreen()
    }
    if (!isZoomed) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === ' ' && playback === 'video') {
        const target = e.target
        if (target instanceof Element && target.closest('button, a')) return
        e.preventDefault()
        togglePlay()
      }
    }
  }
</script>

<svelte:window
  bind:innerWidth={viewW}
  bind:innerHeight={viewH}
  on:keydown={handleKeydown}
  on:resize={fitVideoBox}
  on:fullscreenchange={onFullscreenChange}
/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="overlay"
  class:chrome-off={chromeOff}
  class:idle={chromeHidden && finePointer}
  class:arrows-hidden={arrowsHidden}
  class:corner-arrows={!useZones && !arrowsHidden}
  role="dialog"
  aria-modal="true"
  aria-label={title || '查看图片'}
  tabindex="-1"
  bind:this={overlayEl}
  style={fade < 1 ? `background: rgb(0 0 0 / ${fade})` : ''}
  on:click|capture={swallowClick}
  on:touchstart={swipeStart}
  on:touchmove|nonpassive={swipeMove}
  on:touchend={swipeEnd}
  on:touchcancel={springBack}
  on:wheel|nonpassive={onWheel}
  on:mousemove={wake}
>

  <!-- Blurred background. A sibling of the video, so its fade never wraps the player. -->
  {#if backdrop}
    <img
      class="blur-bg"
      src={backdrop}
      alt=""
      referrerpolicy="no-referrer"
      aria-hidden="true"
      style={fade < 1 ? `opacity: ${fade}` : ''}
    />
  {/if}

  <!-- Navigation arrows — hidden while zoomed -->
  {#if !isZoomed && useZones}
    <button class="nav-zone left chrome" class:end={atStart} on:click={prev} title="上一张" aria-label="上一张">
      <span class="nav-face"><ChevronLeft /></span>
    </button>
    {#if atEnd && loadingMore}
      <div class="nav-zone right loading" role="status" aria-label="正在加载更多">
        <span class="nav-face"><span class="btn-spinner" /></span>
      </div>
    {:else}
      <button class="nav-zone right chrome" class:end={atEnd} on:click={next} title="下一张" aria-label="下一张">
        <span class="nav-face"><ChevronRight /></span>
      </button>
    {/if}
  {:else if !isZoomed}
    <button class="nav-btn left chrome" class:end={atStart} on:click={prev} title="上一张" aria-label="上一张">
      <ChevronLeft />
    </button>
    {#if atEnd && loadingMore}
      <button class="nav-btn right" disabled title="正在加载更多" aria-label="正在加载更多">
        <span class="btn-spinner" />
      </button>
    {:else}
      <button class="nav-btn right chrome" class:end={atEnd} on:click={next} title="下一张" aria-label="下一张">
        <ChevronRight />
      </button>
    {/if}
  {/if}

  <div class="top-actions chrome">
    {#if playback === 'video'}
      <button class="icon-btn" on:click={toggleSound} title={soundOn ? '静音 (M)' : '打开声音 (M)'} aria-label={soundOn ? '静音' : '打开声音'}>
        {#if soundOn}<VolumeHigh />{:else}<VolumeOff />{/if}
      </button>
      <button class="icon-btn" on:click={enterFullscreen} title="全屏 (F)" aria-label="全屏">
        <Fullscreen />
      </button>
    {:else if !embedUrl}
      <button
        class="icon-btn zoom-btn"
        class:active={isZoomed}
        disabled={!imgLoaded}
        on:click={toggleZoom}
        title={isZoomed ? '缩小 (Z)' : '放大 (Z)'}
        aria-label={isZoomed ? '缩小' : '放大'}
      >
        {#if isZoomed}<MagnifyMinus />{:else}<MagnifyPlus />{/if}
      </button>
    {/if}
    {#if canShare}
      <button class="icon-btn" on:click={share} title="分享" aria-label="分享">
        <ShareVariant />
      </button>
    {:else}
      <button class="icon-btn" on:click={copyLink} title="复制链接 (C)" aria-label="复制链接">
        <LinkVariant />
      </button>
    {/if}
    <a href={postUrl} target="_blank" rel="noopener noreferrer"
       class="icon-btn" title="在 Reddit 打开原帖 (O)" aria-label="在 Reddit 打开原帖">
      <Reddit />
    </a>
  </div>
  <button class="icon-btn close-btn chrome" on:click={() => close()} title="关闭 (Esc)" aria-label="关闭">
    <Close />
  </button>

  {#if hint}
    <div class="hint" role="status">{hint}</div>
  {/if}

  <!-- Content -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="img-wrap"
    class:zoomed={isZoomed}
    class:panning
    class:settling
    style={stageStyle}
    bind:this={scrollContainer}
    on:click|self={() => { if (isZoomed) zoomOut() }}
    on:pointerdown={panStart}
    on:pointermove={panMove}
    on:pointerup={panEnd}
    on:pointercancel={panEnd}
  >
    {#if embedUrl && playback === 'video'}
      <div class="player">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <video
          class="rg-player"
          bind:this={videoEl}
          src={videoUrl}
          poster={posterUrl || undefined}
          loop
          preload="auto"
          use:mountVideo
          on:loadedmetadata={fitVideoBox}
          on:loadeddata={playClip}
          on:play={onPlay}
          on:pause={onPause}
          on:timeupdate={onTime}
          on:click={togglePlay}
        ></video>
        {#if started && paused && !scrubbing}
          <div class="paused-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5.14v14l11-7-11-7z" /></svg>
          </div>
        {/if}
        <div
          class="scrub"
          class:active={scrubbing}
          on:pointerdown|stopPropagation={scrubStart}
          on:pointermove={scrubMove}
          on:pointerup={scrubEnd}
          on:pointercancel={scrubEnd}
          on:click|stopPropagation
        >
          <div class="scrub-line">
            <div class="scrub-fill" style="width: {played * 100}%"></div>
          </div>
        </div>
        {#if duration > 0}
          <div class="scrub-time" class:active={scrubbing} class:off={chromeOff && !scrubbing}>
            {clock(currentTime)} / {clock(duration)}
          </div>
        {/if}
      </div>
    {:else if embedUrl && playback === 'iframe'}
      <iframe
        src={embedUrl}
        title={title}
        frameborder="0"
        allowfullscreen
        scrolling="no"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin"
        class="embed-frame"
      />
    {:else if embedUrl}
      <div class="spinner" />
    {:else}
      {#if !imgLoaded}
        <div class="spinner" />
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <img
        use:releaseImage
        src={url}
        alt={title}
        referrerpolicy="no-referrer"
        data-photo
        class:visible={imgLoaded}
        class:fit={!isZoomed}
        bind:this={imgEl}
        on:load={() => (imgLoaded = true)}
        on:click|stopPropagation={(e) => isZoomed ? zoomOut() : zoomIn(e)}
      />
    {/if}
  </div>

  {#if showCaption}
    <div class="caption chrome" class:zoomed={isZoomed}>
      <div class="text">
        {#if title}<p class="title">{title}</p>{/if}
        {#if gallery || current.author || current.score != null || current.comments != null || current.createdAt}
          <p class="meta">
            {#if gallery}<span class="album">图集 {gallery.at}/{gallery.count}</span>{/if}
            {#if current.author}<span>u/{current.author}</span>{/if}
            {#if current.score != null}<span class="stat"><ArrowUp />{compact(current.score)}</span>{/if}
            {#if current.comments != null}<span class="stat"><CommentOutline />{compact(current.comments)}</span>{/if}
            {#if current.createdAt}<span>{ago(current.createdAt)}</span>{/if}
          </p>
        {/if}
      </div>
      {#if posts.length > 1}
        <span class="counter">{currentIndex + 1} / {posts.length}{done ? '' : '+'}</span>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    touch-action: none;
    overscroll-behavior: none;
    outline: none;
    /* 视频在这一层里面。给它做淡入或位移，iPhone 上画面会黑。 */
  }

  /* ── Blurred background (behind everything) ── */
  .blur-bg {
    position: absolute;
    inset: -40px;   // slightly oversized to hide blur-edge artifacts
    width: calc(100% + 80px);
    height: calc(100% + 80px);
    object-fit: cover;
    object-position: center;
    filter: blur(32px) brightness(0.42) saturate(1.7);
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    animation: enter 0.18s ease;
  }

  /* ── Scroll / content container ── */
  .img-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: default;
    overscroll-behavior: none;
    will-change: transform;

    &.settling {
      transition: transform 0.28s var(--ease-out);
    }

    // Zoomed: allow native scroll. Use flex-start so scroll coords begin at 0
    // (justify-content:center with overflow clips the start of the scroll range).
    // JS adds margin to the img to centre it when it's smaller than the viewport.
    &.zoomed {
      overflow: auto;
      align-items: flex-start;
      justify-content: flex-start;
      cursor: default;
      touch-action: pan-x pan-y;
    }

    /* ── Main image ── */
    img {
      display: block;
      opacity: 0;
      transition: opacity 0.2s;
      animation: scaleIn 0.15s ease;
      user-select: none;
      -webkit-user-drag: none;

      &.visible { opacity: 1; }

      // Normal: fit the viewport, zoom-in cursor
      &.fit {
        max-width: 100vw;
        max-height: 100vh;
        width: auto;
        height: auto;
        object-fit: contain;
        cursor: zoom-in;
        // Reset any inline margin set by zoomIn
        margin: 0 !important;
      }

      // Zoomed: natural resolution, scroll or drag to pan
      &:not(.fit) {
        max-width: none;
        max-height: none;
        width: auto;
        height: auto;
        cursor: grab;
      }
    }

    &.panning img:not(.fit) {
      cursor: grabbing;
    }

    .player {
      position: relative;
      flex: none;
      max-width: 100%;
      max-height: 100%;
      line-height: 0;
    }

    .rg-player {
      display: block;
      flex: none;
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      min-width: 0;
      min-height: 0;
      object-fit: contain;
      cursor: pointer;
    }

    .paused-mark {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 3.25rem;
      height: 3.25rem;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;

      svg {
        width: 1.4rem;
        height: 1.4rem;
        margin-left: 0.15rem;
        fill: #fff;
      }
    }

    .scrub {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2.25rem;
      display: flex;
      align-items: flex-end;
      touch-action: none;
      cursor: pointer;
    }

    .scrub-line {
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.35);
      transition: height 0.15s var(--ease-out);
    }

    .scrub:hover .scrub-line,
    .scrub.active .scrub-line {
      height: 6px;
    }

    .scrub-fill {
      height: 100%;
      background: var(--accent-gradient);
    }

    .scrub-time {
      position: absolute;
      right: 0.6rem;
      bottom: 0.9rem;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.04em;
      line-height: 1;
      pointer-events: none;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.75);
      transition: opacity 0.25s;

      &.active {
        right: 50%;
        bottom: 1.4rem;
        transform: translateX(50%);
        font-size: 0.9rem;
      }

      &.off {
        opacity: 0;
      }
    }

    .embed-frame {
      width: 100vw;
      height: 100vh;
      border: none;
      background: #000;
      cursor: default;
      flex-shrink: 0;
    }
  }

  @keyframes scaleIn {
    from { transform: scale(0.97); }
    to   { transform: scale(1); }
  }

  /* ── Spinner ── */
  .spinner {
    position: absolute;
    width: 2rem;
    height: 2rem;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Navigation arrows ── */
  /* Dark glass reads on bright skies and snow as well as on night shots. */
  .overlay {
    --lb-glass: rgb(14 14 16 / 0.46);
    --lb-glass-hover: rgb(44 44 48 / 0.66);
    --lb-line: rgb(255 255 255 / 0.16);
    --lb-btn: 2.5rem;
  }

  @media (pointer: coarse) {
    .overlay { --lb-btn: 2.75rem; }
  }

  .nav-btn,
  .nav-face {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    box-sizing: border-box;
    border: 1px solid var(--lb-line);
    border-radius: 50%;
    background: var(--lb-glass);
    backdrop-filter: blur(12px) saturate(1.5);
    -webkit-backdrop-filter: blur(12px) saturate(1.5);
    color: #fff;
    font-size: 1.6rem;
    box-shadow: 0 4px 16px rgb(0 0 0 / 0.25);
  }

  .nav-btn {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    cursor: pointer;
    transition: opacity 0.2s, background 0.15s, transform 0.15s;
    animation: enter 0.18s ease;

    &.left  { left:  0.75rem; }
    &.right { right: 0.75rem; }
    &:hover { background: var(--lb-glass-hover); }
    &:active { transform: translateY(-50%) scale(0.92); }
    &:disabled { cursor: default; }
    &:disabled:hover { background: var(--lb-glass); }
    &.end { opacity: 0.35; }
  }

  @media (max-width: 720px) {
    .nav-btn {
      top: auto;
      bottom: calc(0.9rem + env(safe-area-inset-bottom));
      transform: none;
      &.left  { left:  0.6rem; }
      &.right { right: 0.6rem; }
      &:active { transform: scale(0.92); }
    }
  }

  .overlay.arrows-hidden .nav-btn.chrome { display: none; }

  /* Mouse: each side strip turns the page; the arrow brightens under the pointer. */
  .nav-zone {
    position: fixed;
    top: calc(4.25rem + env(safe-area-inset-top));
    bottom: 6.5rem;
    z-index: 9;
    width: clamp(4.5rem, 14vw, 9rem);
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    border: none;
    background: none;
    cursor: pointer;
    transition: opacity 0.25s;
    animation: enter 0.18s ease;

    &.left  { left: 0;  justify-content: flex-start; }
    &.right { right: 0; justify-content: flex-end; }

    .nav-face {
      opacity: 0.55;
      transition: opacity 0.2s, transform 0.2s var(--ease-out), background 0.15s;
    }
    &:hover .nav-face,
    &:focus-visible .nav-face {
      opacity: 1;
      background: var(--lb-glass-hover);
    }
    &.left:hover .nav-face  { transform: translateX(-2px); }
    &.right:hover .nav-face { transform: translateX(2px); }
    &:active .nav-face { transform: scale(0.92); }

    &.end { cursor: default; }
    &.end .nav-face,
    &.end:hover .nav-face { opacity: 0.25; transform: none; background: var(--lb-glass); }

    &.loading { cursor: default; }
    &.loading .nav-face { opacity: 1; }
  }

  .btn-spinner {
    display: block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* ── Top buttons: actions on the right, close beside them (left on touch) ── */
  /* Actions share one capsule; close stands apart at the capsule's height. */
  .top-actions {
    position: fixed;
    top: calc(0.6rem + env(safe-area-inset-top));
    right: calc(0.6rem + var(--lb-btn) + 0.35rem + 2px + 0.5rem);
    z-index: 10;
    display: flex;
    gap: 0.1rem;
    padding: 0.175rem;
    border: 1px solid var(--lb-line);
    border-radius: 999px;
    background: var(--lb-glass);
    backdrop-filter: blur(12px) saturate(1.5);
    -webkit-backdrop-filter: blur(12px) saturate(1.5);
    box-shadow: 0 4px 16px rgb(0 0 0 / 0.25);
    transition: opacity 0.25s;
    animation: enter 0.18s ease;

    .icon-btn {
      border-color: transparent;
      background: transparent;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      &:hover { background: rgb(255 255 255 / 0.14); }
      &.active { background: var(--accent-gradient); }
    }
  }

  .icon-btn.close-btn {
    position: fixed;
    top: calc(0.6rem + env(safe-area-inset-top));
    right: 0.6rem;
    z-index: 10;
    width: calc(var(--lb-btn) + 0.35rem + 2px);
    height: calc(var(--lb-btn) + 0.35rem + 2px);
    animation: enter 0.18s ease;
  }

  @media (pointer: coarse) {
    .top-actions { right: 0.6rem; }
    .icon-btn.close-btn { right: auto; left: 0.6rem; }
  }

  .overlay.idle,
  .overlay.idle :global(*) {
    cursor: none !important;
  }

  .hint {
    position: fixed;
    top: calc(4rem + env(safe-area-inset-top));
    left: 50%;
    z-index: 11;
    max-width: calc(100vw - 2rem);
    transform: translateX(-50%);
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: rgb(20 20 22 / 0.72);
    backdrop-filter: blur(14px) saturate(1.6);
    -webkit-backdrop-filter: blur(14px) saturate(1.6);
    border: 1px solid rgb(255 255 255 / 0.1);
    color: #fff;
    font-size: 0.82rem;
    font-weight: 600;
    text-align: center;
    pointer-events: none;
    animation: hintIn 0.22s var(--ease-out);
  }

  @keyframes hintIn {
    from { opacity: 0; transform: translate(-50%, -6px); }
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--lb-btn);
    height: var(--lb-btn);
    box-sizing: border-box;
    border: 1px solid var(--lb-line);
    border-radius: 50%;
    background: var(--lb-glass);
    backdrop-filter: blur(12px) saturate(1.5);
    -webkit-backdrop-filter: blur(12px) saturate(1.5);
    box-shadow: 0 4px 16px rgb(0 0 0 / 0.25);
    color: #fff;
    font-size: 1.15rem;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;
    text-decoration: none;

    &:hover { background: var(--lb-glass-hover); }
    &:disabled { opacity: 0.35; cursor: default; }
    &.active { background: var(--accent-gradient); color: var(--on-accent); }
  }

  @media (pointer: coarse) {
    .icon-btn { font-size: 1.25rem; }
  }

  /* Tap (touch) or a resting mouse (desktop) hides everything but the picture. */
  .overlay.chrome-off .chrome {
    opacity: 0;
    pointer-events: none;
  }

  /* ── Caption ── */
  .caption {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    padding: 3rem 1.25rem calc(1rem + env(safe-area-inset-bottom));
    background: linear-gradient(to top, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0.3) 60%, transparent);
    color: #fff;
    pointer-events: none;
    transition: opacity 0.25s;
    animation: enter 0.18s ease;
    &.zoomed {
      opacity: 0;
    }
  }
  .text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .meta {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgb(255 255 255 / 0.68);
    font-variant-numeric: tabular-nums;
    .stat {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      :global(svg) { font-size: 0.85rem; }
    }
    .album {
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      background: var(--accent-gradient);
      color: var(--on-accent);
      font-weight: 700;
    }
  }
  .title {
    margin: 0;
    max-width: 48rem;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.45;
    text-shadow: 0 1px 3px rgb(0 0 0 / 0.5);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .counter {
    flex: none;
    margin-left: auto;
    font-size: 0.78rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: rgba(255,255,255,0.65);
    letter-spacing: 0.04em;
  }
  @media (max-width: 720px) {
    .overlay.corner-arrows .caption {
      padding-left: 4.25rem;
      padding-right: 4.25rem;
    }
    .caption {
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      text-align: center;
    }
    .text {
      align-items: center;
      width: 100%;
    }
    .meta {
      justify-content: center;
    }
    .counter {
      margin: 0;
    }
  }

  @keyframes enter {
    from { opacity: 0; }
  }
</style>
