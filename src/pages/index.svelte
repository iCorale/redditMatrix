<script context="module" lang="ts">
  let keptNames: string[] = []
  let keptValue = ''
  let keptExpanded = false
  let keptScroll = 0
</script>

<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import { goto } from '@roxi/routify'
  import { mode } from '@store/app'
  import { rememberSubreddit } from '@store/user'
  import { subredditFrom } from '@utils/subreddit'

  // icons
  import Search from '~icons/mdi/magnify'
  import Close from '~icons/mdi/close-circle'
  import ArrowRight from '~icons/mdi/arrow-right'

  // components
  import List from '@components/List.svelte'

  // props/stores
  const nsfwPreview = 24
  const nsfwListUrl = 'https://theporndude.com/best-nsfw-reddit-sites'
  let value = keptValue
  let input: HTMLInputElement
  let nsfwSubreddits: string[] = keptNames
  let nsfwFailed = false
  let nsfwExpanded = keptExpanded
  let appliedFilter = keptValue
  let alive = true
  let restoringScroll = true
  let leaving = false

  $: target = subredditFrom(value)
  $: filter = (target || value.trim().replace(/^\/?r\//i, '')).toLowerCase()
  $: visibleSubreddits = nsfwSubreddits.filter((name) => name.toLowerCase().includes(filter))
  $: if (filter !== appliedFilter) {
    appliedFilter = filter
    nsfwExpanded = false
  }
  $: shownSubreddits = nsfwExpanded
    ? visibleSubreddits
    : visibleSubreddits.slice(0, nsfwPreview)
  $: hiddenSubreddits = visibleSubreddits.length - shownSubreddits.length
  $: {
    keptValue = value
    keptExpanded = nsfwExpanded
  }

  //lifecycle hooks
  onMount(() => {
    $mode = 'idle'
    leaving = false
    document.body.dataset.routify = 'scroll-lock'
    document.body.addEventListener('keypress', handleKeyPress)
    document.addEventListener('click', holdScroll, true)
    if (!keptNames.length) loadNames()
    const y = keptScroll
    const restore = () => window.scrollTo(0, y)
    tick().then(restore)
    setTimeout(() =>
      setTimeout(() =>
        setTimeout(() => {
          restore()
          restoringScroll = false
        })
      )
    )
  })
  onDestroy(() => {
    alive = false
    delete document.body.dataset.routify
    document.body.removeEventListener('keypress', handleKeyPress)
    document.removeEventListener('click', holdScroll, true)
  })

  function rememberScroll() {
    if (restoringScroll || leaving) return
    keptScroll = window.scrollY
  }

  function holdScroll(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest('[data-open]')) return
    leaving = true
    keptScroll = window.scrollY
  }

  async function loadNames() {
    try {
      const res = await fetch(nsfwListUrl)
      if (!res.ok) throw new Error('nsfw list')
      const json = await res.json()
      if (!Array.isArray(json?.names)) throw new Error('nsfw list')
      const names = json.names.filter(
        (name: unknown) => typeof name === 'string' && /^[A-Za-z0-9_]+$/.test(name)
      )
      keptNames = names
      if (!alive) return
      nsfwSubreddits = names
      nsfwFailed = false
    } catch {
      if (alive && !nsfwSubreddits.length) nsfwFailed = true
    }
  }

  // methods
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === '/' && input !== document.activeElement) {
      e.preventDefault()
      input.focus()
    }
  }

  function openSubreddit(name: string) {
    leaving = true
    keptScroll = window.scrollY
    value = ''
    rememberSubreddit(name)
    $goto(`/r/${name.trim()}`)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && target) {
      e.preventDefault()
      input.blur()
      openSubreddit(target)
    } else if (e.key === 'Escape') {
      value = ''
      input.blur()
    }
  }
</script>

<svelte:window on:scroll={rememberScroll} />
<svelte:head><title>RMatrix</title></svelte:head>

