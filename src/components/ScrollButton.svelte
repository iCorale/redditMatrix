<script lang="ts">
  import ChevronUp from '~icons/mdi/chevron-up'
  import ChevronDown from '~icons/mdi/chevron-down'
  import HubOutline from '~icons/mdi/hub-outline'
  import { goto } from '@roxi/routify'
  import { feedBound, feedLeaping, feedPhase, requestFeedJump, relatedSubreddits } from '@store/feed'
  import { rememberSubreddit } from '@store/user'

  const SHOW_THRESHOLD = 200   // off the feed, scrollY must exceed this before the button appears
  const DIR_THRESHOLD  = 150   // cumulative px in one direction to flip the icon

  let scrollY = 0
  let prevScrollY = 0
  let accumulated = 0          // +ve = downward, -ve = upward
  let direction: 'down' | 'up' = 'down'

  // On the feed the jump stays put from the start, so the dock never shifts.
  $: showJump = $feedBound || scrollY > SHOW_THRESHOLD
  $: related = $relatedSubreddits
  $: segments = (related.length ? 1 : 0) + (showJump ? 1 : 0)
  $: goingUp = $feedPhase === 'ended' || direction === 'up'
  $: withinOneLeap =
    typeof window !== 'undefined' && scrollY <= window.innerHeight * 6
  $: label =
    $feedPhase === 'preparing' && !goingUp
      ? '正在准备下一段'
      : goingUp
        ? !$feedBound || withinOneLeap
          ? '回到顶部'
          : '往上跳一段'
        : $feedBound
          ? '往下跳一段'
          : '滚到底部'

  // The leap animation scrolls past the direction threshold. Ignore it, or one
  // tap would flip the button before the user can tap again.
  $: if ($feedLeaping || Math.abs(scrollY - prevScrollY) > (typeof window === 'undefined' ? 800 : window.innerHeight)) {
    prevScrollY = scrollY
    accumulated = 0
  } else {
    const delta = scrollY - prevScrollY
    if (delta !== 0) {
      accumulated += delta

      if (accumulated > DIR_THRESHOLD) {
        direction = 'down'
        accumulated = 0
      } else if (accumulated < -DIR_THRESHOLD) {
        direction = 'up'
        accumulated = 0
      }

      prevScrollY = scrollY
    }
  }

  function handleClick() {
    if ($feedPhase === 'preparing' && !goingUp) return
    if (!$feedBound) {
      if (goingUp) window.scrollTo({ top: 0, behavior: 'smooth' })
      else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
      return
    }
    direction = goingUp ? 'up' : 'down'
    accumulated = 0
    prevScrollY = scrollY
    requestFeedJump(direction)
  }

  // ── Related subreddits ────────────────────────────────────────────────────
  let open = false
  let swallowClick = false
  let shownFor = related
  $: if (related !== shownFor) {
    shownFor = related
    open = false
  }

  function openRelated(name: string) {
    open = false
    rememberSubreddit(name)
    $goto(`/r/${name}`)
  }

  // A tap outside only closes the row; it should not also hit what is underneath.
  function maybeClose(event: PointerEvent) {
    if (!open) return
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('.related-row, .related-seg')) return
    open = false
    if (target.closest('.dock')) return
    swallowClick = true
  }

  function swallow(event: MouseEvent) {
    if (!swallowClick) return
    swallowClick = false
    event.preventDefault()
    event.stopPropagation()
  }
</script>

<svelte:window
  bind:scrollY
  on:pointerdown|capture={maybeClose}
  on:click|capture={swallow}
/>

{#if open && related.length}
  <div class="related-row" style="--segments: {segments}">
    {#each related as name (name)}
      <button type="button" on:click={() => openRelated(name)}>
        <span class="prefix">r/</span>{name}
      </button>
    {/each}
  </div>
{/if}

{#if segments}
  <div class="dock">
    {#if related.length}
      <button
        type="button"
        class="seg related-seg"
        class:on={open}
        aria-label="相关版块"
        aria-expanded={open}
        title="相关版块"
        on:click={() => (open = !open)}
      >
        <HubOutline />
      </button>
    {/if}
    {#if showJump}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button
        class="seg scroll-btn"
        on:click={handleClick}
        title={label}
        aria-label={label}
        aria-busy={$feedPhase === 'preparing'}
      >
        {#if $feedPhase === 'preparing' && !goingUp}
          <span class="spin" aria-hidden="true" />
        {:else if goingUp}
          <ChevronUp />
        {:else}
          <ChevronDown />
        {/if}
      </button>
    {/if}
  </div>
{/if}

<style lang="scss">
  $size: 2.625rem;
  $edge: 1.5rem;

  %glass {
    background: color-mix(in srgb, var(--background-color) 58%, transparent);
    border: 1px solid color-mix(in srgb, var(--foreground-color) 22%, transparent);
    box-shadow:
      0 8px 28px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 color-mix(in srgb, var(--foreground-color) 22%, transparent);
    backdrop-filter: blur(26px) saturate(1.8);
    -webkit-backdrop-filter: blur(26px) saturate(1.8);
  }

  .dock {
    @extend %glass;
    position: fixed;
    bottom: $edge;
    right: 1.25rem;
    z-index: 500;
    width: $size;
    display: flex;
    flex-direction: column;
    border-radius: $size;
    overflow: hidden;
    animation: dockIn 0.2s ease;
  }

  .seg {
    position: relative;
    width: 100%;
    height: $size;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--foreground-color, #fff);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    -webkit-tap-highlight-color: transparent;

    & + .seg::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0.6rem;
      right: 0.6rem;
      height: 1px;
      background: color-mix(in srgb, var(--foreground-color) 16%, transparent);
    }

    &:hover {
      background: color-mix(in srgb, var(--foreground-color) 8%, transparent);
    }

    &:active,
    &.on {
      background: color-mix(in srgb, var(--foreground-color) 14%, transparent);
    }
  }

  // The hub glyph fills its 24-unit box; the chevron only spans 12 × 7.4 of it.
  // The chevron's solid stroke reads heavier, so the hub is drawn a little wider.
  .related-seg {
    font-size: 0.9rem;
  }

  .scroll-btn {
    font-size: 1.4rem;
  }

  .related-row {
    @extend %glass;
    position: fixed;
    left: 0.75rem;
    right: 0.75rem;
    bottom: calc(#{$edge} + var(--segments) * #{$size} + 0.5rem);
    z-index: 500;
    display: flex;
    gap: 0.4rem;
    padding: 0.35rem 0.45rem;
    overflow-x: auto;
    border-radius: 999px;
    animation: dockIn 0.15s ease;
    &::-webkit-scrollbar {
      display: none;
    }

    button {
      flex: none;
      background: transparent;
      color: var(--foreground-color);
      border: 1px solid color-mix(in srgb, var(--foreground-color) 30%, transparent);
      border-radius: 999px;
      font: inherit;
      font-size: 0.85rem;
      padding: 0.25rem 0.65rem;
      cursor: pointer;
      white-space: nowrap;
      &:hover {
        border-color: var(--accent-color);
        color: var(--accent-color);
      }
    }

    .prefix {
      opacity: 0.5;
      font-weight: bold;
    }
  }

  .spin {
    width: 1.05rem;
    height: 1.05rem;
    border-radius: 50%;
    border: 2px solid currentColor;
    border-right-color: transparent;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes dockIn {
    from {
      opacity: 0;
    }
  }
</style>
