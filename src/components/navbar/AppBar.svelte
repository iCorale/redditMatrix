<script lang="ts">
  import { feedLeaping } from '@store/feed'

  /** Keep the bar on screen, e.g. while typing or selecting. */
  export let pinned = false

  const TRAVEL = 12

  let height = 0
  let hidden = false
  let lastY = 0
  let travel = 0

  function onScroll() {
    const y = window.scrollY
    const delta = y - lastY
    lastY = y
    if (pinned || y <= height) {
      hidden = false
      travel = 0
      return
    }
    if ($feedLeaping) return
    if (Math.sign(delta) !== Math.sign(travel)) travel = 0
    travel += delta
    if (travel > TRAVEL) hidden = true
    else if (travel < -TRAVEL) hidden = false
  }

  $: if (pinned) hidden = false
</script>

<svelte:window on:scroll|passive={onScroll} />

<header class:hidden bind:offsetHeight={height}>
  <div class="row">
    <div class="lead"><slot name="lead" /></div>
    <div class="title"><slot name="title" /></div>
    <div class="actions"><slot name="actions" /></div>
  </div>
  <slot name="below" />
</header>
<div class="spacer" style="height: {height}px" />

<style lang="scss">
  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 600;
    padding-top: env(safe-area-inset-top);
    background: var(--glass-color);
    border-bottom: 1px solid var(--line-color);
    backdrop-filter: blur(28px) saturate(1.8);
    -webkit-backdrop-filter: blur(28px) saturate(1.8);
    transition: transform 0.32s var(--ease-out);
    &.hidden {
      transform: translateY(-100%);
    }
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    height: var(--appbar-height);
    padding: 0 0.5rem;
    max-width: 80rem;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .lead,
  .actions {
    display: flex;
    align-items: center;
    flex: none;
  }
  .title {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    font-size: 1.08rem;
    font-weight: 650;
    letter-spacing: -0.01em;
  }
  .spacer {
    flex: none;
  }

  /* Shared round icon button for every bar. */
  header :global(.bar-btn) {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--foreground-color);
    font-size: 1.35rem;
    cursor: pointer;
    transition: background 0.15s;
    &:hover {
      background: var(--surface-2);
    }
    &:active {
      background: var(--surface-3);
    }
  }
</style>
