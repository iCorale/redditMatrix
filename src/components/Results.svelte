<script context="module" lang="ts">
  const worker = new ComlinkWorker<typeof import('../utils/search')>(
    new URL('../utils/search.ts', import.meta.url)
  )
</script>

<script lang="ts">
  import { searches } from '@store/user'

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
  function removeItem(item: string) {
    $searches = $searches.filter((i) => item !== i)
  }
</script>

<CList
  on:click={({ detail: item }) => (input = item)}
  bind:items
  let:item
  {removeItem}
>
  <span>{item}</span>
</CList>
