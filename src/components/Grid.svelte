<script lang="ts">
  import AOS from 'aos'
  import 'aos/dist/aos.css'
  AOS.init({ once: true, offset: 50 })

  // components
  import '@appnest/masonry-layout'
  import Card from '@components/Card.svelte'

  // props/stores
  type Post = {
    id: string
    title: string
    url: string
  }
  export let posts: Post[]
  import type { MasonryLayout } from '@appnest/masonry-layout'
  let masonry: MasonryLayout

  // methods
  function handleCardLoad(e: Event) {
    e.stopPropagation()
    e.target.dataset.aos = 'fade-up'
    AOS.refreshHard()
    masonry.scheduleLayout(500)
  }
</script>

<masonry-layout bind:this={masonry} maxcolwidth="720" gap="0">
  {#each posts as { url, title, id } (`${id}, ${title}`)}
    <Card on:load={handleCardLoad} {url} {title} />
  {/each}
</masonry-layout>
