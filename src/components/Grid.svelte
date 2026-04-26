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
  import { createEventDispatcher } from 'svelte'
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

  function closeLightbox() {
    const idx = lightboxIndex
    lightboxIndex = null
    // After the lightbox unmounts, scroll the card that was last viewed into view
    requestAnimationFrame(() => {
      const el = document.getElementById(`card-${idx}`)
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
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
