<script lang="ts">
  // components
  import Grid from '@components/Grid.svelte'
  import InfiniteLoading from 'svelte-infinite-loading'
  import type { InfiniteEvent } from 'svelte-infinite-loading'
  import '@material/mwc-circular-progress'

  // props/stores
  import { params } from '@roxi/routify'
  import { mode, posts, sort } from '@store/app'

  // methods
  import { getPosts } from '@utils/api'
  import { onDestroy, onMount, tick } from 'svelte'
  const handleInfinite = async (e: InfiniteEvent) => {
    try {
      // Use postName (original Reddit "t3_xxx" name) as the pagination cursor.
      // Gallery posts have composite ids like "t3_xxx_mediaId" which Reddit
      // does not recognise as a valid `after` value, causing the same page to
      // be returned again and producing duplicate-key errors.
      const after: string = $posts.length ? $posts[$posts.length - 1].postName : ''
      const data = await getPosts($params.subreddit, $params.q ?? '', after, $sort)
      if (!Array.isArray(data) || !data.length) {
        e.detail.complete()
        return
      }
      // Deduplicate by id as a safety net against API pagination overlap
      const existingIds = new Set($posts.map((p) => p.id))
      const fresh = data.filter((p) => !existingIds.has(p.id))
      if (!fresh.length) {
        e.detail.complete()
        return
      }
      $posts = [...$posts, ...fresh]
      setTimeout(e.detail.loaded, 1500)
    } catch {
      setTimeout(e.detail.error, 1500)
    }
  }

  async function handleKeyPress(e: KeyboardEvent) {
    let input
    switch (e.key) {
      case '/':
        e.preventDefault()
        input = document.getElementById('searchbar')
        if (input) {
          if (input !== document.activeElement) {
            input.focus()
          }
        } else {
          $mode = 'search'
          await tick()
          input = document.getElementById('searchbar')
          input.focus()
        }
        break
      default:
        break
    }
  }
  //lifecycle hooks
  onMount(async () => {
    document.body.addEventListener('keypress', handleKeyPress)
  })
  onDestroy(() => {
    document.body.removeEventListener('keypress', handleKeyPress)
  })

  $: identifier = `${$params.subreddit}${$params.q}${$sort}`
  $: {
    identifier
    $posts = []
  }
</script>

<Grid posts={$posts} />
<div style="padding: 1rem 0">
  <InfiniteLoading {identifier} on:infinite={handleInfinite}>
    <svelte:fragment slot="spinner">
      <mwc-circular-progress
        style="--mdc-theme-primary:var(--accent-color)"
        indeterminate
      />
    </svelte:fragment>
  </InfiniteLoading>
</div>
