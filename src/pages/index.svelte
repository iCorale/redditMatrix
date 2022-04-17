<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { goto } from '@roxi/routify'
  import { mode } from '@store/app'
  import { subreddits } from '@store/user'

  // icons
  import Search from '~icons/mdi/search'

  // components
  import List from '@components/List.svelte'
  import '@material/mwc-textfield'
  import '@material/mwc-fab'

  // props/stores
  let value: string = ''
  let input: any

  //lifecycle hooks
  onMount(async () => {
    $mode = 'idle'
    document.body.addEventListener('keypress', handleKeyPress)
  })
  onDestroy(() => {
    document.body.removeEventListener('keypress', handleKeyPress)
  })

  // methods
  function handleKeyPress(e: KeyboardEvent) {
    switch (e.key) {
      case '/':
        if (input !== document.activeElement) {
          e.preventDefault()
          input.focus()
        }
        break
      default:
        break
    }
  }

  function handleSearch() {
    if (value) {
      if (!$subreddits.includes(value.toLowerCase())) {
        $subreddits.push(value.toLowerCase())
        $subreddits.sort()
        $subreddits = $subreddits
      }
      $goto(`/r/${value}`)
    }
  }
</script>

<main>
  <!-- Search Bar -->
  <section id="search">
    <mwc-textfield
      bind:this={input}
      on:keyup={(e) => {
        value = e.target.value
        if (e.key === 'Enter') {
          handleSearch()
        }
      }}
      label="Subreddit"
    />
    <mwc-fab label="search" on:click={handleSearch}>
      <Search slot="icon" />
    </mwc-fab>
  </section>
  <!-- List -->
  <section id="list">
    <List />
  </section>
</main>

<style lang="scss">
  main {
    max-width: 60rem;
    margin: 0 auto;
    min-height: 100vh;
    display: grid;
    padding: 1rem 0;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: minmax(min-content, max-content);
    #search {
      padding: 0 1rem;
      gap: 1rem;
      display: flex;
      grid-column: 1/-1;
    }
    #list {
      grid-column: 1/-1;
    }
  }
  mwc-textfield {
    flex-grow: 1;
  }
</style>
