<script lang="ts">
  import {flip} from 'svelte/animate'
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  // props/stores
  export let items: any[]
    export let getKey = (item: any) => item

  // icons
  import Close from '~icons/mdi/close'

  // components
  import '@material/mwc-list'
  import '@material/mwc-icon-button'

  export let removeItem = (item: any) => {
    items = items.filter((i) => item !== i)
  }
</script>

<mwc-list>
  {#each items as item (getKey(item))}
    <mwc-list-item
      animate:flip
      transition:fade|local={{ duration: 150 }}
      hasMeta
      on:mousedown|preventDefault
      on:click={() => {
        dispatch('click', item)
      }}
    >
      <slot {item} />
      <mwc-icon-button
        on:click|stopPropagation={() => removeItem(item)}
        slot="meta"
      >
        <Close style="font-size:.6em" />
      </mwc-icon-button>
    </mwc-list-item>
  {/each}
</mwc-list>

<style lang="scss">
  mwc-icon-button {
    --mdc-icon-button-size: inherits;
    --mdc-icon-size: inherits;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: black;
    background-color: rgba(white, 0.5);
    &:hover {
      background-color: rgba(white, 0.7);
    }
  }
</style>
