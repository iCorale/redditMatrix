<script lang="ts">
  import { spinup } from '@utils/transition'
</script>

<div transition:spinup class="button ripple" />

<style>
  .button {
    width: 10rem;
    aspect-ratio: 1;
    background-color: red;
    /* transform: scale(0); */
  }
</style>
