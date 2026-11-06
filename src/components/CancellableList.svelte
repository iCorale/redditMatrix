<script lang="ts">
  import { flip } from 'svelte/animate'
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  // props/stores
  export let items: any[]
  export let getKey = (item: any) => item

  // icons
  import Close from '~icons/mdi/close'
  import History from '~icons/mdi/history'

  export let removeItem = (item: any) => {
    items = items.filter((i) => item !== i)
  }
</script>

<ul>
  {#each items as item (getKey(item))}
    <li animate:flip={{ duration: 180 }} transition:fade|local={{ duration: 150 }}>
      <button
        type="button"
        class="pick"
        on:mousedown|preventDefault
        on:click={() => dispatch('click', item)}
      >
        <History />
        <slot {item} />
      </button>
      <button
        type="button"
        class="remove"
        aria-label="删除这条记录"
        on:mousedown|preventDefault
        on:click|stopPropagation={() => removeItem(item)}
      >
        <Close />
      </button>
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    list-style: none;
    margin: 0 auto;
    padding: 0.5rem;
    max-width: 44rem;
  }
  li {
    display: flex;
    align-items: center;
    border-radius: var(--radius-m);
    &:hover {
      background: var(--surface-1);
    }
  }
  button {
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .pick {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.85rem 0.75rem;
    font-size: 1rem;
    text-align: left;
    :global(svg) {
      flex: none;
      color: var(--faint-color);
      font-size: 1.15rem;
    }
  }
  .remove {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    color: var(--faint-color);
    font-size: 1.05rem;
    &:hover {
      color: var(--foreground-color);
      background: var(--surface-2);
    }
  }
</style>
