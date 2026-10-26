<script lang="ts">
  import AOS from 'aos'
  import 'aos/dist/aos.css'
  AOS.init({ once: true, offset: 50 })

  // components
  import '@appnest/masonry-layout'
  import Card from '@components/Card.svelte'
  import Lightbox from '@components/Lightbox.svelte'

  // props/stores
  import type { Post } from '@utils/api'
  export let posts: Post[]
  /** Parent has confirmed the Reddit listing will not return more posts. */
  export let done = false
  /** Parent listing request is in flight. */
  export let fetching = false
  import type { MasonryLayout } from '@appnest/masonry-layout'
  let masonry: MasonryLayout

  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte'
  import { bindFeedJump, setFeedLeaping, setFeedPhase, type JumpDir } from '@store/feed'
  const dispatch = createEventDispatcher()

  const LEAP_SCREENS = 6
  const AHEAD_SCREENS = 8

  let shown = 0
  let active: boolean[] = []
  let preparingClick = false
  let ended = false
  let pending = false
  let askedForLen = -1
  let sawFetch = false
  let scheduled = false
  let tail: Promise<void> = Promise.resolve()
  let leapFocus: number | null = null
  let leaping = false
  let layoutAfterLeap = false
  let retryOnScroll = false

  let lightboxIndex: number | null = null

  const PRELOAD_THRESHOLD = 3
  let _needMoreSent = false
  let _lastPostsLen = 0

  $: {
    if (posts.length > _lastPostsLen) {
      _lastPostsLen = posts.length
      _needMoreSent = false
    }
    if (
      lightboxIndex !== null &&
      posts.length > 0 &&
      lightboxIndex >= posts.length - PRELOAD_THRESHOLD &&
      !_needMoreSent
    ) {
      _needMoreSent = true
      dispatch('needMore')
    }
  }

  $: loadingMore =
    lightboxIndex !== null &&
    fetching &&
    !done &&
    lightboxIndex === posts.length - 1 &&
    _needMoreSent

  let seenPosts = posts
  $: if (posts !== seenPosts) {
    seenPosts = posts
    if (posts.length === 0) {
      shown = 0
      ended = false
      preparingClick = false
      askedForLen = -1
      pending = false
      retryOnScroll = false
      active = []
      syncPhase()
    }
  }

  $: if (posts) scheduleMaintain()

  $: {
    if (fetching) sawFetch = true
    else if (sawFetch) {
      sawFetch = false
      pending = false
      if (!done && posts.length !== askedForLen) {
        askedForLen = -1
        retryOnScroll = false
      } else if (!done) {
        retryOnScroll = true
      }
      if (preparingClick) preparingClick = false
      syncPhase()
      scheduleMaintain()
    }
  }

  function syncPhase() {
    if (typeof window === 'undefined') return
    setFeedPhase(preparingClick ? 'preparing' : ended ? 'ended' : 'idle')
  }

  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = tail.then(task, task)
    tail = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  function releaseRetry() {
    if (!retryOnScroll || leaping) return
    retryOnScroll = false
    askedForLen = -1
    scheduleMaintain()
  }

  function scheduleMaintain() {
    if (leaping || typeof window === 'undefined' || scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      void enqueue(() => maintain())
    })
  }

  function frame() {
    return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }

  /** Masonry measures children before they have a column width, so lay out twice. */
  async function layoutPass() {
    await tick()
    masonry?.layout()
    await frame()
    await frame()
    masonry?.layout()
    await frame()
  }

  function placedBottom(): number | null {
    let max = 0
    let measured = 0
    for (let i = 0; i < shown; i++) {
      const el = document.getElementById(`card-${i}`)
      if (!el || el.slot === '') continue
      const rect = el.getBoundingClientRect()
      if (rect.height <= 1) continue
      measured++
      const bottom = rect.bottom + window.scrollY
      if (bottom > max) max = bottom
    }
    if (measured < shown) return null
    return max
  }

  async function extendTo(targetBottom: number): Promise<number | null> {
    let stalls = 0
    for (let i = 0; i < 40; i++) {
      if (shown === 0) {
        if (posts.length === 0) return null
        shown = Math.min(posts.length, 8)
        await layoutPass()
        continue
      }
      const bottom = placedBottom()
      if (bottom == null) {
        await layoutPass()
        if (++stalls > 4) return placedBottom()
        continue
      }
      stalls = 0
      if (bottom >= targetBottom - 1) return bottom
      if (shown >= posts.length) return bottom
      shown = Math.min(posts.length, shown + 8)
      await layoutPass()
    }
    return placedBottom()
  }

  function ask() {
    if (done || fetching || pending) return
    if (askedForLen === posts.length) return
    askedForLen = posts.length
    pending = true
    dispatch('needMore')
  }

  async function maintain() {
    const vh = window.innerHeight || 1
    if (posts.length === 0) {
      if (!done) ask()
      refreshActive()
      return
    }
    const target = window.scrollY + vh * AHEAD_SCREENS
    const bottom = await extendTo(target)
    if (bottom != null && bottom < target && shown >= posts.length) ask()
    if (ended) {
      const gap = (bottom ?? 0) - window.scrollY - vh
      if (gap > vh) {
        ended = false
        syncPhase()
      }
    }
    refreshActive()
  }

  function rangeHits(top: number, bottom: number, a: number, b: number) {
    return bottom > a && top < b
  }

  function sameBools(a: boolean[], b: boolean[]) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
  }

  /** Originals stay on the first screen, the viewport ± one screen, and both leap landings. */
  function refreshActive() {
    const vh = window.innerHeight || 1
    const y = window.scrollY
    const downLine = y + vh * LEAP_SCREENS
    const upLine = Math.max(0, y - vh * LEAP_SCREENS)
    const focus = leapFocus
    const next: boolean[] = []
    for (let i = 0; i < shown; i++) {
      const el = document.getElementById(`card-${i}`)
      if (!el || el.slot === '') {
        next.push(false)
        continue
      }
      const rect = el.getBoundingClientRect()
      const top = rect.top + y
      const bottom = rect.bottom + y
      next.push(
        rangeHits(top, bottom, 0, vh) ||
          rangeHits(top, bottom, y - vh, y + vh * 2) ||
          rangeHits(top, bottom, downLine, downLine + vh) ||
          rangeHits(top, bottom, upLine, upLine + vh) ||
          (focus != null && rangeHits(top, bottom, focus, focus + vh))
      )
    }
    if (!sameBools(active, next)) active = next
  }

  function visualOffset(el: HTMLElement) {
    const raw = getComputedStyle(el).transform
    if (!raw || raw === 'none') return 0
    return new DOMMatrix(raw).m42
  }

  /**
   * Move the grid on the compositor, then commit that position with one scroll.
   * Per-frame scrollTo runs on the main thread and drops frames once images are heavy.
   */
  function glide(to: number) {
    const from = window.scrollY
    const delta = to - from
    const el = masonry
    if (!el || Math.abs(delta) < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, to)
      return Promise.resolve()
    }
    const screens = Math.abs(delta) / (window.innerHeight || 1)
    const duration = Math.min(1100, Math.max(360, screens * 180))
    const started = performance.now()
    el.style.willChange = 'transform'
    const anim = el.animate(
      [
        { transform: 'translate3d(0, 0, 0)' },
        { transform: `translate3d(0, ${-delta}px, 0)` }
      ],
      { duration, easing: 'linear', fill: 'forwards' }
    )
    return new Promise<void>((resolve) => {
      let settled = false
      const commit = (y: number) => {
        if (settled) return
        settled = true
        window.removeEventListener('touchstart', onStop)
        window.removeEventListener('wheel', onWheel)
        const clamped = Math.max(0, y)
        el.style.transform = `translate3d(0, ${from - clamped}px, 0)`
        anim.cancel()
        window.scrollTo(0, clamped)
        el.style.transform = ''
        el.style.willChange = ''
        resolve()
      }
      const onStop = () => commit(from - visualOffset(el))
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        if (performance.now() - started < 90) return
        onStop()
      }
      anim.onfinish = () => commit(to)
      window.addEventListener('touchstart', onStop, { passive: true })
      window.addEventListener('wheel', onWheel, { passive: false })
    })
  }

  async function runLeap(targetFor: (y: number) => number) {
    const root = document.documentElement
    const prevAnchor = root.style.overflowAnchor
    root.style.overflowAnchor = 'none'
    leaping = true
    leapFocus = targetFor(window.scrollY)
    setFeedLeaping(true)
    if (masonry) masonry.style.willChange = 'transform'
    try {
      refreshActive()
      await tick()
      await frame()
      const target = targetFor(window.scrollY)
      if (target !== leapFocus) {
        leapFocus = target
        refreshActive()
        await tick()
      }
      await glide(target)
    } finally {
      leaping = false
      leapFocus = null
      setFeedLeaping(false)
      await tick()
      if (layoutAfterLeap) {
        layoutAfterLeap = false
        masonry?.layout()
        await frame()
      }
      refreshActive()
      if (masonry) masonry.style.willChange = ''
      root.style.overflowAnchor = prevAnchor
    }
  }

  async function prepareLeap(dir: JumpDir): Promise<'jumped' | 'wait'> {
    const vh = window.innerHeight || 1
    const y = window.scrollY
    if (dir === 'up') {
      await runLeap((at) => Math.max(0, at - vh * LEAP_SCREENS))
      ended = false
      syncPhase()
      return 'jumped'
    }
    const bottom = await extendTo(y + vh * AHEAD_SCREENS)
    if (bottom == null || bottom < y + vh * (LEAP_SCREENS + 1)) {
      if (!done) return 'wait'
      await runLeap(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight))
      ended = true
      syncPhase()
      return 'jumped'
    }
    await runLeap((at) => at + vh * LEAP_SCREENS)
    ended = false
    syncPhase()
    return 'jumped'
  }

  async function onJump(dir: JumpDir) {
    if (preparingClick && dir === 'down') return
    const result = await enqueue(() => prepareLeap(dir))
    if (result === 'wait') {
      preparingClick = true
      syncPhase()
      ask()
      return
    }
    scheduleMaintain()
  }

  function handleCardLoad(e: CustomEvent<Event>) {
    e.stopPropagation()
    if (leaping) {
      const card = (e.detail?.target as HTMLElement | undefined)?.closest('[id^="card-"]')
      const index = card ? Number(card.id.slice(5)) : -1
      const post = posts[index]
      if (post && !(post.width > 0 && post.height > 0)) layoutAfterLeap = true
      return
    }
    const img = e.detail?.target as HTMLElement | undefined
    const card = img?.closest('[id^="card-"]') as HTMLElement | null
    const rect = card?.getBoundingClientRect()
    const vh = window.innerHeight || 1
    const inView = !!rect && rect.bottom > 0 && rect.top < vh
    if (img && inView && leapFocus == null) img.dataset.aos = 'fade-up'
    if (inView) AOS.refreshHard()
    masonry?.scheduleLayout(500)
    scheduleMaintain()
  }

  function openLightbox(index: number) {
    lightboxIndex = index
  }

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  function smoothScrollTo(targetY: number, duration = 450, onComplete?: () => void) {
    const startY = window.scrollY
    const diff = targetY - startY
    const t0 = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1)
      window.scrollTo(0, startY + diff * easeInOutCubic(progress))
      if (progress < 1) requestAnimationFrame(step)
      else onComplete?.()
    }
    requestAnimationFrame(step)
  }

  function flashCard(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    const ring = document.createElement('div')
    ring.style.cssText = [
      'position:fixed',
      `left:${rect.left}px`,
      `top:${rect.top}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      'pointer-events:none',
      'z-index:9999',
      'animation:cardRingFlash 0.9s ease-out forwards',
    ].join(';')
    document.body.appendChild(ring)
    ring.addEventListener('animationend', () => ring.remove(), { once: true })
    setTimeout(() => ring.remove(), 1200)
  }

  async function closeLightbox() {
    const idx = lightboxIndex
    lightboxIndex = null
    if (idx != null && idx >= shown && idx < posts.length) {
      shown = idx + 1
    }
    await tick()
    await new Promise<void>((r) => setTimeout(r, 80))
    await layoutPass()

    const tryScroll = (retries: number) => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`card-${idx}`)
        if (el && el.getBoundingClientRect().height > 0) {
          const rect = el.getBoundingClientRect()
          const cardCenterY = rect.top + rect.height / 2
          const viewCenterY = window.innerHeight / 2
          const distance = Math.abs(cardCenterY - viewCenterY)
          if (distance > window.innerHeight * 2) {
            el.scrollIntoView({ block: 'center', behavior: 'instant' })
            requestAnimationFrame(() => requestAnimationFrame(() => flashCard(el)))
          } else {
            smoothScrollTo(window.scrollY + cardCenterY - viewCenterY, 450, () => flashCard(el))
          }
        } else if (retries > 0) {
          tryScroll(retries - 1)
        }
      })
    }
    tryScroll(10)
  }

  onMount(() => {
    bindFeedJump((dir) => {
      void onJump(dir)
    })
    scheduleMaintain()
  })

  onDestroy(() => {
    bindFeedJump(null)
  })
</script>

<svelte:window
  on:scroll={scheduleMaintain}
  on:resize={scheduleMaintain}
  on:wheel={releaseRetry}
  on:touchstart={releaseRetry}
/>

<masonry-layout bind:this={masonry} maxcolwidth="720" gap="0">
  {#each posts.slice(0, shown) as post, i (post.id)}
    <div id="card-{i}">
      <Card
        on:load={handleCardLoad}
        on:view={() => openLightbox(i)}
        url={post.fullUrl ?? post.url}
        title={post.title}
        isEmbed={!!post.embedUrl}
        active={active[i] ?? false}
        width={post.width ?? 0}
        height={post.height ?? 0}
      />
    </div>
  {/each}
</masonry-layout>

{#if lightboxIndex !== null}
  <Lightbox
    {posts}
    bind:currentIndex={lightboxIndex}
    {loadingMore}
    on:close={closeLightbox}
  />
{/if}

<style>
  @keyframes -global-cardRingFlash {
    0%   { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0);    }
    15%  { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.85); }
    70%  { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.45); }
    100% { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0);    }
  }
</style>
