<script lang="ts">
  import { goto } from '@roxi/routify'

  // props/stores
  import { subreddits } from '@store/user'

  // components
  import CList from './CancellableList.svelte'
</script>

<h2>History:</h2>
{#if subreddits}
  <CList
    on:click={({ detail: subreddit }) => {
      $goto(`/r/${subreddit}`)
    }}
    bind:items={$subreddits}
    let:item={subreddit}
  >
    <span class="prefix">r/</span>{subreddit}
  </CList>
{/if}

<style lang="scss">
  .prefix {
    opacity: 0.5;
    font-weight: bold;
  }
  h2 {
    margin: 0 1rem;
  }
</style>
