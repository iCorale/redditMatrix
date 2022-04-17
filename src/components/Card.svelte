<script lang="ts" context="module">
  import { mode } from '@store/app'
  import { get, writable, derived } from 'svelte/store'
  const cards = writable([])

  export function handleDiscard() {
    get(cards).forEach((card) => {
      card.checked.set(false)
    })
    cards.set(get(cards))
    mode.set('idle')
  }

  export function handleCopy() {
    const urls = []
    get(cards).forEach((card) => {
      if (get(card.checked)) {
        urls.push(card.url)
      }
    })
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urls.join('\n'))
    }
    handleDiscard()
  }

  export const selectedCards = derived(cards, (cards) =>
    cards.reduce((count, card) => {
      get(card.checked) && count++
      return count
    }, 0)
  )
</script>

<script lang="ts">
  import { onMount, tick } from 'svelte'

  import { longpress } from '@utils/actions'
  import { spinup } from '@utils/transition'

  // State
  export let checked = writable<boolean>(false)
  export let title: string, url: string
  let card: HTMLImageElement

  // Icons
  import Check from '~icons/mdi/check-circle'

  // Methods
  /* checkSize:
  Checks if the image size is known.
   */
  function checkSize() {
    if (card?.naturalWidth) {
      card.style.aspectRatio = 'auto'
    } else {
      requestAnimationFrame(checkSize)
    }
  }
  requestAnimationFrame(checkSize)

  /* checkSize:
    // TODO: Write docs
   */
  async function handleSelection(click = false) {
    if ($selectedCards > 1 && !click) {
      return
    }
    $checked = !$checked
    $cards = $cards
    await tick()
    if ($cards.some((card) => get(card.checked))) {
      $mode = 'selection'
    } else {
      $mode = 'idle'
    }
  }

  onMount(() => {
    $cards.push({ checked, url })
  })
</script>

<section>
  {#if $checked}
    <div class="check">
      <div transition:spinup|local>
        <Check style="font-size: 1.5rem; color: var(--foreground-color)" />
      </div>
    </div>
  {/if}
  <div class="img" class:dim={$checked}

      use:longpress={{ callback: handleSelection }}
      on:click={() =>
        $selectedCards >= 1 && $mode === 'selection' && handleSelection(true)}
    >
    <div class="backdrop" />
    <img
      bind:this={card}
      loading="lazy"
      on:error|once={() => {
        card.style.display = 'none'
      }}
      on:load
      alt={title}
      src={url}
    />
  </div>
</section>

<style lang="scss">
  section {
    display: grid;
    justify-items: end;
    * {
      grid-area: 1 / -1;
    }
  }
  div.check {
    padding-block-start: 1rem;
    padding-inline-end: 1rem;
    z-index: 3;
  }
  div.img {
    display: grid;
    width: 100%;
    &.dim {
      div.backdrop {
        clip-path: circle(200% at center bottom);
      }
    }
  }
  div.backdrop {
    grid-area: 1 / -1;
    z-index: 2;
    clip-path: circle(0% at center bottom);
    transition: clip-path 0.2s ease-in-out;
    backdrop-filter: brightness(50%);
  }
  img {
    grid-area: 1 / -1;
    aspect-ratio: 1;
    display: block;
    width: 100%;
  }
</style>
