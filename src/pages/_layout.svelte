<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import Navbar from '@components/Navbar.svelte'
  import ScrollButton from '@components/ScrollButton.svelte'
  import CookieDialog from '@components/CookieDialog.svelte'

  let cookieOpen = false

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault()
      cookieOpen = true
    }
  }

  let tapCount = 0
  let tapTimer: ReturnType<typeof setTimeout>
  function handleTriggerTap() {
    tapCount++
    clearTimeout(tapTimer)
    if (tapCount >= 7) { tapCount = 0; cookieOpen = true }
    else { tapTimer = setTimeout(() => (tapCount = 0), 1500) }
  }

  onMount(() => document.addEventListener('keydown', handleKeydown))
  onDestroy(() => document.removeEventListener('keydown', handleKeydown))
</script>

<Navbar><slot /></Navbar>
<ScrollButton />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="cookie-trigger" on:click={handleTriggerTap} />
<CookieDialog bind:open={cookieOpen} />

<style>
  .cookie-trigger {
    position: fixed; bottom: 0; left: 0;
    width: 48px; height: 48px; z-index: 10000;
  }
</style>
