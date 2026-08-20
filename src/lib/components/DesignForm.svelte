<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { ROUNDNESS_MAX } from '$lib/qr';
  import Card from './ui/Card.svelte';
  import Label from './ui/Label.svelte';
  import Button from './ui/Button.svelte';

  interface Props {
    qrColor: string;
    qrBgColor: string;
    dotsRoundness: number;
    cornersSquareRoundness: number;
    cornersDotRoundness: number;
    logo: string;
  }

  let {
    qrColor = $bindable(),
    qrBgColor = $bindable(),
    dotsRoundness = $bindable(),
    cornersSquareRoundness = $bindable(),
    cornersDotRoundness = $bindable(),
    logo = $bindable(),
  }: Props = $props();

  let hexInput = $state('000000');
  let bgHexInput = $state('ffffff');
  let logoInput: HTMLInputElement | undefined = $state();

  $effect(() => {
    hexInput = qrColor.replace('#', '');
  });
  $effect(() => {
    bgHexInput = qrBgColor.replace('#', '');
  });

  function validateAndApplyHex(raw: string, apply: (color: string) => void) {
    let value = raw.trim();
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{3}$/.test(value)) {
      apply(value);
    }
  }

  function handleHexInputChange() {
    validateAndApplyHex(hexInput, (c) => (qrColor = c));
  }

  function handleBgHexInputChange() {
    validateAndApplyHex(bgHexInput, (c) => (qrBgColor = c));
  }

  function handleHexInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleHexInputChange();
  }

  function handleBgHexInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleBgHexInputChange();
  }

  function handleColorPickerChange(e: Event) {
    qrColor = (e.target as HTMLInputElement).value;
  }

  function handleBgColorPickerChange(e: Event) {
    qrBgColor = (e.target as HTMLInputElement).value;
  }

  function handleLogoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      logo = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    logo = '';
    if (logoInput) logoInput.value = '';
  }

  function roundnessFromEvent(e: Event) {
    return Number((e.target as HTMLInputElement).value);
  }
</script>

