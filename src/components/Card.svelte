<script lang="ts" context="module">
  import { mode } from '@store/app'
  import { feedLeaping } from '@store/feed'
  import { get, writable, derived, type Writable } from 'svelte/store'
  const cards = writable<{ checked: Writable<boolean>; url: string }[]>([])

  export function handleDiscard() {
    get(cards).forEach((card) => {
      card.checked.set(false)
    })
    cards.set(get(cards))
    mode.set('idle')
  }

  export async function handleCopy(): Promise<{ copied: boolean; count: number }> {
    const urls: string[] = []
    get(cards).forEach((card) => {
      if (get(card.checked)) {
        urls.push(card.url)
      }
    })
    let copied = false
    try {
      await navigator.clipboard.writeText(urls.join('\n'))
      copied = true
    } catch {
      copied = false
    }
    handleDiscard()
    return { copied, count: urls.length }
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
  import { getRedgifsMedia, peekRedgifsMedia, redgifsSlug, sharpCover } from '@utils/api'
  import { spinup } from '@utils/transition'

  // State
  export let checked = writable<boolean>(false)
  export let title: string, url: string
  export let embedUrl = ''
  export let isEmbed: boolean = false
  /** Attach the original only while this card is on screen or pinned. */
  export let active = false
  export let width = 0
  export let height = 0
  let fetched = ''
  let posterState: 'idle' | 'pending' | 'none' | 'failed' | 'done' = 'idle'
  let failedImage = false
  let failedFor = ''
  $: sharp = sharpCover(url)
  $: cover = fetched || sharp
  $: if (failedImage && (fetched || sharp) !== failedFor) failedImage = false
  $: if (!active && posterState === 'failed') posterState = 'idle'
  $: if (active && isEmbed && posterState === 'idle') {
    const slug = redgifsSlug(embedUrl)
    if (!slug) posterState = 'none'
    else {
      const known = peekRedgifsMedia(slug)
      if (known) {
        if (known.poster && !sharp) fetched = known.poster
        posterState = known.video || known.poster || sharp ? 'done' : 'none'
      } else {
        posterState = 'pending'
        const requested = slug
        getRedgifsMedia(requested).then((result) => {
          if (redgifsSlug(embedUrl) !== requested) return
          if (result === false) posterState = 'failed'
          else if (!result.video && !result.poster && !sharpCover(url)) posterState = 'none'
          else {
            if (result.poster && !sharpCover(url)) fetched = result.poster
            posterState = 'done'
          }
        })
      }
    }
  }
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

  const record = { checked, url: '' }
  $: record.url = cover
  onMount(() => {
    $cards.push(record)
  })
</script>

<section class:checked={$checked}>
  {#if $checked}
    <div class="check">
      <div class="check-dot" transition:spinup|local>
        <Check />
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
    class:pending={!cover || !loaded || failedImage}
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
    {#if active && cover && !failedImage}
      <img
        referrerpolicy="no-referrer"
        class:shown={loaded}
        on:error|once={() => {
          failedFor = cover
          failedImage = true
        }}
        on:load={learn}
        alt={title}
        src={cover}
      />
    {/if}
    {#if title}
      <div class="caption" aria-hidden="true"><span>{title}</span></div>
    {/if}
  </div>
</section>

<style lang="scss">
  section {
    display: grid;
    justify-items: end;
    border-radius: var(--radius-s);
    overflow: hidden;
    isolation: isolate;
    cursor: pointer;
    transition: box-shadow 0.2s;
    * {
      grid-area: 1 / -1;
    }
    &.checked {
      box-shadow: inset 0 0 0 3px var(--accent-color);
    }
  }
  div.check {
    padding-block-start: 0.75rem;
    padding-inline-end: 0.75rem;
    z-index: 4;
  }
  div.check-dot {
    display: grid;
    place-items: center;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 50%;
    background: var(--accent-gradient);
    color: var(--on-accent);
    font-size: 1.2rem;
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.35);
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
    position: relative;
    display: grid;
    width: 100%;
    overflow: hidden;
    background: var(--placeholder-color);
    &.pending::after {
      content: '';
      grid-area: 1 / -1;
      z-index: 1;
      background: linear-gradient(
        100deg,
        transparent 20%,
        color-mix(in srgb, var(--foreground-color) 6%, transparent) 50%,
        transparent 80%
      );
      animation: rm-shimmer 1.6s ease-in-out infinite;
      pointer-events: none;
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
    opacity: 0;
    transition:
      opacity 0.45s var(--ease-out),
      transform 0.6s var(--ease-out);
    &.shown {
      opacity: 1;
    }
  }
  .caption {
    grid-area: 1 / -1;
    z-index: 3;
    align-self: end;
    display: flex;
    align-items: flex-end;
    min-height: 40%;
    padding: 0.9rem 1rem 0.85rem;
    background: linear-gradient(to top, rgb(0 0 0 / 0.72), rgb(0 0 0 / 0.25) 55%, transparent);
    color: #fff;
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.4;
    text-shadow: 0 1px 2px rgb(0 0 0 / 0.4);
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 0.25s,
      transform 0.3s var(--ease-out);
    pointer-events: none;
    span {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  @media (hover: hover) and (pointer: fine) {
    section:hover {
      .caption {
        opacity: 1;
        transform: none;
      }
      img.shown {
        transform: scale(1.025);
      }
    }
  }
</style>
