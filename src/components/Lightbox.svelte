<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte'
  const dispatch = createEventDispatcher()

  import Close from '~icons/mdi/close'
  import ChevronLeft from '~icons/mdi/chevron-left'
  import ChevronRight from '~icons/mdi/chevron-right'
  import OpenInNew from '~icons/mdi/open-in-new'
  import MagnifyPlus from '~icons/mdi/magnify-plus-outline'
  import MagnifyMinus from '~icons/mdi/magnify-minus-outline'
  import VolumeOff from '~icons/mdi/volume-off'
  import VolumeHigh from '~icons/mdi/volume-high'
  import Fullscreen from '~icons/mdi/fullscreen'

  import { getRedgifsMedia, peekRedgifsMedia, redgifsSlug, sharpCover, type Post } from '@utils/api'

  export let posts: Post[] = []
  export let currentIndex: number = 0
  /** True while the parent is fetching the next batch in the background */
  export let loadingMore: boolean = false

  $: current   = posts[currentIndex]
  $: url       = current?.fullUrl ?? current?.url ?? ''
  $: title     = current?.title ?? ''
  $: embedUrl  = current?.embedUrl ?? null
  $: externalUrl = embedUrl ? embedUrl.replace('/ifr/', '/watch/') : url
  let playback: 'loading' | 'video' | 'iframe' = 'loading'
  let playbackSlug = ''
  let videoUrl = ''
  let posterUrl = ''
  let videoEl: HTMLVideoElement | undefined
  /** Stays for the clips opened in this lightbox. Closing destroys the component. */
  let soundOn = false
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
    if (!videoEl) return
    applySound(videoEl)
    if (!videoEl.paused) videoEl.play().catch(() => {})
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
    video.style.width = `${Math.floor(vw * scale)}px`
    video.style.height = `${Math.floor(vh * scale)}px`
    if (video.duration > 0) duration = video.duration
  }

  function swipeStart(event: TouchEvent) {
    if (isZoomed || event.touches.length !== 1) {
      swipeBlocked = true
      return
    }
    const touch = event.touches[0]
    const target = event.target
    swipeX = touch.clientX
    swipeY = touch.clientY
    swipeAt = event.timeStamp
    swipeBlocked = target instanceof Element && !!target.closest('button, a, .scrub')
  }

  function swipeMove(event: TouchEvent) {
    if (swipeBlocked || isZoomed || event.touches.length !== 1) return
    event.preventDefault()
  }

  function onWheel(event: WheelEvent) {
    if (isZoomed || event.ctrlKey) return
    event.preventDefault()
    const target = event.target
    if (target instanceof Element && target.closest('button, a, .scrub')) return

    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => {
      wheelDx = 0
      wheelDy = 0
      wheelReady = true
    }, 280)
    if (!wheelReady && isNewSwipe(Math.hypot(event.deltaX, event.deltaY))) {
      wheelReady = true
      wheelDx = 0
      wheelDy = 0
    }
    if (!wheelReady) return

    // 先转回手指方向：向右、向下为正。和手机一样，向左是下一张，向上滑才关闭。
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
    if (dy <= -48) {
      markGesture()
      close('wheel')
    }
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
    if (swipeBlocked || isZoomed || event.changedTouches.length !== 1) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - swipeX
    const dy = touch.clientY - swipeY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const travel = Math.max(absX, absY)
    const speed = travel / Math.max(16, event.timeStamp - swipeAt)
    // 慢滑要过一个指头宽（64px）。很快的轻扫 32px 也算，点按时带偏的小距离不算。
    if (travel < 64 && !(travel >= 32 && speed >= 0.5)) return
    if (absX >= absY) {
      markGesture()
      if (dx < 0) next()
      else prev()
      return
    }
    if (dy < 0 && absY > absX) {
      markGesture()
      close()
    }
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
    video.play().catch(() => {})
  }

  function mountVideo(node: HTMLVideoElement) {
    applySound(node)
    node.playsInline = true
    node.setAttribute('playsinline', '')
    fitVideoBox()
    node.play().catch(() => {})
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
    if (playback === 'video') videoEl?.play().catch(() => {})
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
    preloaders = next
  }

  // ── Zoom (Reddit-style: natural resolution + scroll clamp) ────────────────
  // iPhone and iPad tabs are killed far sooner than desktop ones.
  const ZOOM_DEVICE_PIXELS = navigator.maxTouchPoints > 0 ? 32_000_000 : 64_000_000
  let isZoomed = false
  let scrollContainer: HTMLDivElement
  let imgEl: HTMLImageElement

  async function zoomIn(e: MouseEvent) {
    const img = e.currentTarget as HTMLImageElement
    const rect = img.getBoundingClientRect()
    const fracX = (e.clientX - rect.left) / rect.width
    const fracY = (e.clientY - rect.top)  / rect.height

    isZoomed = true
    await tick()  // wait for CSS to switch to natural-size mode

    const nw = img.naturalWidth
    const nh = img.naturalHeight
    if (!(nw > 0 && nh > 0)) return
    const dpr = window.devicePixelRatio || 1
    // Safari decodes at the drawn size in device pixels. Past the budget the
    // tab runs out of memory and WebKit reloads the page.
    let scale = Math.max(1 / dpr, (2 * rect.width) / nw)
    if (nw * nh > ZOOM_DEVICE_PIXELS) {
      scale = Math.min(scale, Math.sqrt(ZOOM_DEVICE_PIXELS / (nw * nh)) / dpr)
    }
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

    // Target scroll: bring clicked point to viewport centre, offset by margin
    const wantX = ml + dw * fracX - cw / 2
    const wantY = mt + dh * fracY - ch / 2

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
  function close(gesture?: 'wheel') {
    videoEl?.pause()
    dispatch('close', { gesture })
  }
  function prev()    { if (currentIndex > 0) go(currentIndex - 1) }
  function next()    { if (currentIndex < posts.length - 1) go(currentIndex + 1) }

  let lockedScroll = 0

  onMount(() => {
    lockedScroll = window.scrollY
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${lockedScroll}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
  })

  onDestroy(() => {
    clearTimeout(wheelTimer)
    videoEl?.pause()
    const body = document.body
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
    window.scrollTo(0, lockedScroll)
  })

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape')     { isZoomed ? zoomOut() : close() }
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

<svelte:window on:keydown={handleKeydown} on:resize={fitVideoBox} on:fullscreenchange={onFullscreenChange} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="overlay"
  on:click|capture={swallowClick}
  on:touchstart={swipeStart}
  on:touchmove|nonpassive={swipeMove}
  on:touchend={swipeEnd}
  on:wheel|nonpassive={onWheel}
>

  <!-- Blurred background. A sibling of the video, so its fade never wraps the player. -->
  {#if backdrop}
    <img
      class="blur-bg"
      src={backdrop}
      alt=""
      referrerpolicy="no-referrer"
      aria-hidden="true"
    />
  {/if}

  <!-- Navigation arrows — hidden while zoomed -->
  {#if !isZoomed}
    {#if currentIndex > 0}
      <button class="nav-btn left" on:click={prev} title="上一张">
        <ChevronLeft />
      </button>
    {/if}
    {#if currentIndex < posts.length - 1}
      <button class="nav-btn right" on:click={next} title="下一张">
        <ChevronRight />
      </button>
    {:else if loadingMore}
      <button class="nav-btn right" disabled title="加载更多...">
        <span class="btn-spinner" />
      </button>
    {/if}
  {/if}

  <!-- Top-right controls -->
  <div class="top-actions">
    {#if playback === 'video'}
      <button class="icon-btn" on:click={toggleSound} title={soundOn ? '静音' : '打开声音'}>
        {#if soundOn}<VolumeHigh />{:else}<VolumeOff />{/if}
      </button>
      <button class="icon-btn" on:click={enterFullscreen} title="全屏">
        <Fullscreen />
      </button>
    {:else if !embedUrl}
      <button
        class="icon-btn"
        class:active={isZoomed}
        on:click={isZoomed ? zoomOut : undefined}
        style={isZoomed ? '' : 'pointer-events:none; opacity:0.3'}
        title={isZoomed ? '缩小' : '点击图片放大'}
      >
        {#if isZoomed}<MagnifyMinus />{:else}<MagnifyPlus />{/if}
      </button>
    {/if}
    <a href={externalUrl} target="_blank" rel="noopener noreferrer"
       class="icon-btn" title="在新标签页打开">
      <OpenInNew />
    </a>
    <button class="icon-btn" on:click={() => close()} title="关闭">
      <Close />
    </button>
  </div>

  <!-- Content -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="img-wrap"
    class:zoomed={isZoomed}
    bind:this={scrollContainer}
    on:click|self={() => { if (isZoomed) zoomOut() }}
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
        {#if scrubbing}
          <div class="scrub-time">{clock(currentTime)} / {clock(duration)}</div>
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
        src={url}
        alt={title}
        referrerpolicy="no-referrer"
        class:visible={imgLoaded}
        class:fit={!isZoomed}
        bind:this={imgEl}
        on:load={() => (imgLoaded = true)}
        on:click|stopPropagation={(e) => isZoomed ? zoomOut() : zoomIn(e)}
      />
    {/if}
  </div>

  {#if posts.length > 1}
    <div class="counter">{currentIndex + 1} / {posts.length}</div>
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
    filter: blur(24px) brightness(0.32) saturate(1.4);
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

      // Zoomed: natural resolution, scroll to pan
      &:not(.fit) {
        max-width: none;
        max-height: none;
        width: auto;
        height: auto;
        cursor: zoom-out;
      }
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
      height: 1.25rem;
      display: flex;
      align-items: flex-end;
      touch-action: none;
      cursor: pointer;
    }

    .scrub-line {
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.35);
    }

    .scrub-fill {
      height: 100%;
      background: #fff;
    }

    .scrub-time {
      position: absolute;
      left: 50%;
      bottom: 1.5rem;
      transform: translateX(-50%);
      color: #fff;
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      pointer-events: none;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.65);
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
  .nav-btn {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s, background 0.15s;
    animation: enter 0.18s ease;

    &.left  { left:  0.75rem; }
    &.right { right: 0.75rem; }
    &:hover { opacity: 1; background: rgba(255,255,255,0.22); }
    &:disabled { cursor: default; }
    &:disabled:hover { opacity: 0.7; background: rgba(255,255,255,0.12); }
  }

  @media (max-width: 720px) {
    .nav-btn {
      top: auto;
      bottom: 3.25rem;
      transform: none;
    }
  }

  .btn-spinner {
    display: block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* ── Top-right buttons ── */
  .top-actions {
    position: fixed;
    top: 0.6rem;
    right: 0.6rem;
    z-index: 10;
    display: flex;
    gap: 0.2rem;
    animation: enter 0.18s ease;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.15s, background 0.15s;
    text-decoration: none;

    &:hover { opacity: 1; background: rgba(255,255,255,0.2); }
    &.active { opacity: 1; background: rgba(255,255,255,0.2); color: #ebfa63; }
  }

  /* ── Page counter ── */
  .counter {
    position: fixed;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.5);
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    pointer-events: none;
    letter-spacing: 0.04em;
    animation: enter 0.18s ease;
  }

  @keyframes enter {
    from { opacity: 0; }
  }
</style>
