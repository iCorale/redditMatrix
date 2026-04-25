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

  // lightbox state
  let lightboxIndex: number | null = null

  // methods
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
    lightboxIndex = null
  }
</script>

<masonry-layout bind:this={masonry} maxcolwidth="720" gap="0">
  {#each posts as { url, fullUrl, title, id, embedUrl }, i (`${id}, ${title}`)}
    <Card
      on:load={handleCardLoad}
      on:view={() => openLightbox(i)}
      url={fullUrl ?? url}
      {title}
      isEmbed={!!embedUrl}
    />
  {/each}
</masonry-layout>

{#if lightboxIndex !== null}
  <Lightbox
    {posts}
    bind:currentIndex={lightboxIndex}
    on:close={closeLightbox}
  />
{/if}
