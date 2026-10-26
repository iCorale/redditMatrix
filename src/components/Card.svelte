<script lang="ts" context="module">
  import { mode } from '@store/app'
  import { feedLeaping } from '@store/feed'
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
  import { onMount, tick, createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  import { longpress } from '@utils/actions'
  import { spinup } from '@utils/transition'

  // State
  export let checked = writable<boolean>(false)
  export let title: string, url: string
  export let isEmbed: boolean = false
  /** Attach the original only while this card is on screen or pinned. */
  export let active = false
  export let width = 0
  export let height = 0
  let missing = !url
  let loaded = false
  let learnedW = 0
  let learnedH = 0
  let heldW = 0
  let heldH = 0

  $: if (!active && loaded) loaded = false
  // Learning a ratio mid-leap resizes the column and makes the glide hitch.
  $: if (!$feedLeaping && heldW > 0) {
    learnedW = heldW
    learnedH = heldH
    heldW = 0
    heldH = 0
  }
  $: ratioCss =
    learnedW > 0 && learnedH > 0
      ? `${learnedW} / ${learnedH}`
      : width > 0 && height > 0
        ? `${width} / ${height}`
        : '1 / 1'

  // Icons
  import Check from '~icons/mdi/check-circle'

  function learn(e: Event) {
    const img = e.currentTarget as HTMLImageElement
    loaded = true
    if (!(width > 0 && height > 0) && img.naturalWidth > 0) {
      if (get(feedLeaping)) {
        heldW = img.naturalWidth
        heldH = img.naturalHeight
      } else {
        learnedW = img.naturalWidth
        learnedH = img.naturalHeight
      }
    }
    dispatch('load', e)
  }

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
  {#if isEmbed}
    <div class="play-badge">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.14v14l11-7-11-7z" />
      </svg>
    </div>
  {/if}
  <div
    class="img"
    class:dim={$checked}
    class:pending={!loaded || missing}
    style="aspect-ratio: {ratioCss}"
    use:longpress={{ callback: handleSelection }}
    on:click={() => {
      if ($mode === 'selection') {
        if ($selectedCards >= 1) handleSelection(true)
      } else {
        dispatch('view')
      }
    }}
  >
    <div class="backdrop" />
    {#if active && url && !missing}
      <img
        referrerpolicy="no-referrer"
        on:error|once={() => {
          missing = true
        }}
        on:load={learn}
        alt={title}
        src={url}
      />
    {/if}
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
  div.play-badge {
    justify-self: start;
    align-self: end;
    z-index: 3;
    margin: 0.5rem;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.52);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    svg {
      width: 0.85rem;
      height: 0.85rem;
      color: #fff;
      margin-left: 0.1rem;
    }
  }
  div.img {
    display: grid;
    width: 100%;
    &.pending {
      background: color-mix(in srgb, var(--foreground-color) 12%, var(--background-color));
    }
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
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
