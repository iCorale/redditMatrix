<script lang="ts">
  // components
  import Grid from '@components/Grid.svelte'
  import InfiniteLoading, { InfiniteEvent } from 'svelte-infinite-loading'
  import '@material/mwc-circular-progress'

  // props/stores
  import { params } from '@roxi/routify'
  import { mode, posts } from '@store/app'

  // methods
  import { getPosts } from '@utils/api'
  import { onDestroy, onMount, tick } from 'svelte'
  const handleInfinite = async (e: InfiniteEvent) => {
    try {
      // check if first time
      const after: string = $posts.length ? $posts[$posts.length - 1].id : ''
      // get posts
      const data = await getPosts($params.subreddit, $params.q ?? '', after)
      if (!data.length) {
        e.detail.complete()
        return
      }
      // append posts
      $posts = [...$posts, ...data]
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

  $: identifier = `${$params.subreddit}${$params.q}`
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
