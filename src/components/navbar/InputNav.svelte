<script lang="ts">
  import { onMount } from 'svelte'

  // icons
  import ArrowBack from '~icons/mdi/arrow-back'

  // components
  import '@material/mwc-top-app-bar'
  import '@material/mwc-icon-button'

  // props/stores
  import { query, mode } from '@store/app'
  import { goto, params } from '@roxi/routify'
  import { searches } from '@store/user'

  export let dense: boolean
  let input: HTMLInputElement

  onMount(async () => {
    Promise.resolve().then(() => input.focus())
  })

  // methods
  function handleSearch(e: any) {
    if (e.key === 'Enter') {
      if (!$searches.includes($query.toLowerCase())) {
        $searches.push($query.toLowerCase())
        $searches.sort()
        $searches = $searches
      }
      $goto(`/r/${$params.subreddit}?q=${$query}`)
      $mode = 'idle'
    }
  }
</script>

<mwc-top-app-bar {dense}>
  <!-- Navigation Icon -->
  <mwc-icon-button
    aria-label="back"
    on:click={() => {
      $mode = 'idle'
    }}
    slot="navigationIcon"
  >
    <ArrowBack />
  </mwc-icon-button>

  <!-- Search Bar -->
  <input
    bind:this={input}
    id="searchbar"
    autocomplete="off"
    on:keypress={handleSearch}
    bind:value={$query}
    slot="title"
    placeholder={`Search r/${$params.subreddit}`}
  />
  <slot />
</mwc-top-app-bar>

<style lang="scss">
  input {
    background-color: var(--mdc-theme-primary);
    color: var(--mdc-theme-on-primary);
    outline: none;
    border: none;
    font-size: 1em;
    font-weight: 500;
    flex-grow: 1;
    line-height: 1;
  }
</style>
