// Attributes the Material web components read that Svelte's element types do not list.
export {}

declare module 'svelte/elements' {
  // Places an icon into a web component slot, e.g. <Search slot="icon" /> in <mwc-fab>.
  interface SVGAttributes<T extends EventTarget> {
    slot?: string | undefined | null
  }

  // <mwc-list> divider rows.
  interface HTMLLiAttributes {
    divider?: boolean | undefined | null
    padded?: boolean | undefined | null
  }
}
