<script lang="ts">
  import Check from '~icons/mdi/check'
  import { theme, ACCENTS, type Accent, type Scheme } from '@store/user'

  const schemes: { value: Scheme; label: string }[] = [
    { value: 'system', label: '跟随系统' },
    { value: 'dark', label: '深色' },
    { value: 'light', label: '浅色' }
  ]

  const accentNames: Record<Accent, string> = {
    rose: '玫瑰',
    violet: '紫罗兰',
    sky: '天空',
    lime: '荧光',
    amber: '琥珀'
  }

  function setScheme(scheme: Scheme) {
    $theme = { ...$theme, scheme }
  }

  function setAccent(accent: Accent) {
    $theme = { ...$theme, accent, customAccent: '' }
  }

  function setCustom(e: Event) {
    $theme = { ...$theme, customAccent: (e.currentTarget as HTMLInputElement).value }
  }

  function reset() {
    $theme = { scheme: 'system', accent: 'rose', customAccent: '' }
  }

  $: isDefault = $theme.scheme === 'system' && $theme.accent === 'rose' && !$theme.customAccent
</script>

<svelte:head><title>外观 · RMatrix</title></svelte:head>

<main>
  <section>
    <h2>配色模式</h2>
    <div class="segmented" role="radiogroup">
      {#each schemes as option (option.value)}
        <button
          type="button"
          role="radio"
          aria-checked={$theme.scheme === option.value}
          class:active={$theme.scheme === option.value}
          on:click={() => setScheme(option.value)}>{option.label}</button
        >
      {/each}
    </div>
  </section>

  <section>
    <h2>强调色</h2>
    <p class="hint">只用在当前排序、主要按钮、选中和加载上。</p>
    <div class="swatches">
      {#each ACCENTS as accent (accent)}
        <button
          type="button"
          class="swatch"
          data-accent={accent}
          class:active={!$theme.customAccent && $theme.accent === accent}
          on:click={() => setAccent(accent)}
        >
          <span class="dot">
            {#if !$theme.customAccent && $theme.accent === accent}<Check />{/if}
          </span>
          {accentNames[accent]}
        </button>
      {/each}
      <label class="swatch" class:active={!!$theme.customAccent}>
        <span
          class="dot"
          class:rainbow={!$theme.customAccent}
          style={$theme.customAccent ? `background:${$theme.customAccent}` : undefined}
        >
          {#if $theme.customAccent}<Check />{/if}
          <input type="color" value={$theme.customAccent || '#ff4d8d'} on:input={setCustom} />
        </span>
        自定义
      </label>
    </div>
  </section>

  <section class="preview">
    <h2>预览</h2>
    <div class="sample">
      <span class="pill on">热门</span>
      <span class="pill">最新</span>
      <span class="pill">排行</span>
      <span class="spinner rm-spinner" />
    </div>
  </section>

  {#if !isDefault}
    <button type="button" class="reset" on:click={reset}>恢复默认</button>
  {/if}
</main>

<style lang="scss">
  main {
    max-width: 36rem;
    margin: 0 auto;
    padding: 1.25rem 1rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }
  h2 {
    margin: 0 0 0.75rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--muted-color);
  }
  .hint {
    margin: -0.4rem 0 0.9rem;
    font-size: 0.85rem;
    color: var(--faint-color);
  }
  .segmented {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0.25rem;
    border-radius: 999px;
    background: var(--surface-2);
    button {
      height: 2.5rem;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--muted-color);
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      &.active {
        background: var(--background-color);
        color: var(--foreground-color);
        box-shadow: 0 2px 10px rgb(var(--shadow-color) / 0.25);
      }
    }
  }
  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
    gap: 0.6rem;
  }
  .swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 0.25rem 0.7rem;
    border: 1px solid var(--line-color);
    border-radius: var(--radius-m);
    background: var(--surface-1);
    color: var(--muted-color);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    &.active {
      border-color: var(--foreground-color);
      color: var(--foreground-color);
    }
  }
  .dot {
    position: relative;
    display: grid;
    place-items: center;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    background: var(--accent-gradient);
    color: #fff;
    font-size: 1.2rem;
    overflow: hidden;
    &.rainbow {
      background: conic-gradient(#ff4d8d, #fbbf24, #d4ff3a, #38bdf8, #a78bfa, #ff4d8d);
    }
    input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
  }
  /* Show each preset in its own colours, whatever is active. */
  .swatch[data-accent] .dot {
    background: linear-gradient(120deg, var(--swatch-a), var(--swatch-b));
  }
  .swatch[data-accent='rose'] { --swatch-a: #ff4d8d; --swatch-b: #ff9a62; }
  .swatch[data-accent='violet'] { --swatch-a: #a78bfa; --swatch-b: #f472b6; }
  .swatch[data-accent='sky'] { --swatch-a: #38bdf8; --swatch-b: #818cf8; }
  .swatch[data-accent='lime'] { --swatch-a: #d4ff3a; --swatch-b: #5eead4; }
  .swatch[data-accent='amber'] { --swatch-a: #fbbf24; --swatch-b: #fb7185; }
  .swatch[data-accent='lime'] .dot { color: #111; }

  .sample {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 1rem;
    border-radius: var(--radius-m);
    background: var(--surface-1);
  }
  .pill {
    height: 2.1rem;
    display: inline-flex;
    align-items: center;
    padding: 0 0.95rem;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--muted-color);
    font-size: 0.88rem;
    font-weight: 600;
    &.on {
      background: var(--accent-gradient);
      color: var(--on-accent);
    }
  }
  .spinner {
    margin-left: auto;
  }
  .reset {
    align-self: center;
    border: 0;
    border-radius: 999px;
    padding: 0.65rem 1.3rem;
    background: var(--surface-2);
    color: var(--foreground-color);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
  }
</style>
