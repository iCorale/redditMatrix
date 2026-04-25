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
  <!-- Navigation arrows -->
  {#if currentIndex > 0}
    <button class="nav-btn left" on:click={prev} title="上一张">
      <ChevronLeft />
    </button>
  {/if}
  {#if currentIndex < posts.length - 1}
    <button class="nav-btn right" on:click={next} title="下一张">
      <ChevronRight />
    </button>
  {/if}

  <!-- Top-right controls -->
  <div class="top-actions">
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="icon-btn"
      title="在新标签页打开"
    >
      <OpenInNew />
    </a>
    <button class="icon-btn" on:click={close} title="关闭">
      <Close />
    </button>
  </div>

  <!-- Content -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="img-wrap" on:click|self={close}>
    {#if embedUrl}
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

  <!-- Subtle page counter (only for multi-image galleries) -->
  {#if posts.length > 1}
    <div class="counter">{currentIndex + 1} / {posts.length}</div>
  {/if}
</div>

<style lang="scss">
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.15s ease;
    cursor: zoom-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .img-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;

    img {
      max-width: 100vw;
      max-height: 100vh;
      object-fit: contain;
      display: block;
      opacity: 0;
      transition: opacity 0.2s;
      cursor: default;
      animation: scaleIn 0.15s ease;

      &.visible {
        opacity: 1;
      }
    }

    .embed-frame {
      width: 100vw;
      height: 100vh;
      border: none;
      background: #000;
      cursor: default;
    }
  }

  @keyframes scaleIn {
    from { transform: scale(0.97); }
    to { transform: scale(1); }
  }

  .spinner {
    position: absolute;
    width: 2rem;
    height: 2rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Navigation arrows */
  .nav-btn {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s, background 0.15s;

    &.left { left: 0.75rem; }
    &.right { right: 0.75rem; }

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.22);
    }
  }

  /* Top-right close + external link */
  .top-actions {
    position: fixed;
    top: 0.6rem;
    right: 0.6rem;
    z-index: 10;
    display: flex;
    gap: 0.2rem;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.15s, background 0.15s;
    text-decoration: none;

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.2);
    }
  }

  /* Page counter */
  .counter {
    position: fixed;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    pointer-events: none;
    letter-spacing: 0.04em;
  }
</style>
