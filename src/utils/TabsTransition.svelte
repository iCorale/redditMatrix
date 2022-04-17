<script>
  import { BaseTransition } from '@roxi/routify/decorators'
  import { fade } from 'svelte/transition'

  const configs = [
    {
      condition: (c) => c.routes[1] != c.routes[0],
      transition: fade
    }
  ]
</script>

<BaseTransition {configs} style="transform-origin: top">
  <slot />
</BaseTransition>
