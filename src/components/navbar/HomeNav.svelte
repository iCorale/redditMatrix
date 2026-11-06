<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '@roxi/routify'

  import Palette from '~icons/mdi/palette-outline'

  import AppBar from './AppBar.svelte'
  import { mode } from '@store/app'

  onMount(() => {
    $mode = 'idle'
  })
</script>

<AppBar>
  <span slot="title" class="brand">RMatrix</span>
  <button
    slot="actions"
    type="button"
    class="bar-btn"
    aria-label="外观设置"
    title="外观设置"
    on:click={() => $goto('/settings')}
  >
    <Palette />
  </button>
</AppBar>

<style>
  .brand {
    padding-left: 0.6rem;
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
</style>
