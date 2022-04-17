<script lang="ts">
  import { onMount } from 'svelte'

  // icons
  import Menu from '~icons/mdi/menu'

  // components
  import '@material/mwc-icon-button'

  // props/stores
  import { mode } from '@store/app'
  export let dense: boolean

  // lifecycle hooks
  onMount(() => {
    $mode = 'idle'
  })
</script>

<mwc-top-app-bar {dense}>
  <!-- Menu Icon -->
  <mwc-icon-button aria-label="navigation drawer" slot="navigationIcon">
    <Menu />
  </mwc-icon-button>
  <!-- Title -->
  <div slot="title">RMatrix</div>
  <!-- Main Content -->
  <slot />
</mwc-top-app-bar>
