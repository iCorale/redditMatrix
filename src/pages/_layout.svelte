<script lang="ts">
  import Navbar from '@components/Navbar.svelte'
  import ScrollButton from '@components/ScrollButton.svelte'
  import Toast from '@components/Toast.svelte'
</script>

<Navbar><slot /></Navbar>
<ScrollButton />
<Toast />
