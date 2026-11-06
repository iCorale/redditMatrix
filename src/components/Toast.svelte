<script lang="ts">
  import { fly } from 'svelte/transition'
  import { toast, dismissToast } from '@store/toast'

  function runAction() {
    const action = $toast?.action
    dismissToast()
    action?.run()
  }
</script>

{#if $toast}
  {#key $toast.id}
    <div class="toast" role="status" in:fly={{ y: 16, duration: 220 }} out:fly={{ y: 8, duration: 160 }}>
      <span>{$toast.message}</span>
      {#if $toast.action}
        <button type="button" on:click={runAction}>{$toast.action.label}</button>
      {/if}
    </div>
  {/key}
{/if}

<style lang="scss">
  .toast {
    position: fixed;
    left: 50%;
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
    transform: translateX(-50%);
    z-index: 2000;
    display: flex;
    align-items: center;
    gap: 0.9rem;
    max-width: calc(100vw - 2rem);
    padding: 0.7rem 0.7rem 0.7rem 1.1rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--glass-tint) 82%, transparent);
    border: 1px solid var(--glass-line);
    box-shadow: 0 12px 36px rgb(var(--shadow-color) / 0.35);
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    color: var(--foreground-color);
    font-size: 0.9rem;
    white-space: nowrap;
  }
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 0.4rem;
  }
  button {
    flex: none;
    border: 0;
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    background: var(--accent-gradient);
    color: var(--on-accent);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }
</style>
