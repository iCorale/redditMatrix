<script context="module" lang="ts">
  const relatedCache = new Map<string, string[]>()
</script>

<script lang="ts">
  import { onDestroy, onMount, createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  // icons
  import ArrowBack from '~icons/mdi/arrow-left'
  import Search from '~icons/mdi/magnify'
  import Close from '~icons/mdi/close'
  import StarOutline from '~icons/mdi/star-four-points-outline'
  import Fire from '~icons/mdi/fire'
  import ClockOutline from '~icons/mdi/clock-outline'
  import TrophyOutline from '~icons/mdi/trophy-outline'
  import TrendingUp from '~icons/mdi/trending-up'

  // components
  import AppBar from './AppBar.svelte'

  // props/stores
  import { mode, sort, refreshSignal, topRange, TOP_RANGES, type TopRange } from '@store/app'
  import { relatedSubreddits } from '@store/feed'
  import { showToast } from '@store/toast'
  import { goto, params } from '@roxi/routify'
  import { getRelated, type SortType } from '@utils/api'

  let relatedFor = ''

  async function loadRelated(name: string) {
    const key = name.toLowerCase()
    const cached = relatedCache.get(key)
    if (cached) {
      relatedSubreddits.set(cached)
      return
    }
    relatedSubreddits.set([])
    const names = await getRelated(name)
    if (relatedFor !== name) return
    if (!Array.isArray(names)) return
    relatedCache.set(key, names)
    relatedSubreddits.set(names)
  }

  $: if ($params.subreddit && $params.subreddit !== relatedFor) {
    relatedFor = $params.subreddit
    loadRelated($params.subreddit)
  }

  onMount(() => {
    $mode = 'idle'
  })

  onDestroy(() => {
    relatedFor = ''
    relatedSubreddits.set([])
  })

  const sortOptions: { value: SortType; label: string; icon: typeof StarOutline }[] = [
    { value: 'hot', label: '热门', icon: Fire },
    { value: 'new', label: '最新', icon: ClockOutline },
    { value: 'top', label: '排行', icon: TrophyOutline },
    { value: 'rising', label: '上升', icon: TrendingUp },
    { value: 'best', label: '推荐', icon: StarOutline }
  ]

  const rangeLabels: Record<TopRange, string> = {
    day: '今天',
    week: '本周',
    month: '本月',
    year: '今年',
    all: '全部'
  }

  function pickSort(value: SortType) {
    if ($sort === value) {
      $refreshSignal++
      window.scrollTo(0, 0)
      showToast('已刷新')
    } else {
      $sort = value
      window.scrollTo(0, 0)
    }
  }

  function pickRange(value: TopRange) {
    if ($topRange === value) return
    $topRange = value
    window.scrollTo(0, 0)
  }

  $: searching = !!$params.q
  $: showRange = $sort === 'top' && !searching
</script>

<AppBar>
  <button
    slot="lead"
    type="button"
    class="bar-btn"
    aria-label="回到首页"
    title="回到首页"
    on:click={() => $goto('/')}
  >
    <ArrowBack />
  </button>
  <div slot="title" class="title">
    <span class="name"><span class="prefix">r/</span>{$params.subreddit}</span>
    {#if searching}
      <button
        type="button"
        class="query"
        title="清除搜索"
        on:click={() => $goto(`/r/${$params.subreddit}`)}
      >
        <Search />
        <span>{$params.q}</span>
        <Close />
      </button>
    {/if}
  </div>
  <button
    slot="actions"
    type="button"
    class="bar-btn"
    aria-label="在版块内搜索"
    title="在版块内搜索（/）"
    on:click={() => dispatch('search')}
  >
    <Search />
  </button>

  <div slot="below" class="below">
    <div class="sorts" role="tablist">
      {#each sortOptions as option (option.value)}
        <button
          type="button"
          role="tab"
          class="sort"
          class:active={$sort === option.value}
          aria-selected={$sort === option.value}
          title={$sort === option.value ? '再点一次刷新' : option.label}
          on:click={() => pickSort(option.value)}
        >
          <svelte:component this={option.icon} />
          {option.label}
        </button>
      {/each}
    </div>
    {#if showRange}
      <div class="ranges">
        {#each TOP_RANGES as range (range)}
          <button
            type="button"
            class="range"
            class:active={$topRange === range}
            on:click={() => pickRange(range)}>{rangeLabels[range]}</button
          >
        {/each}
      </div>
    {/if}
  </div>
</AppBar>

<style lang="scss">
  .title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
    padding-left: 0.15rem;
  }
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .prefix {
    color: var(--muted-color);
    font-weight: 600;
  }
  .query {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-width: 0;
    max-width: 45%;
    flex: none;
    border: 0;
    border-radius: 999px;
    padding: 0.3rem 0.55rem;
    background: var(--accent-soft);
    color: var(--accent-color);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :global(svg) {
      flex: none;
      font-size: 0.95rem;
    }
  }

  .below {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 0.75rem 0.6rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .sorts,
  .ranges {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-bottom: -8px;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .sort {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    height: 2.15rem;
    padding: 0 0.95rem;
    border: 0;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--muted-color);
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.2s,
      color 0.2s,
      transform 0.15s var(--ease-spring);
    :global(svg) {
      font-size: 1rem;
    }
    &:hover {
      color: var(--foreground-color);
    }
    &:active {
      transform: scale(0.96);
    }
    &.active {
      background: var(--accent-gradient);
      color: var(--on-accent);
      box-shadow: 0 6px 18px -6px var(--accent-color);
    }
  }
  .range {
    flex: none;
    height: 1.75rem;
    padding: 0 0.75rem;
    border: 1px solid var(--line-color);
    border-radius: 999px;
    background: transparent;
    color: var(--muted-color);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    &.active {
      border-color: var(--accent-color);
      color: var(--accent-color);
      background: var(--accent-soft);
    }
  }
</style>
