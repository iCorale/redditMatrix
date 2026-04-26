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

  // components
  import '@material/mwc-top-app-bar'
  import '@material/mwc-icon-button'

  // props/stores
  import { mode, sort, refreshSignal } from '@store/app'
  import { goto, params } from '@roxi/routify'

  export let dense: boolean

  function handleNavButton() {
    $goto('/')
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
</style>
