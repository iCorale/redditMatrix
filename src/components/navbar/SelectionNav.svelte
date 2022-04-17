<script lang="ts">
  import { selectedCards } from '@components/Card.svelte'
  import { handleDiscard, handleCopy } from '@components/Card.svelte'

  // icons
  import Copy from '~icons/mdi/content-copy'
  import Close from '~icons/mdi/close'

  // components
  import '@material/mwc-top-app-bar'
  import '@material/mwc-icon-button'

  // props/stores
  export let dense: boolean
</script>

<mwc-top-app-bar {dense}>
  <mwc-icon-button
    aria-label="discard selection"
    on:click={handleDiscard}
    slot="navigationIcon"
  >
    <Close />
  </mwc-icon-button>
  <div slot="title">{$selectedCards} Selected</div>
  <mwc-icon-button aria-label="search" on:click={handleCopy} slot="actionItems">
    <Copy />
  </mwc-icon-button>
  <slot />
</mwc-top-app-bar>
