<script lang="ts">
  import ChevronUp from '~icons/mdi/chevron-up'
  import ChevronDown from '~icons/mdi/chevron-down'
  import { feedBound, feedLeaping, feedPhase, requestFeedJump } from '@store/feed'

  const SHOW_THRESHOLD = 200   // scrollY must exceed this before button appears
  const DIR_THRESHOLD  = 150   // cumulative px in one direction to flip the icon

  let scrollY = 0
  let prevScrollY = 0
  let accumulated = 0          // +ve = downward, -ve = upward
  let direction: 'down' | 'up' = 'down'

  $: visible = scrollY > SHOW_THRESHOLD
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
</script>

<svelte:window bind:scrollY />

{#if visible}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button
    class="scroll-btn"
    on:click={handleClick}
    title={label}
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

<style lang="scss">
  .scroll-btn {
    position: fixed;
    bottom: 1.5rem;
    right: 1.25rem;
    z-index: 500;
    width: 2.625rem;
    height: 2.625rem;
    border-radius: 50%;
    border: none;
    background: var(--background-color, #1e1e1e);
    box-shadow:
      0 1px 4px rgba(0, 0, 0, 0.25),
      0 4px 16px rgba(0, 0, 0, 0.2);
    color: var(--foreground-color, #fff);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    transition: transform 0.15s, box-shadow 0.15s;
    animation: popIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: scale(1.08);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.3),
        0 6px 20px rgba(0, 0, 0, 0.25);
    }

    &:active {
      transform: scale(0.93);
    }
  }

  .spin {
    width: 1.15rem;
    height: 1.15rem;
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

  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.6);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