<Card>
  <header>
    <h2 class="flex items-center gap-2">
      <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
      </svg>
      {$_('design.heading')}
    </h2>
  </header>

  <div class="space-y-5">
    <!-- Colors -->
    <div class="grid grid-cols-2 gap-3">
      <div class="grid gap-2">
        <Label for="design-qr-color">{$_('qr.color_label')}</Label>
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-mono">#</span>
            <input
              id="design-qr-color"
              type="text"
              bind:value={hexInput}
              onblur={handleHexInputChange}
              onkeydown={handleHexInputKeydown}
              placeholder="000000"
              maxlength="7"
              class="w-full h-11 pl-7 pr-3 rounded-xl border border-input bg-card text-sm font-mono uppercase transition-all duration-150 placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <label
            class="w-11 h-11 rounded-full border border-input cursor-pointer shrink-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            title={$_('qr.color_label')}
            aria-label={$_('qr.color_label')}
            style="background-color: {qrColor}"
          >
            <input
              type="color"
              value={qrColor}
              onchange={handleColorPickerChange}
              class="sr-only"
            />
          </label>
        </div>
      </div>
      <div class="grid gap-2">
        <Label for="design-qr-bg-color">{$_('qr.bg_label')}</Label>
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-mono">#</span>
            <input
              id="design-qr-bg-color"
              type="text"
              bind:value={bgHexInput}
              onblur={handleBgHexInputChange}
              onkeydown={handleBgHexInputKeydown}
              placeholder="ffffff"
              maxlength="7"
              class="w-full h-11 pl-7 pr-3 rounded-xl border border-input bg-card text-sm font-mono uppercase transition-all duration-150 placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <label
            class="w-11 h-11 rounded-full border border-input cursor-pointer shrink-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            title={$_('qr.bg_label')}
            aria-label={$_('qr.bg_label')}
            style="background-color: {qrBgColor}"
          >
            <input
              type="color"
              value={qrBgColor}
              onchange={handleBgColorPickerChange}
              class="sr-only"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Roundness sliders -->
    <fieldset class="space-y-2">
      <Label for="dots-roundness">{$_('design.dots_label')}</Label>
      <div class="flex items-center gap-3 min-w-0">
        <span class="text-xs text-muted-foreground shrink-0 w-12">{$_('design.roundness_square')}</span>
        <input
          id="dots-roundness"
          type="range"
          min="0"
          max={ROUNDNESS_MAX}
          step="1"
          value={dotsRoundness}
          oninput={(e) => (dotsRoundness = roundnessFromEvent(e))}
          class="roundness-slider"
          aria-valuemin={0}
          aria-valuemax={ROUNDNESS_MAX}
          aria-valuenow={dotsRoundness}
          aria-label={$_('design.dots_label')}
        />
        <span class="text-xs text-muted-foreground shrink-0 w-12 text-right">{$_('design.roundness_round')}</span>
      </div>
    </fieldset>

    <div class="grid sm:grid-cols-2 gap-4">
      <fieldset class="space-y-2 min-w-0">
        <Label for="corners-square-roundness">{$_('design.eye_outer_label')}</Label>
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs text-muted-foreground shrink-0 w-12">{$_('design.roundness_square')}</span>
          <input
            id="corners-square-roundness"
            type="range"
            min="0"
            max={ROUNDNESS_MAX}
            step="1"
            value={cornersSquareRoundness}
            oninput={(e) => (cornersSquareRoundness = roundnessFromEvent(e))}
            class="roundness-slider"
            aria-valuemin={0}
            aria-valuemax={ROUNDNESS_MAX}
            aria-valuenow={cornersSquareRoundness}
            aria-label={$_('design.eye_outer_label')}
          />
          <span class="text-xs text-muted-foreground shrink-0 w-12 text-right">{$_('design.roundness_round')}</span>
        </div>
      </fieldset>

      <fieldset class="space-y-2 min-w-0">
        <Label for="corners-dot-roundness">{$_('design.eye_inner_label')}</Label>
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs text-muted-foreground shrink-0 w-12">{$_('design.roundness_square')}</span>
          <input
            id="corners-dot-roundness"
            type="range"
            min="0"
            max={ROUNDNESS_MAX}
            step="1"
            value={cornersDotRoundness}
            oninput={(e) => (cornersDotRoundness = roundnessFromEvent(e))}
            class="roundness-slider"
            aria-valuemin={0}
            aria-valuemax={ROUNDNESS_MAX}
            aria-valuenow={cornersDotRoundness}
            aria-label={$_('design.eye_inner_label')}
          />
          <span class="text-xs text-muted-foreground shrink-0 w-12 text-right">{$_('design.roundness_round')}</span>
        </div>
      </fieldset>
    </div>

    <!-- Logo -->
    <fieldset class="space-y-3">
      <Label for="logo-upload">{$_('design.logo_label')}</Label>

      {#if logo}
        <div class="flex items-center gap-3 p-3 rounded-xl border border-input bg-secondary/40">
          <img
            src={logo}
            alt=""
            class="w-12 h-12 rounded-lg object-contain bg-card border border-input"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{$_('design.logo_added')}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onclick={removeLogo} class="shrink-0">
            {$_('design.logo_remove')}
          </Button>
        </div>
      {:else}
        <label
          for="logo-upload"
          class="flex flex-col items-center justify-center gap-2 min-h-[5.5rem] px-4 py-4 rounded-xl border border-dashed border-input bg-secondary/30 text-sm text-muted-foreground cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
        >
          <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{$_('design.logo_upload')}</span>
        </label>
      {/if}

      <input
        id="logo-upload"
        bind:this={logoInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        class="sr-only"
        onchange={handleLogoChange}
      />
    </fieldset>
  </div>
</Card>

<style>
  .roundness-slider {
    -webkit-appearance: none;
    appearance: none;
    /* Firefox keeps a large intrinsic min-width on range inputs; without this
       they overflow flex/grid cells and overlap neighbouring sliders. */
    min-width: 0;
    width: 100%;
    flex: 1 1 0%;
    height: 0.375rem;
    border-radius: 9999px;
    background: hsl(var(--secondary));
    cursor: pointer;
  }

  .roundness-slider:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--accent) / 0.35);
  }

  .roundness-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 9999px;
    background: hsl(var(--accent));
    border: 2px solid hsl(var(--card));
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
    cursor: pointer;
  }

  .roundness-slider::-moz-range-thumb {
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 9999px;
    background: hsl(var(--accent));
    border: 2px solid hsl(var(--card));
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
    cursor: pointer;
  }

  .roundness-slider::-moz-range-track {
    width: 100%;
    height: 0.375rem;
    border-radius: 9999px;
    background: hsl(var(--secondary));
  }
</style>
