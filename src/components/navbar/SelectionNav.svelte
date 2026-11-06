<script lang="ts">
  import { selectedCards } from '@components/Card.svelte'
  import { handleDiscard, handleCopy } from '@components/Card.svelte'
  import { showToast } from '@store/toast'

  // icons
  import Copy from '~icons/mdi/content-copy'
  import Close from '~icons/mdi/close'

  // components
  import AppBar from './AppBar.svelte'

  async function copy() {
    const result = await handleCopy()
    if (result.copied) showToast(`已复制 ${result.count} 个链接`)
    else showToast('复制失败，浏览器没有允许访问剪贴板')
  }
</script>

<AppBar pinned>
  <button slot="lead" type="button" class="bar-btn" aria-label="取消选择" on:click={handleDiscard}>
    <Close />
  </button>
  <span slot="title">已选 <b>{$selectedCards}</b> 张</span>
  <button slot="actions" type="button" class="copy" on:click={copy}>
    <Copy />
    复制链接
  </button>
</AppBar>

<style>
  b {
    color: var(--accent-color);
  }
  .copy {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 2.4rem;
    margin-right: 0.35rem;
    padding: 0 1rem;
    border: 0;
    border-radius: 999px;
    background: var(--accent-gradient);
    color: var(--on-accent);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
  }
</style>
