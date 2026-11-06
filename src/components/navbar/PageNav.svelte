<script lang="ts">
  import { goto } from '@roxi/routify'
  import ArrowBack from '~icons/mdi/arrow-left'
  import AppBar from './AppBar.svelte'

  export let title = ''
</script>

<AppBar>
  <button
    slot="lead"
    type="button"
    class="bar-btn"
    aria-label="回到首页"
    title="回到首页"
    on:click={() => $goto('/')}
  >
    <ArrowBack />
  </button>
  <span slot="title">{title}</span>
</AppBar>
