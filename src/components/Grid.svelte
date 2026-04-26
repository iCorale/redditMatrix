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
  import type { MasonryLayout } from '@appnest/masonry-layout'
  let masonry: MasonryLayout

  // event dispatcher (used to request more posts from the parent)
  import { createEventDispatcher, tick } from 'svelte'
  const dispatch = createEventDispatcher()

  // lightbox state
  let lightboxIndex: number | null = null

  // ── Lightbox preload ──────────────────────────────────────────────────────
  // When the Lightbox is within PRELOAD_THRESHOLD images of the end, ask the
  // parent to fetch the next page in the background.
  const PRELOAD_THRESHOLD = 3
  let _needMoreSent = false   // guard: only dispatch once per batch
  let _lastPostsLen = 0       // detect when new posts arrive

  $: {
    // New posts arrived → allow another preload trigger
    if (posts.length > _lastPostsLen) {
      _lastPostsLen = posts.length
      _needMoreSent = false
    }
    // Approaching the end of the list while Lightbox is open
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

  // True while the user is on the very last loaded post (spinner cue for Lightbox)
  $: loadingMore = lightboxIndex !== null && lightboxIndex === posts.length - 1 && _needMoreSent

  // ── Card / Lightbox helpers ───────────────────────────────────────────────
  function handleCardLoad(e: Event) {
    e.stopPropagation()
    ;(e.target as HTMLElement).dataset.aos = 'fade-up'
    AOS.refreshHard()
    masonry.scheduleLayout(500)
  }

  function openLightbox(index: number) {
    lightboxIndex = index
  }

  // ── Scroll helpers ───────────────────────────────────────────────────────

  /** Ease-in-out cubic: slow start, fast middle, slow end. */
  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  /** Animate window scroll to targetY over `duration` ms with a custom easing.
   *  Calls onComplete when the last frame fires. */
  function smoothScrollTo(targetY: number, duration = 450, onComplete?: () => void) {
    const startY = window.scrollY
    const diff   = targetY - startY
    const t0     = performance.now()
    const step   = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1)
      window.scrollTo(0, startY + diff * easeInOutCubic(progress))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        onComplete?.()
      }
    }
    requestAnimationFrame(step)
  }

  /** Briefly draw a ring around a card so the user can locate it after scroll.
   *  Creates a position:fixed overlay on document.body — cannot be clipped by
   *  any ancestor overflow or hidden by any z-index inside the grid. */
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
    setTimeout(() => ring.remove(), 1200) // safety fallback
  }

  async function closeLightbox() {
    const idx = lightboxIndex
    lightboxIndex = null

    // Wait for Svelte to flush DOM updates (e.g. newly-loaded cards from preload)
    await tick()
    // Let the Lightbox finish unmounting before the page moves
    await new Promise<void>((r) => setTimeout(r, 80))

    // Retry until masonry has laid out the target card
    const tryScroll = (retries: number) => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`card-${idx}`)
        if (el && el.getBoundingClientRect().height > 0) {
          const rect          = el.getBoundingClientRect()
          const cardCenterY   = rect.top + rect.height / 2
          const viewCenterY   = window.innerHeight / 2
          const distance      = Math.abs(cardCenterY - viewCenterY)

          if (distance > window.innerHeight * 2) {
            // Far: instant jump; flash on the next two frames (scroll is sync)
            el.scrollIntoView({ block: 'center', behavior: 'instant' })
            requestAnimationFrame(() => requestAnimationFrame(() => flashCard(el)))
          } else {
            // Nearby: ease-in-out scroll, flash fires in the onComplete callback
            smoothScrollTo(window.scrollY + cardCenterY - viewCenterY, 450, () => flashCard(el))
          }
        } else if (retries > 0) {
          tryScroll(retries - 1)
        }
      })
    }
    tryScroll(10)
  }
</script>

<masonry-layout bind:this={masonry} maxcolwidth="720" gap="0">
  {#each posts as { url, fullUrl, title, id, embedUrl }, i (`${id}, ${title}`)}
    <div id="card-{i}">
      <Card
        on:load={handleCardLoad}
        on:view={() => openLightbox(i)}
        url={fullUrl ?? url}
        {title}
        isEmbed={!!embedUrl}
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
  /* Ring overlay injected via JS onto document.body — position:fixed, immune to
     any overflow clipping. box-shadow spreads outside the div boundary. */
  @keyframes -global-cardRingFlash {
    0%   { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0);    }
    15%  { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.85); }
    70%  { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.45); }
    100% { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0);    }
  }
</style>
