<script lang="ts">
  // components
  import Grid from '@components/Grid.svelte'
  import '@material/mwc-circular-progress'

  // props/stores
  import { params } from '@roxi/routify'
  import { mode, posts, sort, refreshSignal } from '@store/app'
  import type { SortType } from '@utils/api'

  // methods
  import { getPosts } from '@utils/api'
  import { onDestroy, onMount, tick } from 'svelte'

  let _fetchInFlight = false
  let fetching = false
  let feedDone = false
  // Bumped when the feed identity changes so a late response cannot append
  // onto the next subreddit, sort, or refresh.
  const epoch = { n: 0 }

  /**
   * Fetches the next page of posts and appends them to the store.
   * `true` when new posts were added, `false` when the feed is exhausted,
   * `error` when the listing could not be read, `busy` when a request is
   * already running, `stale` when the feed changed.
   */
  async function fetchNextPage(): Promise<boolean | 'busy' | 'stale' | 'error'> {
    if (_fetchInFlight) return 'busy'
    _fetchInFlight = true
    const gen = epoch.n
    try {
      // Use postName as pagination cursor (gallery composite ids are invalid "after" values)
      const after = $posts.length ? $posts[$posts.length - 1].postName : ''
      const data = await getPosts($params.subreddit, $params.q ?? '', after, $sort)
      if (gen !== epoch.n) return 'stale'
      if (data === false) return 'error'
      if (!Array.isArray(data) || !data.length) return false
      const existingIds = new Set($posts.map((p) => p.id))
      const fresh = data.filter((p) => !existingIds.has(p.id))
      if (!fresh.length) return false
      if (gen !== epoch.n) return 'stale'
      $posts = [...$posts, ...fresh]
      return true
    } finally {
      _fetchInFlight = false
    }
  }

  /** Called when the laid-out runway or the Lightbox needs another listing page. */
  async function handleNeedMore() {
    if (fetching) return
    fetching = true
    try {
      const more = await fetchNextPage()
      if (more === 'busy' || more === 'stale' || more === 'error') return
      if (!more) feedDone = true
    } finally {
      fetching = false
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

  // Change in sort, subreddit, query, or refreshSignal clears the feed and
  // starts again from the first page.
  $: identifier = `${$params.subreddit}|${$params.q ?? ''}|${$sort}|${$refreshSignal}`
  let seenIdentifier = ''
  $: if (identifier !== seenIdentifier) {
    seenIdentifier = identifier
    epoch.n += 1
    $posts = []
    feedDone = false
  }
</script>

<Grid posts={$posts} done={feedDone} {fetching} on:needMore={handleNeedMore} />
{#if fetching && !feedDone}
  <div class="more">
    <mwc-circular-progress
      style="--mdc-theme-primary:var(--accent-color)"
      indeterminate
    />
  </div>
{/if}

<style>
  .more {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
  }
</style>
