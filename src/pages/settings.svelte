<script lang="ts">
  import '@material/mwc-list'

  // props/stores
  import { theme } from '@store/user'

  function colorCallback(value, mode) {
    switch (mode) {
      case 'foreground':
        $theme.foregroundColor = value
        $theme = $theme
        break
      case 'background':
        $theme.backgroundColor = value
        $theme = $theme
        break
      case 'accent':
        $theme.accentColor = value
        $theme = $theme
        break
      default:
        break
    }
  }
  $: {
    const root = document.documentElement
    if ($theme?.accentColor) {
      root.style.setProperty('--accent-color', $theme?.accentColor)
    }
    if ($theme?.backgroundColor) {
      root.style.setProperty('--background-color', $theme?.backgroundColor)
    }
    if ($theme?.foregroundColor) {
      root.style.setProperty('--foreground-color', $theme?.foregroundColor)
    }
  }
</script>

<svelte:head><title>Settings</title></svelte:head>
<mwc-list>
  <mwc-list-item hasMeta>
    <span>Accent Color: {$theme?.accentColor}</span>
    <input
      slot="meta"
      type="color"
      value={$theme?.accentColor}
      on:change={(e) => colorCallback(e.target.value, 'accent')}
    />
  </mwc-list-item>
  <li divider padded role="separator" />
  <mwc-list-item hasMeta>
    <span>Background Color: {$theme?.backgroundColor}</span>
    <input
      slot="meta"
      type="color"
      value={$theme?.backgroundColor}
      on:change={(e) => colorCallback(e.target.value, 'background')}
    />
  </mwc-list-item>
  <li divider padded role="separator" />
  <mwc-list-item hasMeta>
    <span>Foreground Color: {$theme?.foregroundColor}</span>
    <input
      slot="meta"
      type="color"
      value={$theme?.foregroundColor}
      on:change={(e) => colorCallback(e.target.value, 'foreground')}
    />
  </mwc-list-item>
</mwc-list>

<style lang="scss">
  li {
    background-color: var(--foreground-color);
    opacity: 0.1;
  }
</style>
