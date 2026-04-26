<script lang="ts">
  // components
  import Grid from '@components/Grid.svelte'
  import InfiniteLoading from 'svelte-infinite-loading'
  import type { InfiniteEvent } from 'svelte-infinite-loading'
  import '@material/mwc-circular-progress'

  // props/stores
  import { params } from '@roxi/routify'
  import { mode, posts, sort, refreshSignal } from '@store/app'
  import type { SortType } from '@utils/api'

  // methods
  import { getPosts } from '@utils/api'
  import { onDestroy, onMount, tick } from 'svelte'

  let _fetchInFlight = false

  /**
   * Fetches the next page of posts and appends them to the store.
   * Returns true if new posts were added, false if the feed is exhausted.
   * Guards against concurrent calls with _fetchInFlight.
   */
  async function fetchNextPage(): Promise<boolean> {
    if (_fetchInFlight) return false
    _fetchInFlight = true
    try {
      // Use postName as pagination cursor (gallery composite ids are invalid "after" values)
      const after = $posts.length ? $posts[$posts.length - 1].postName : ''
      const data = await getPosts($params.subreddit, $params.q ?? '', after, $sort)
      if (!Array.isArray(data) || !data.length) return false
      const existingIds = new Set($posts.map((p) => p.id))
      const fresh = data.filter((p) => !existingIds.has(p.id))
      if (!fresh.length) return false
      $posts = [...$posts, ...fresh]
      return true
    } finally {
      _fetchInFlight = false
    }
  }

  const handleInfinite = async (e: InfiniteEvent) => {
    try {
      const hasMore = await fetchNextPage()
      if (hasMore) {
        setTimeout(e.detail.loaded, 1500)
      } else {
        e.detail.complete()
      }
    } catch {
      setTimeout(e.detail.error, 1500)
    }
  }

  /** Called by Grid when the Lightbox approaches the last loaded post. */
  function handleNeedMore() {
    fetchNextPage() // fire-and-forget; store update triggers Grid reactivity
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
  const SORT_KEY = (sub: string) => `redditMatrix:sort:${sub}`

  onMount(() => {
    document.body.addEventListener('keypress', handleKeyPress)
  })

  onDestroy(() => {
    document.body.removeEventListener('keypress', handleKeyPress)
  })

  // ── Sort persistence ──────────────────────────────────────────────────────
  // Problem: routify reuses the same component instance when navigating between
  // subreddits (only $params changes). A naive "$: save $sort" would write the
  // *previous* subreddit's sort into the *new* subreddit's key before the
  // restore runs, corrupting stored preferences.
  //
  // Fix: track which subreddit is "active". When it changes, restore first,
  // then let subsequent $sort changes save to the correct key.
  let _activeSub = ''

  $: if ($params.subreddit && $params.subreddit !== _activeSub) {
    // Subreddit changed (or initial load): restore saved sort, then update tracker
    _activeSub = $params.subreddit
    const saved = localStorage.getItem(SORT_KEY(_activeSub)) as SortType | null
    $sort = saved ?? 'hot'
  }

  // Persist sort — always keyed to _activeSub so a mid-navigation $sort value
  // can never be written to the wrong subreddit
  $: if (_activeSub) {
    localStorage.setItem(SORT_KEY(_activeSub), $sort)
  }

  // identifier drives InfiniteLoading reset: change in sort, subreddit, query,
  // or refreshSignal all clear posts and restart from the first page.
  $: identifier = `${$params.subreddit}|${$params.q ?? ''}|${$sort}|${$refreshSignal}`
  $: {
    identifier
    $posts = []
  }
</script>

<Grid posts={$posts} on:needMore={handleNeedMore} />
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
