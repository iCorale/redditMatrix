<script lang="ts">
  import { onMount, tick } from 'svelte'

  // components
  import '@material/mwc-top-app-bar'
  import HomeNav from './navbar/HomeNav.svelte'
  import InputNav from './navbar/InputNav.svelte'
  import SelectionNav from './navbar/SelectionNav.svelte'
  import SubredditNav from './navbar/SubredditNav.svelte'
  import Results from './Results.svelte'

  let dense: boolean = false

  // lifecycle hooks
  onMount(async () => {
    dense = window.innerWidth > 768
    window.addEventListener('resize', () => {
      dense = window.innerWidth > 768
    })
  })

  // props/stores
  import { query, mode } from '@store/app'
  import { isActive } from '@roxi/routify'

  let activeComponent

  $: {
    if ($isActive('/index')) {
      activeComponent = HomeNav
    } else if ($mode === 'idle') {
      activeComponent = SubredditNav
    } else if ($mode === 'search') {
      activeComponent = InputNav
    } else if ($mode === 'selection') {
      activeComponent = SelectionNav
    }
  }

  async function handleSearch() {
    $query = ''
    $mode = 'search'
  }
</script>

<svelte:component this={activeComponent} {dense} on:search={handleSearch} />
{#if $mode === 'search'}
  <Results bind:input={$query} />
{:else}
  <slot />
{/if}
