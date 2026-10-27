<script context="module" lang="ts">
  let keptExpanded = false
</script>

<script lang="ts">
  import { goto } from '@roxi/routify'
  import { rememberSubreddit, subreddits } from '@store/user'

  const preview = 12
  let expanded = keptExpanded
  $: keptExpanded = expanded

  $: shown = expanded ? $subreddits : $subreddits.slice(0, preview)
  $: hidden = Math.max(0, $subreddits.length - preview)

  function open(name: string) {
    rememberSubreddit(name)
    $goto(`/r/${name}`)
  }

  function remove(name: string) {
    $subreddits = $subreddits.filter((item) => item !== name)
  }
</script>

<div class="heading">
  <h2>History</h2>
  <span class="count">{$subreddits.length}</span>
</div>
{#if shown.length}
  <div class="chips">
    {#each shown as name (name)}
      <span class="chip">
        <button type="button" on:click={() => open(name)}>
          <span class="prefix">r/</span>{name}
        </button>
        <button
          type="button"
          class="remove"
          aria-label="Remove"
          on:click={() => remove(name)}>×</button
        >
      </span>
    {/each}
    {#if !expanded && hidden > 0}
      <button type="button" class="more" on:click={() => (expanded = true)}
        >+{hidden}</button
      >
    {:else if expanded && hidden > 0}
      <button type="button" class="more" on:click={() => (expanded = false)}
        >Less</button
      >
    {/if}
  </div>
{/if}

<style lang="scss">
  .heading {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0 1rem;
  }
  h2 {
    margin: 0;
    font-size: 1.15rem;
  }
  .count {
    opacity: 0.5;
    font-size: 0.9rem;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0 1rem;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(128, 128, 128, 0.55);
    border-radius: 999px;
    &:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }
  }
  button {
    background: transparent;
    color: inherit;
    border: 0;
    font: inherit;
    font-size: 0.9rem;
    cursor: pointer;
  }
  .chip > button:not(.remove) {
    padding: 0.3rem 0.15rem 0.3rem 0.7rem;
  }
  .chip > .remove {
    padding: 0.3rem 0.65rem 0.3rem 0.25rem;
    opacity: 0.55;
    font-size: 0.95rem;
    line-height: 1;
  }
  .more {
    border: 1px solid var(--accent-color);
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    color: var(--accent-color);
    &:hover {
      background: color-mix(in srgb, var(--accent-color) 14%, transparent);
    }
  }
  .prefix {
    opacity: 0.5;
    font-weight: bold;
  }
</style>
