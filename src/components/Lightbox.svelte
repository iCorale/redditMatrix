<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  import Close from '~icons/mdi/close'
  import ChevronLeft from '~icons/mdi/chevron-left'
  import ChevronRight from '~icons/mdi/chevron-right'
  import OpenInNew from '~icons/mdi/open-in-new'

  import type { Post } from '@utils/api'

  export let posts: Post[] = []
  export let currentIndex: number = 0

  $: current = posts[currentIndex]
  $: url = current?.fullUrl ?? current?.url ?? ''
  $: title = current?.title ?? ''
  $: embedUrl = current?.embedUrl ?? null
  // "Open in new tab" target: for embeds, convert iframe URL to watch URL
  $: externalUrl = embedUrl
    ? embedUrl.replace('/ifr/', '/watch/').replace('?autoplay=1', '')
    : url

  let imgLoaded = false
  $: if (currentIndex !== undefined) {
    imgLoaded = false
  }

  function close() {
    dispatch('close')
  }

  function prev() {
    if (currentIndex > 0) currentIndex--
  }

  function next() {
    if (currentIndex < posts.length - 1) currentIndex++
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="overlay" on:click|self={close}>
  <div class="lightbox">
    <div class="header">
      <span class="title" title={title}>{title}</span>
      <div class="actions">
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="icon-btn"
          title="在新标签页打开原图"
        >
          <OpenInNew />
        </a>
        <button class="icon-btn" on:click={close} title="关闭">
          <Close />
        </button>
      </div>
    </div>

    <div class="body">
      {#if currentIndex > 0}
        <button class="nav-btn left" on:click={prev} title="上一张">
          <ChevronLeft />
        </button>
      {/if}

      <div class="img-wrap">
        {#if embedUrl}
          <!-- Video/GIF embed (e.g. redgifs) -->
          <iframe
            src={embedUrl}
            {title}
            frameborder="0"
            allowfullscreen
            scrolling="no"
            allow="autoplay; fullscreen"
            class="embed-frame"
          />
        {:else}
          {#if !imgLoaded}
            <div class="spinner" />
          {/if}
          <img
            src={url}
            alt={title}
            on:load={() => (imgLoaded = true)}
            class:visible={imgLoaded}
          />
        {/if}
      </div>

      {#if currentIndex < posts.length - 1}
        <button class="nav-btn right" on:click={next} title="下一张">
          <ChevronRight />
        </button>
      {/if}
    </div>

    <div class="footer">
      {currentIndex + 1} / {posts.length}
    </div>
  </div>
</div>

<style lang="scss">
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.18s ease;
    padding: 1rem;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .lightbox {
    display: flex;
    flex-direction: column;
    width: min(92vw, 1100px);
    max-height: 92vh;
    background: var(--background-color);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
    animation: scaleIn 0.18s ease;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.96);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem 0.6rem 1rem;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
    flex-shrink: 0;

    .title {
      font-size: 0.875rem;
      color: var(--foreground-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      opacity: 0.85;
    }

    .actions {
      display: flex;
      gap: 0.2rem;
      flex-shrink: 0;
    }
  }

  .body {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .img-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 200px;

    img {
      max-width: 100%;
      max-height: calc(92vh - 7rem);
      object-fit: contain;
      display: block;
      opacity: 0;
      transition: opacity 0.2s;

      &.visible {
        opacity: 1;
      }
    }

    .embed-frame {
      width: 100%;
      height: calc(92vh - 7rem);
      border: none;
      background: #000;
    }
  }

  .spinner {
    position: absolute;
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba(128, 128, 128, 0.3);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .footer {
    text-align: center;
    padding: 0.4rem;
    font-size: 0.78rem;
    color: var(--foreground-color);
    opacity: 0.5;
    flex-shrink: 0;
    border-top: 1px solid rgba(128, 128, 128, 0.15);
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    background: transparent;
    color: var(--foreground-color);
    cursor: pointer;
    border-radius: 50%;
    font-size: 1.15rem;
    opacity: 0.65;
    transition: opacity 0.15s, background 0.15s;
    text-decoration: none;

    &:hover {
      opacity: 1;
      background: rgba(128, 128, 128, 0.18);
    }
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border: none;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    cursor: pointer;
    border-radius: 50%;
    font-size: 1.6rem;
    opacity: 0.8;
    transition: opacity 0.15s, background 0.15s;
    z-index: 2;

    &.left {
      left: 0.75rem;
    }
    &.right {
      right: 0.75rem;
    }

    &:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.85);
    }
  }
</style>
