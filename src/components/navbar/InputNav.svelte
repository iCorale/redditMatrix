<script lang="ts">
  import { onMount } from 'svelte'

  // icons
  import ArrowBack from '~icons/mdi/arrow-left'
  import Search from '~icons/mdi/magnify'

  // components
  import AppBar from './AppBar.svelte'

  // props/stores
  import { query, mode } from '@store/app'
  import { goto, params } from '@roxi/routify'
  import { searches } from '@store/user'

  let input: HTMLInputElement

  onMount(async () => {
    Promise.resolve().then(() => input.focus())
  })

  // methods
  function handleSearch(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      $mode = 'idle'
      return
    }
    if (e.key !== 'Enter') return
    const text = $query.trim()
    if (text && !$searches.includes(text.toLowerCase())) {
      $searches.push(text.toLowerCase())
      $searches.sort()
      $searches = $searches
    }
    const base = `/r/${$params.subreddit}`
    $goto(text ? `${base}?q=${encodeURIComponent(text)}` : base)
    $mode = 'idle'
  }
</script>

<AppBar pinned>
  <button
    slot="lead"
    type="button"
    class="bar-btn"
    aria-label="返回"
    on:click={() => {
      $mode = 'idle'
    }}
  >
    <ArrowBack />
  </button>

  <label slot="title" class="field">
    <Search />
    <input
      bind:this={input}
      id="searchbar"
      type="search"
      enterkeyhint="search"
      autocomplete="off"
      on:keydown={handleSearch}
      bind:value={$query}
      placeholder={`在 r/${$params.subreddit} 中搜索`}
    />
  </label>
</AppBar>

<style lang="scss">
  .field {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 2.5rem;
    margin-right: 0.5rem;
    padding: 0 0.9rem;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--muted-color);
    font-size: 1.1rem;
    &:focus-within {
      box-shadow: 0 0 0 2px var(--accent-color);
    }
  }
  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    color: var(--foreground-color);
    outline: none;
    border: none;
    font-size: 1rem;
    font-weight: 500;
    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
    }
  }
</style>
