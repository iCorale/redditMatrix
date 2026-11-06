<script lang="ts">
  import { goto } from '@roxi/routify'
</script>

<main>
  <p class="code">404</p>
  <h1>这个页面不存在</h1>
  <button type="button" on:click={() => $goto('/')}>回到首页</button>
</main>

<style>
  main {
    min-height: 70vh;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 0.75rem;
    text-align: center;
    padding: 2rem;
  }
  .code {
    margin: 0;
    font-size: 5rem;
    font-weight: 800;
    letter-spacing: -0.05em;
    line-height: 1;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  h1 {
    margin: 0 0 0.75rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--muted-color);
  }
  button {
    border: 0;
    border-radius: 999px;
    padding: 0.7rem 1.4rem;
    background: var(--surface-2);
    color: var(--foreground-color);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover {
    background: var(--surface-3);
  }
</style>
