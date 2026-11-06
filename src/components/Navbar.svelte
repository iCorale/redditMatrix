<script lang="ts">
  import type { ComponentType } from 'svelte'

  // components
  import HomeNav from './navbar/HomeNav.svelte'
  import InputNav from './navbar/InputNav.svelte'
  import PageNav from './navbar/PageNav.svelte'
  import SelectionNav from './navbar/SelectionNav.svelte'
  import SubredditNav from './navbar/SubredditNav.svelte'
  import Results from './Results.svelte'

  // props/stores
  import { query, mode } from '@store/app'
  import { isActive, params } from '@roxi/routify'

  let activeComponent: ComponentType
  let pageTitle: string

  $: onSubreddit = !!$params.subreddit
  $: {
    if ($isActive('/index')) {
      activeComponent = HomeNav
    } else if (onSubreddit && $mode === 'search') {
      activeComponent = InputNav
    } else if ($mode === 'selection') {
      activeComponent = SelectionNav
    } else if (onSubreddit) {
      activeComponent = SubredditNav
    } else {
      activeComponent = PageNav
    }
  }
  $: pageTitle = $isActive('/settings') ? '外观' : ''

  async function handleSearch() {
    $query = ''
    $mode = 'search'
  }
</script>

<svelte:component
  this={activeComponent}
  {...activeComponent === PageNav ? { title: pageTitle } : {}}
  on:search={handleSearch}
/>
{#if onSubreddit && $mode === 'search'}
  <Results bind:input={$query} />
{:else}
  <slot />
{/if}
