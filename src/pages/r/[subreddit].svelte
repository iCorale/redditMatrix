<script lang="ts">
  // components
  import Grid from '@components/Grid.svelte'

  // icons
  import ImageOff from '~icons/mdi/image-off-outline'
  import CloudOff from '~icons/mdi/cloud-off-outline'

  // props/stores
  import { goto, params } from '@roxi/routify'
  import { mode, posts, sort, refreshSignal, topRange } from '@store/app'
  import { rememberCover } from '@store/user'
  import { showToast } from '@store/toast'
  import type { SortType } from '@utils/api'

  // methods
  import { getPosts, sharpCover } from '@utils/api'
  import { onDestroy, onMount, tick } from 'svelte'

  let _fetchInFlight = false
  let fetching = false
  let feedDone = false
  let failed = false
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
      const data = await getPosts($params.subreddit, $params.q ?? '', after, $sort, $topRange)
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
    failed = false
    try {
      const more = await fetchNextPage()
      if (more === 'error') failed = true
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
          input?.focus()
        }
        break
      default:
        break
    }
  }
  const SORT_KEY = (sub: string) => `redditMatrix:sort:${sub}`
  const HINT_KEY = 'redditMatrix:hint:longpress'

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
  $: range = $sort === 'top' && !$params.q ? $topRange : ''
  $: identifier = `${$params.subreddit}|${$params.q ?? ''}|${$sort}|${range}|${$refreshSignal}`
  let seenIdentifier = ''
  let coverTaken = false
  $: if (identifier !== seenIdentifier) {
    seenIdentifier = identifier
    epoch.n += 1
    $posts = []
    feedDone = false
    failed = false
    coverTaken = !!$params.q
  }

  $: if (!coverTaken && $posts.length) {
    coverTaken = true
    const first = $posts.find((p) => !p.embedUrl && sharpCover(p.url)) ?? $posts.find((p) => sharpCover(p.url))
    if (first) rememberCover($params.subreddit, first.url)
    if (navigator.maxTouchPoints > 0 && !localStorage.getItem(HINT_KEY)) {
      localStorage.setItem(HINT_KEY, '1')
      setTimeout(() => showToast('长按图片可以多选，再一起复制链接', undefined, 4200), 1800)
    }
  }

  $: empty = $posts.length === 0
</script>

<svelte:head><title>r/{$params.subreddit} · RMatrix</title></svelte:head>

<div class="feed">
  <Grid posts={$posts} done={feedDone} {fetching} on:needMore={handleNeedMore} />
</div>

{#if empty && feedDone}
  <div class="state">
    <span class="icon"><ImageOff /></span>
    <h2>{$params.q ? '没有搜到图片' : '这里没有可以显示的图片'}</h2>
    <p>{$params.q ? '换个关键词试试。' : '这个版块可能不存在，或者只有文字帖。'}</p>
    <button type="button" on:click={() => $goto('/')}>回到首页</button>
  </div>
{:else if empty && failed}
  <div class="state">
    <span class="icon"><CloudOff /></span>
    <h2>没有读到列表</h2>
    <p>版块可能不存在，或者扩展、代理没有在运行。滑动一下重试。</p>
  </div>
{:else if empty}
  <div class="skeleton" aria-busy="true" aria-label="正在加载">
    {#each [1.25, 0.8, 1.5, 1, 1.33, 0.75] as ratio}
      <div class="ghost" style="aspect-ratio: 1 / {ratio}" />
    {/each}
  </div>
{:else if fetching && !feedDone}
  <div class="foot"><span class="rm-spinner" /></div>
{:else if failed}
  <div class="foot note">加载失败，继续滑动重试</div>
{:else if feedDone}
  <div class="foot note">已经到底了 · 共 {$posts.length} 张</div>
{/if}

<style lang="scss">
  .feed {
    padding: 3px;
  }
  .foot {
    display: flex;
    justify-content: center;
    padding: 1.5rem 0 calc(2.5rem + env(safe-area-inset-bottom));
  }
  .note {
    color: var(--faint-color);
    font-size: 0.85rem;
    letter-spacing: 0.02em;
  }
  .state {
    min-height: 60vh;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 0.5rem;
    padding: 2rem;
    text-align: center;
    .icon {
      display: grid;
      place-items: center;
      width: 4.5rem;
      height: 4.5rem;
      margin-bottom: 0.5rem;
      border-radius: 50%;
      background: var(--accent-soft);
      color: var(--accent-color);
      font-size: 2rem;
    }
    h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
    }
    p {
      margin: 0 0 0.75rem;
      max-width: 22rem;
      color: var(--muted-color);
      font-size: 0.92rem;
      line-height: 1.5;
    }
    button {
      border: 0;
      border-radius: 999px;
      padding: 0.65rem 1.3rem;
      background: var(--surface-2);
      color: var(--foreground-color);
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      &:hover {
        background: var(--surface-3);
      }
    }
  }
  .skeleton {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
    align-items: start;
    gap: 3px;
    padding: 0 3px;
  }
  .ghost {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-s);
    background: var(--placeholder-color);
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        100deg,
        transparent 20%,
        color-mix(in srgb, var(--foreground-color) 6%, transparent) 50%,
        transparent 80%
      );
      animation: rm-shimmer 1.6s ease-in-out infinite;
    }
  }
</style>
