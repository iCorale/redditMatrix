<script lang="ts">
  import Navbar from '@components/Navbar.svelte'
  import ScrollButton from '@components/ScrollButton.svelte'
</script>

<Navbar>
  <slot />
</Navbar>
<ScrollButton />
