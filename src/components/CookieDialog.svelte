<script lang="ts">
  import { getCookie, setCookie, clearCookie, hasCookie } from '@utils/cookieStore'

  export let open = false
  let value = ''
  let saved = false

  $: if (open) {
    value = getCookie() || ''
    saved = hasCookie()
  }

  function save() {
    setCookie(value)
    saved = true
    setTimeout(() => {
      saved = false
      close()
    }, 600)
  }

  function clear() {
    clearCookie()
    value = ''
    saved = false
  }

  function close() {
    open = false
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="backdrop" on:click={close} on:keydown={onKeydown}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="dialog" on:click|stopPropagation>
      <h2>Reddit Cookie</h2>
      <p class="hint">
        Paste your Reddit.com session cookie to bypass OAuth during development.
        Open DevTools → Application → Cookies → reddit.com, copy all
        <code>Name=Value</code> pairs joined with <code>; </code>.
        <strong>This is stored in your browser only and never sent to any server
        except the API proxy.</strong>
      </p>

      <textarea
        bind:value
        placeholder="token_v2=...; reddit_session=...; ..."
        rows="4"
      />

      <div class="actions">
        <button class="save" on:click={save} disabled={!value.trim()}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
        <button class="clear" on:click={clear} disabled={!value}>
          Clear
        </button>
        <button class="close" on:click={close}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog {
    background: var(--background-color);
    border: 1px solid var(--foreground-color);
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 480px;
    width: 90vw;
    color: var(--foreground-color);
  }

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: var(--accent-color);
  }

  .hint {
    font-size: 0.78rem;
    line-height: 1.5;
    opacity: 0.7;
    margin: 0 0 0.75rem;

    code {
      background: rgba(128, 128, 128, 0.2);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 0.72rem;
    }
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.05);
    color: var(--foreground-color);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 4px;
    padding: 0.5rem;
    font-family: monospace;
    font-size: 0.75rem;
    resize: vertical;
    outline: none;

    &:focus {
      border-color: var(--accent-color);
    }
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    justify-content: flex-end;

    button {
      padding: 0.4rem 0.9rem;
      border: none;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      color: var(--background-color);

      &:disabled {
        opacity: 0.4;
        cursor: default;
      }
    }

    .save {
      background: #4caf50;
    }
    .clear {
      background: #f44336;
    }
    .close {
      background: rgba(128, 128, 128, 0.3);
      color: var(--foreground-color);
    }
  }
</style>
