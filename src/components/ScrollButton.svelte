<script lang="ts">
  import ChevronUp from '~icons/mdi/chevron-up'
  import ChevronDown from '~icons/mdi/chevron-down'

  const SHOW_THRESHOLD = 200   // scrollY must exceed this before button appears
  const DIR_THRESHOLD  = 150   // cumulative px in one direction to flip the icon

  let scrollY = 0
  let prevScrollY = 0
  let accumulated = 0          // +ve = downward, -ve = upward
  let direction: 'down' | 'up' = 'down'

  $: visible = scrollY > SHOW_THRESHOLD

  // Called on every scroll event via svelte:window bind
  $: {
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
    if (direction === 'up') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    }
  }
</script>

<svelte:window bind:scrollY />

{#if visible}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button
    class="scroll-btn"
    on:click={handleClick}
    title={direction === 'up' ? '回到顶部' : '滚到底部'}
  >
    {#if direction === 'up'}
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
