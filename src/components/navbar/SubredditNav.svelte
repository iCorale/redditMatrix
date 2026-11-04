<script context="module" lang="ts">
  const relatedCache = new Map<string, string[]>()
</script>

<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  // icons
  import ArrowBack from '~icons/mdi/arrow-back'
  import Search from '~icons/mdi/search'
  import StarOutline from '~icons/mdi/star-outline'
  import Fire from '~icons/mdi/fire'
  import ClockOutline from '~icons/mdi/clock-outline'
  import TrophyOutline from '~icons/mdi/trophy-outline'
  import TrendingUp from '~icons/mdi/trending-up'
  import HubOutline from '~icons/mdi/hub-outline'

  // components
  import '@material/mwc-top-app-bar'
  import '@material/mwc-icon-button'

  // props/stores
  import { mode, sort, refreshSignal } from '@store/app'
  import { rememberSubreddit } from '@store/user'
  import { goto, params } from '@roxi/routify'
  import { getRelated } from '@utils/api'

  export let dense: boolean

  let related: string[] = []
  let relatedFor = ''
  let open = false
  let swallowClick = false

  function handleNavButton() {
    $goto('/')
  }

  function openRelated(name: string) {
    open = false
    rememberSubreddit(name)
    $goto(`/r/${name}`)
  }

  function maybeClose(event: PointerEvent) {
    if (!open) return
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('.related-dock')) return
    open = false
    if (target.closest('.scroll-btn')) return
    swallowClick = true
  }

  function swallow(event: MouseEvent) {
    if (!swallowClick) return
    swallowClick = false
    event.preventDefault()
    event.stopPropagation()
  }

  async function loadRelated(name: string) {
    const key = name.toLowerCase()
    const cached = relatedCache.get(key)
    if (cached) {
      related = cached
      return
    }
    related = []
    const names = await getRelated(name)
    if (relatedFor !== name) return
    if (!Array.isArray(names)) return
    relatedCache.set(key, names)
    related = names
  }

  $: if ($params.subreddit && $params.subreddit !== relatedFor) {
    open = false
    relatedFor = $params.subreddit
    loadRelated($params.subreddit)
  }

  onMount(() => {
    $mode = 'idle'
  })


  const sortOptions = [
    { value: 'best', label: '最优', icon: StarOutline },
    { value: 'hot', label: '热门', icon: Fire },
    { value: 'new', label: '最新', icon: ClockOutline },
    { value: 'top', label: '最佳', icon: TrophyOutline },
    { value: 'rising', label: '上升', icon: TrendingUp },
  ]
</script>

<mwc-top-app-bar {dense}>
  <mwc-icon-button
    aria-label="home"
    on:click={handleNavButton}
    slot="navigationIcon"
  >
    <ArrowBack />
  </mwc-icon-button>
  <div slot="title">{$params.subreddit}</div>
  <mwc-icon-button
    aria-label="search"
    on:click={() => dispatch('search')}
    slot="actionItems"
  >
    <Search />
  </mwc-icon-button>
  <slot />
</mwc-top-app-bar>

<div class="sort-tabs">
  {#each sortOptions as option}
    <button
      class="sort-tab"
      class:active={$sort === option.value}
      on:click={() => {
        if ($sort === option.value) {
          // Already on this sort — re-click means "refresh"
          $refreshSignal++
        } else {
          $sort = option.value
        }
      }}
    >
      <svelte:component this={option.icon} />
      {option.label}
    </button>
    {/each}
</div>

<svelte:window
  on:pointerdown|capture={maybeClose}
  on:click|capture={swallow}
/>

{#if related.length}
  <div class="related-dock">
    {#if open}
      <div class="related-row">
        {#each related as name (name)}
          <button type="button" on:click={() => openRelated(name)}>
            <span class="prefix">r/</span>{name}
          </button>
        {/each}
      </div>
    {/if}
    <button
      type="button"
      class="related-pill"
      aria-label="相关版块"
      aria-expanded={open}
      title="相关版块"
      on:click={() => (open = !open)}
    >
      <HubOutline />
    </button>
  </div>
{/if}

<style lang="scss">
  .sort-tabs {
    display: flex;
    background: var(--background-color);
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
    overflow-x: auto;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .sort-tab {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.55rem 1rem;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--foreground-color);
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
    opacity: 0.55;
    transition: opacity 0.15s; // only hover opacity animates; active state is instant

    &.active {
      border-bottom-color: var(--accent-color);
      color: var(--accent-color);
      opacity: 1;
    }

    &:hover {
      opacity: 0.85;
    }
  }

  .related-dock {
    position: fixed;
    z-index: 500;
    right: 1.25rem;
    bottom: calc(1.5rem + 2.625rem + 0.55rem);
  }

  .related-pill {
    width: 2.625rem;
    height: 2.625rem;
    padding: 0;
    border: 1px solid color-mix(in srgb, var(--foreground-color) 22%, transparent);
    border-radius: 50%;
    background: color-mix(in srgb, var(--background-color) 58%, transparent);
    color: var(--foreground-color, #fff);
    box-shadow:
      0 8px 28px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 color-mix(in srgb, var(--foreground-color) 22%, transparent);
    backdrop-filter: blur(26px) saturate(1.8);
    -webkit-backdrop-filter: blur(26px) saturate(1.8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    :global(svg) {
      width: 0.85rem;
      height: 0.85rem;
    }
  }

  .related-row {
    position: fixed;
    left: 0.75rem;
    right: 0.75rem;
    bottom: calc(1.5rem + 2.625rem + 0.55rem + 2.625rem + 0.45rem);
    display: flex;
    gap: 0.4rem;
    padding: 0.35rem 0.45rem;
    overflow-x: auto;
    background: color-mix(in srgb, var(--background-color) 58%, transparent);
    border: 1px solid color-mix(in srgb, var(--foreground-color) 22%, transparent);
    border-radius: 999px;
    box-shadow:
      0 8px 28px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 color-mix(in srgb, var(--foreground-color) 22%, transparent);
    backdrop-filter: blur(26px) saturate(1.8);
    -webkit-backdrop-filter: blur(26px) saturate(1.8);
    &::-webkit-scrollbar {
      display: none;
    }

    button {
      flex: none;
      background: transparent;
      color: var(--foreground-color);
      border: 1px solid color-mix(in srgb, var(--foreground-color) 30%, transparent);
      border-radius: 999px;
      font: inherit;
      font-size: 0.85rem;
      padding: 0.25rem 0.65rem;
      cursor: pointer;
      white-space: nowrap;
      &:hover {
        border-color: var(--accent-color);
        color: var(--accent-color);
      }
    }

    .prefix {
      opacity: 0.5;
      font-weight: bold;
    }
  }
</style>
