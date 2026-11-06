<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { flip } from 'svelte/animate'
  import { scale } from 'svelte/transition'

  import Close from '~icons/mdi/close'
  import ChevronLeft from '~icons/mdi/chevron-left'
  import ChevronRight from '~icons/mdi/chevron-right'

  import { covers, forgetSubreddit, restoreSubreddit, subreddits } from '@store/user'
  import { showToast } from '@store/toast'
  import { hueFor } from '@utils/subreddit'

  /** Lower-case text to narrow the list. */
  export let filter = ''

  const dispatch = createEventDispatcher<{ open: string }>()

  let editing = false
  let rail: HTMLDivElement
  let broken = new Set<string>()

  $: shown = filter ? $subreddits.filter((name) => name.includes(filter)) : $subreddits
  $: if (!$subreddits.length) editing = false

  function remove(name: string) {
    const index = $subreddits.indexOf(name)
    forgetSubreddit(name)
    showToast(`已移除 r/${name}`, { label: '撤销', run: () => restoreSubreddit(name, index) }, 4000)
  }

  function page(dir: -1 | 1) {
    rail?.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: 'smooth' })
  }

  function markBroken(name: string) {
    broken.add(name)
    broken = broken
  }
</script>

{#if shown.length}
  <div class="heading">
    <h2>最近</h2>
    <span class="count">{shown.length}</span>
    <span class="tools">
      <button type="button" class="arrow" aria-label="向左" on:click={() => page(-1)}><ChevronLeft /></button>
      <button type="button" class="arrow" aria-label="向右" on:click={() => page(1)}><ChevronRight /></button>
      <button type="button" class="edit" class:on={editing} on:click={() => (editing = !editing)}
        >{editing ? '完成' : '编辑'}</button
      >
    </span>
  </div>
  <div class="rail" bind:this={rail}>
    {#each shown as name (name)}
      {@const cover = $covers[name]}
      <div class="tile" class:editing animate:flip={{ duration: 220 }} out:scale|local={{ duration: 160, start: 0.85 }}>
        <button
          type="button"
          class="cover"
          data-open={editing ? undefined : ''}
          style="--hue: {hueFor(name)}"
          on:click={() => !editing && dispatch('open', name)}
        >
          {#if cover && !broken.has(name)}
            <img src={cover} alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" on:error={() => markBroken(name)} />
          {:else}
            <span class="initial" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          {/if}
          <span class="label"><span class="prefix">r/</span>{name}</span>
        </button>
        {#if editing}
          <button type="button" class="remove" aria-label={`移除 r/${name}`} transition:scale={{ duration: 150 }} on:click={() => remove(name)}>
            <Close />
          </button>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  .heading {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin: 0 1rem;
  }
  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 750;
    letter-spacing: -0.01em;
  }
  .count {
    color: var(--faint-color);
    font-size: 0.9rem;
    font-weight: 600;
  }
  .tools {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
  }
  .arrow {
    display: none;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border: 0;
    border-radius: 50%;
    background: var(--surface-2);
    font-size: 1.2rem;
    &:hover {
      background: var(--surface-3);
    }
  }
  @media (hover: hover) and (pointer: fine) {
    .arrow {
      display: grid;
    }
  }
  .edit {
    border: 0;
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    background: transparent;
    color: var(--muted-color);
    font-size: 0.88rem;
    font-weight: 600;
    &:hover {
      color: var(--foreground-color);
    }
    &.on {
      background: var(--accent-soft);
      color: var(--accent-color);
    }
  }

  .rail {
    display: flex;
    gap: 0.65rem;
    overflow-x: auto;
    padding: 0.7rem 1rem 0.6rem;
    scroll-snap-type: x proximity;
    scroll-padding: 0 1rem;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .tile {
    position: relative;
    flex: none;
    width: 8.25rem;
    scroll-snap-align: start;
  }
  .cover {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 3 / 4;
    padding: 0;
    border: 0;
    border-radius: var(--radius-m);
    overflow: hidden;
    background: linear-gradient(
      150deg,
      hsl(var(--hue) 72% 52%),
      hsl(calc(var(--hue) + 48) 70% 30%)
    );
    box-shadow: 0 10px 24px -14px rgb(var(--shadow-color) / 0.7);
    transition: transform 0.25s var(--ease-spring);
    &:active {
      transform: scale(0.96);
    }
    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s var(--ease-out);
    }
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgb(0 0 0 / 0.75), transparent 55%);
    }
  }
  @media (hover: hover) and (pointer: fine) {
    .cover:hover img {
      transform: scale(1.06);
    }
  }
  .tile.editing .cover {
    animation: wobble 0.5s ease-in-out infinite alternate;
  }
  .tile.editing:nth-child(2n) .cover {
    animation-delay: -0.25s;
  }
  @keyframes wobble {
    from {
      transform: rotate(-1.2deg);
    }
    to {
      transform: rotate(1.2deg);
    }
  }
  .initial {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding-bottom: 1.5rem;
    color: rgb(255 255 255 / 0.9);
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: -0.04em;
  }
  .label {
    position: absolute;
    left: 0.6rem;
    right: 0.6rem;
    bottom: 0.55rem;
    z-index: 1;
    color: #fff;
    font-size: 0.82rem;
    font-weight: 650;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .prefix {
    opacity: 0.6;
  }
  .remove {
    position: absolute;
    top: -0.4rem;
    right: -0.4rem;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 2px solid var(--background-color);
    border-radius: 50%;
    background: var(--foreground-color);
    color: var(--background-color);
    font-size: 1rem;
  }
</style>