<main>
  <section class="hero">
    <h1>想看点什么？</h1>
    <label class="search">
      <Search />
      <input
        bind:this={input}
        bind:value
        on:keydown={handleKeyDown}
        type="search"
        enterkeyhint="go"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="输入版块名，或粘贴 Reddit 链接"
        aria-label="版块名或链接"
      />
      {#if value}
        <button type="button" class="clear" aria-label="清除" on:click={() => ((value = ''), input.focus())}>
          <Close />
        </button>
      {:else}
        <kbd>/</kbd>
      {/if}
    </label>
    {#if value.trim()}
      {#if target}
        <button type="button" class="go" data-open on:click={() => openSubreddit(target)}>
          打开 <b>r/{target}</b>
          <ArrowRight />
        </button>
      {:else}
        <p class="hint">版块名只含字母、数字和下划线，2 到 21 位。</p>
      {/if}
    {/if}
  </section>

  <section id="list">
    <List {filter} on:open={(e) => openSubreddit(e.detail)} />
  </section>

  {#if nsfwSubreddits.length || nsfwFailed}
    <section id="nsfw">
      <div class="heading">
        <h2>发现</h2>
        <span class="count">{visibleSubreddits.length}</span>
      </div>
      {#if shownSubreddits.length}
        <div class="chips">
          {#each shownSubreddits as name (name)}
            <button type="button" class="chip" data-open on:click={() => openSubreddit(name)}>
              <span class="prefix">r/</span>{name}
            </button>
          {/each}
          {#if !nsfwExpanded && hiddenSubreddits > 0}
            <button type="button" class="chip more" on:click={() => (nsfwExpanded = true)}
              >展开全部 · {hiddenSubreddits}</button
            >
          {:else if nsfwExpanded && hiddenSubreddits === 0 && visibleSubreddits.length > nsfwPreview}
            <button type="button" class="chip more" on:click={() => (nsfwExpanded = false)}>收起</button>
          {/if}
        </div>
      {:else}
        <p class="empty">{nsfwFailed ? '列表没有读到，检查扩展或代理是否在运行。' : '没有匹配的版块'}</p>
      {/if}
    </section>
  {/if}
</main>

<style lang="scss">
  main {
    max-width: 64rem;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.25rem 0 4rem;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .hero {
    padding: 0.75rem 1rem 0;
    gap: 0.9rem;
  }
  h1 {
    margin: 0;
    font-size: clamp(1.75rem, 6vw, 2.5rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.1;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    height: 3.4rem;
    padding: 0 0.6rem 0 1.1rem;
    border-radius: var(--radius-l);
    background: var(--surface-2);
    color: var(--muted-color);
    font-size: 1.35rem;
    transition:
      box-shadow 0.2s,
      background 0.2s;
    &:focus-within {
      background: var(--surface-1);
      box-shadow:
        0 0 0 2px var(--accent-color),
        0 12px 40px -12px var(--accent-color);
    }
    input {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--foreground-color);
      font-size: 1.05rem;
      font-weight: 500;
      &::placeholder {
        color: var(--faint-color);
      }
      &::-webkit-search-cancel-button {
        -webkit-appearance: none;
      }
    }
    kbd {
      display: grid;
      place-items: center;
      min-width: 1.6rem;
      height: 1.6rem;
      margin-right: 0.35rem;
      border: 1px solid var(--line-color);
      border-radius: 6px;
      color: var(--faint-color);
      font-family: inherit;
      font-size: 0.8rem;
      font-weight: 600;
    }
  }
  @media (pointer: coarse) {
    .search kbd {
      display: none;
    }
  }
  .clear {
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--faint-color);
    font-size: 1.2rem;
    cursor: pointer;
    &:hover {
      color: var(--foreground-color);
    }
  }
  .go {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    border: 0;
    border-radius: 999px;
    padding: 0.65rem 1.1rem;
    background: var(--accent-gradient);
    color: var(--on-accent);
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 0 10px 28px -12px var(--accent-color);
    transition: transform 0.15s var(--ease-spring);
    &:active {
      transform: scale(0.96);
    }
    b {
      font-weight: 700;
    }
  }
  .hint {
    margin: 0;
    color: var(--faint-color);
    font-size: 0.88rem;
  }

  .heading {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin: 0 1rem;
  }
  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 750;
    letter-spacing: -0.01em;
  }
  .count {
    color: var(--faint-color);
    font-size: 0.9rem;
    font-weight: 600;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    padding: 0 1rem;
  }
  .chip {
    border: 0;
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
    background: var(--surface-2);
    color: var(--foreground-color);
    font-size: 0.88rem;
    font-weight: 550;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s,
      transform 0.15s var(--ease-spring);
    &:hover {
      background: var(--accent-soft);
      color: var(--accent-color);
    }
    &:active {
      transform: scale(0.95);
    }
  }
  .more {
    background: transparent;
    box-shadow: inset 0 0 0 1px var(--accent-color);
    color: var(--accent-color);
    font-weight: 650;
  }
  .prefix {
    color: var(--faint-color);
    font-weight: 700;
  }
  .chip:hover .prefix {
    color: inherit;
    opacity: 0.6;
  }
  .empty {
    margin: 0 1rem;
    color: var(--faint-color);
  }
</style>
