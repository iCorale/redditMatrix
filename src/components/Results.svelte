<script context="module" lang="ts">
  const worker = new ComlinkWorker<typeof import('../utils/search')>(
    new URL('../utils/search.ts', import.meta.url)
  )
</script>

<script lang="ts">
  import { searches } from '@store/user'
  import { mode } from '@store/app'
  import { goto, params } from '@roxi/routify'

  // Components
  import CList from './CancellableList.svelte'

  // State
  export let input: string = ''

  let items: string[] = []

  interface Match {
    value: string
    score: number
  }

  $: if (searches && input.trim() !== '') {
    ;(async function () {
      const matches: Match[] = await worker.search($searches, input)
      items = matches.map((match) => match.value)
    })()
  } else {
    items = $searches ?? []
  }

  // Methods
  function pick(item: string) {
    input = item
    $goto(`/r/${$params.subreddit}?q=${encodeURIComponent(item)}`)
    $mode = 'idle'
  }

  function removeItem(item: string) {
    $searches = $searches.filter((i) => item !== i)
  }
</script>

<CList
  on:click={({ detail: item }) => pick(item)}
  bind:items
  let:item
  {removeItem}
>
  <span class="item">{item}</span>
</CList>
{#if !items.length}
  <p class="empty">{input.trim() ? '回车搜索' : '还没有搜索记录'}</p>
{/if}

<style>
  .item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .empty {
    margin: 2rem 1rem;
    text-align: center;
    color: var(--faint-color);
  }
</style>
