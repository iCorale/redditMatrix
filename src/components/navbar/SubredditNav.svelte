<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  // icons
  import ArrowBack from '~icons/mdi/arrow-back'
  import Search from '~icons/mdi/search'

  // components
  import '@material/mwc-top-app-bar'
  import '@material/mwc-icon-button'

  // props/stores
  import { mode } from '@store/app'
  import { goto, params } from '@roxi/routify'

  export let dense: boolean

  // methods
  function handleNavButton() {
    $goto('/')
  }

  // lifecycle hooks
  onMount(() => {
    $mode = 'idle'
  })
</script>

<mwc-top-app-bar {dense}>
  <!-- Back Button -->
  <mwc-icon-button
    aria-label="home"
    on:click={handleNavButton}
    slot="navigationIcon"
  >
    <ArrowBack />
  </mwc-icon-button>
  <!-- Title -->
  <div slot="title">{$params.subreddit}</div>
  <!-- Search Button -->
  <mwc-icon-button
    aria-label="search"
    on:click={() => dispatch('search')}
    slot="actionItems"
  >
    <Search />
  </mwc-icon-button>
  <slot />
</mwc-top-app-bar>
