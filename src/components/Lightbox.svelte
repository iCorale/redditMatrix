<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte'
  const dispatch = createEventDispatcher()

  import Close from '~icons/mdi/close'
  import ChevronLeft from '~icons/mdi/chevron-left'
  import ChevronRight from '~icons/mdi/chevron-right'
  import OpenInNew from '~icons/mdi/open-in-new'
  import MagnifyPlus from '~icons/mdi/magnify-plus-outline'
  import MagnifyMinus from '~icons/mdi/magnify-minus-outline'

  import type { Post } from '@utils/api'

  export let posts: Post[] = []
  export let currentIndex: number = 0

  $: current   = posts[currentIndex]
  $: url       = current?.fullUrl ?? current?.url ?? ''
  $: title     = current?.title ?? ''
  $: embedUrl  = current?.embedUrl ?? null
  $: externalUrl = embedUrl ? embedUrl.replace('/ifr/', '/watch/') : url

  let imgLoaded = false
  $: if (currentIndex !== undefined) { imgLoaded = false; isZoomed = false }

  // ── Zoom (Reddit-style: natural resolution + scroll clamp) ────────────────
  let isZoomed = false
  let scrollContainer: HTMLDivElement
  let imgEl: HTMLImageElement

  async function zoomIn(e: MouseEvent) {
    const img = e.currentTarget as HTMLImageElement
    const rect = img.getBoundingClientRect()
    const fracX = (e.clientX - rect.left) / rect.width
    const fracY = (e.clientY - rect.top)  / rect.height

    isZoomed = true
    await tick()  // wait for CSS to switch to natural-size mode

    const nw = img.naturalWidth
    const nh = img.naturalHeight
    const cw = scrollContainer.clientWidth
    const ch = scrollContainer.clientHeight

    // If the image is smaller than the viewport in either dimension,
    // add margin to keep it centred in the scroll space.
    // (Using justify/align: flex-start so scroll coords start at 0.)
    const ml = Math.max(0, Math.floor((cw - nw) / 2))
    const mt = Math.max(0, Math.floor((ch - nh) / 2))
    img.style.marginLeft = ml ? `${ml}px` : ''
    img.style.marginTop  = mt ? `${mt}px` : ''

    // Target scroll: bring clicked point to viewport centre, offset by margin
    const wantX = ml + nw * fracX - cw / 2
    const wantY = mt + nh * fracY - ch / 2

    // Clamp: never expose non-image area beyond the image edges
    const maxX = Math.max(0, ml * 2 + nw - cw)
    const maxY = Math.max(0, mt * 2 + nh - ch)
    scrollContainer.scrollLeft = Math.max(0, Math.min(maxX, wantX))
    scrollContainer.scrollTop  = Math.max(0, Math.min(maxY, wantY))
  }

  function zoomOut() {
    isZoomed = false
    if (imgEl) { imgEl.style.marginLeft = ''; imgEl.style.marginTop = '' }
  }
  function close()   { dispatch('close') }
  function prev()    { if (currentIndex > 0) currentIndex-- }
  function next()    { if (currentIndex < posts.length - 1) currentIndex++ }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape')     { isZoomed ? zoomOut() : close() }
    if (!isZoomed) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="overlay" on:click|self={close}>

  <!-- Blurred background: same image, blurred + darkened.
       Uses <img> so referrerpolicy="no-referrer" applies (vs CSS background-image). -->
  {#if url && !embedUrl}
    <img
      class="blur-bg"
      src={url}
      alt=""
      referrerpolicy="no-referrer"
      aria-hidden="true"
    />
  {/if}

  <!-- Navigation arrows — hidden while zoomed -->
  {#if !isZoomed}
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
  {/if}

  <!-- Top-right controls -->
  <div class="top-actions">
    {#if !embedUrl}
      <button
        class="icon-btn"
        class:active={isZoomed}
        on:click={isZoomed ? zoomOut : undefined}
        style={isZoomed ? '' : 'pointer-events:none; opacity:0.3'}
        title={isZoomed ? '缩小' : '点击图片放大'}
      >
        {#if isZoomed}<MagnifyMinus />{:else}<MagnifyPlus />{/if}
      </button>
    {/if}
    <a href={externalUrl} target="_blank" rel="noopener noreferrer"
       class="icon-btn" title="在新标签页打开">
      <OpenInNew />
    </a>
    <button class="icon-btn" on:click={close} title="关闭">
      <Close />
    </button>
  </div>

  <!-- Content -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="img-wrap"
    class:zoomed={isZoomed}
    bind:this={scrollContainer}
    on:click|self={isZoomed ? zoomOut : close}
  >
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
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <img
        src={url}
        alt={title}
        referrerpolicy="no-referrer"
        class:visible={imgLoaded}
        class:fit={!isZoomed}
        bind:this={imgEl}
        on:load={() => (imgLoaded = true)}
        on:click|stopPropagation={(e) => isZoomed ? zoomOut() : zoomIn(e)}
      />
    {/if}
  </div>

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
    to   { opacity: 1; }
  }

  /* ── Blurred background (behind everything) ── */
  .blur-bg {
    position: absolute;
    inset: -40px;   // slightly oversized to hide blur-edge artifacts
    width: calc(100% + 80px);
    height: calc(100% + 80px);
    object-fit: cover;
    object-position: center;
    filter: blur(24px) brightness(0.32) saturate(1.4);
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  /* ── Scroll / content container ── */
  .img-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: zoom-out;

    // Zoomed: allow native scroll. Use flex-start so scroll coords begin at 0
    // (justify-content:center with overflow clips the start of the scroll range).
    // JS adds margin to the img to centre it when it's smaller than the viewport.
    &.zoomed {
      overflow: auto;
      align-items: flex-start;
      justify-content: flex-start;
      cursor: default;
    }

    /* ── Main image ── */
    img {
      display: block;
      opacity: 0;
      transition: opacity 0.2s;
      animation: scaleIn 0.15s ease;
      user-select: none;
      -webkit-user-drag: none;

      &.visible { opacity: 1; }

      // Normal: fit the viewport, zoom-in cursor
      &.fit {
        max-width: 100vw;
        max-height: 100vh;
        width: auto;
        height: auto;
        object-fit: contain;
        cursor: zoom-in;
        // Reset any inline margin set by zoomIn
        margin: 0 !important;
      }

      // Zoomed: natural resolution, scroll to pan
      &:not(.fit) {
        max-width: none;
        max-height: none;
        width: auto;
        height: auto;
        cursor: zoom-out;
      }
    }

    .embed-frame {
      width: 100vw;
      height: 100vh;
      border: none;
      background: #000;
      cursor: default;
      flex-shrink: 0;
    }
  }

  @keyframes scaleIn {
    from { transform: scale(0.97); }
    to   { transform: scale(1); }
  }

  /* ── Spinner ── */
  .spinner {
    position: absolute;
    width: 2rem;
    height: 2rem;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Navigation arrows ── */
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
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s, background 0.15s;

    &.left  { left:  0.75rem; }
    &.right { right: 0.75rem; }
    &:hover { opacity: 1; background: rgba(255,255,255,0.22); }
  }

  /* ── Top-right buttons ── */
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
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.15s, background 0.15s;
    text-decoration: none;

    &:hover { opacity: 1; background: rgba(255,255,255,0.2); }
    &.active { opacity: 1; background: rgba(255,255,255,0.2); color: #ebfa63; }
  }

  /* ── Page counter ── */
  .counter {
    position: fixed;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.5);
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    pointer-events: none;
    letter-spacing: 0.04em;
  }
</style>
