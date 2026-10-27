<script context="module" lang="ts">
  let keptNames: string[] = []
  let keptFilter = ''
  let keptExpanded = false
  let keptScroll = 0
</script>

<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import { goto } from '@roxi/routify'
  import { mode } from '@store/app'
  import { rememberSubreddit } from '@store/user'

  // icons
  import Search from '~icons/mdi/search'

  // components
  import List from '@components/List.svelte'
  import '@material/mwc-textfield'
  import '@material/mwc-fab'

  // props/stores
  const nsfwPreview = 24
  const nsfwListUrl = 'https://theporndude.com/best-nsfw-reddit-sites'
  let value: string = ''
  let input: any
  let filter = keptFilter
  let nsfwSubreddits: string[] = keptNames
  let nsfwFailed = false
  let nsfwExpanded = keptExpanded
  let appliedFilter = keptFilter
  let alive = true
  let restoringScroll = true
  let leaving = false

  $: visibleSubreddits = nsfwSubreddits.filter((name) =>
    name.toLowerCase().includes(filter.trim().toLowerCase())
  )
  $: if (filter !== appliedFilter) {
    appliedFilter = filter
    nsfwExpanded = false
  }
  $: shownSubreddits = nsfwExpanded
    ? visibleSubreddits
    : visibleSubreddits.slice(0, nsfwPreview)
  $: hiddenSubreddits = visibleSubreddits.length - shownSubreddits.length
  $: keptFilter = filter
  $: keptExpanded = nsfwExpanded

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
    const opening = target.closest(
      '#nsfw .chips button:not(.more), #list .chip > button:not(.remove)'
    )
    if (!opening) return
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
    switch (e.key) {
      case '/':
        if (input !== document.activeElement) {
          e.preventDefault()
          input.focus()
        }
        break
      default:
        break
    }
  }

  function openSubreddit(name: string) {
    leaving = true
    keptScroll = window.scrollY
    rememberSubreddit(name)
    $goto(`/r/${name.trim()}`)
  }

  function handleSearch() {
    if (value.trim()) openSubreddit(value)
  }
</script>

<svelte:window on:scroll={rememberScroll} />

<main>
  <!-- Search Bar -->
  <section id="search">
    <mwc-textfield
      bind:this={input}
      on:keyup={(e) => {
        value = e.target.value
        if (e.key === 'Enter') {
          handleSearch()
        }
      }}
      label="Subreddit"
    />
    <mwc-fab label="search" on:click={handleSearch}>
      <Search slot="icon" />
    </mwc-fab>
  </section>
  <section id="list">
    <List />
  </section>
  {#if nsfwSubreddits.length || nsfwFailed}
  <section id="nsfw">
    <div class="heading">
      <h2>NSFW</h2>
      <span class="count">{visibleSubreddits.length}</span>
      <span class="filter-wrap">
        <input
          class="filter"
          type="search"
          placeholder="Filter"
          aria-label="Filter"
          bind:value={filter}
        />
        {#if filter}
          <button type="button" class="clear" aria-label="Clear" on:click={() => (filter = '')}
            >×</button
          >
        {/if}
      </span>
    </div>
    {#if shownSubreddits.length}
      <div class="chips">
        {#each shownSubreddits as name (name)}
          <button type="button" on:click={() => openSubreddit(name)}>
            <span class="prefix">r/</span>{name}
          </button>
        {/each}
        {#if !nsfwExpanded && hiddenSubreddits > 0}
          <button type="button" class="more" on:click={() => (nsfwExpanded = true)}
            >+{hiddenSubreddits}</button
          >
        {:else if nsfwExpanded && hiddenSubreddits === 0 && visibleSubreddits.length > nsfwPreview}
          <button type="button" class="more" on:click={() => (nsfwExpanded = false)}
            >Less</button
          >
        {/if}
      </div>
    {:else}
      <p class="empty">{nsfwFailed ? "Couldn't load" : 'No matches'}</p>
    {/if}
  </section>
  {/if}
</main>

<style lang="scss">
  main {
    max-width: 60rem;
    margin: 0 auto;
    min-height: 100vh;
    display: grid;
    padding: 1rem 0;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: minmax(min-content, max-content);
    #search {
      padding: 0 1rem;
      gap: 1rem;
      display: flex;
      grid-column: 1/-1;
    }
    #list,
    #nsfw {
      grid-column: 1/-1;
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }
  }
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
  .filter-wrap {
    position: relative;
    margin-left: auto;
    width: 8.5rem;
    flex: none;
  }
  .filter {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    background: transparent;
    color: inherit;
    border: 1px solid rgba(128, 128, 128, 0.55);
    border-radius: 999px;
    font: inherit;
    font-size: 0.9rem;
    padding: 0.25rem 1.7rem 0.25rem 0.7rem;
    outline: none;
    &::placeholder {
      color: inherit;
      opacity: 0.55;
    }
    &:focus {
      border-color: var(--accent-color);
    }
    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
    }
  }
  .clear {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 1.6rem;
    border: 0;
    border-radius: 999px;
    padding: 0;
    line-height: 1;
    color: inherit;
    opacity: 0.65;
    &:hover {
      opacity: 1;
      background: transparent;
      border-color: transparent;
    }
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0 1rem;
  }
  button {
    background: transparent;
    color: inherit;
    border: 1px solid rgba(128, 128, 128, 0.55);
    border-radius: 999px;
    font: inherit;
    font-size: 0.9rem;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    &:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }
  }
  .more {
    color: var(--accent-color);
    border-color: var(--accent-color);
    &:hover {
      background: color-mix(in srgb, var(--accent-color) 14%, transparent);
    }
  }
  .prefix {
    opacity: 0.5;
    font-weight: bold;
  }
  .empty {
    margin: 0 1rem;
    opacity: 0.5;
  }
  mwc-textfield {
    flex-grow: 1;
  }
</style>
