<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { ErrorCorrectionLevel } from '$lib/qr';
  import Card from './ui/Card.svelte';
  import Label from './ui/Label.svelte';
  import Select from './ui/Select.svelte';
  import Button from './ui/Button.svelte';

  interface Props {
    svg: string;
    vcard: string;
    hasContent: boolean;
    loading: boolean;
    showLengthWarning: boolean;
    errorCorrection: ErrorCorrectionLevel;
    qrColor: string;
    qrBgColor: string;
    onErrorCorrectionChange: (level: ErrorCorrectionLevel) => void;
    onColorChange: (color: string) => void;
    onBgColorChange: (color: string) => void;
    onDownloadPng: () => void;
    onDownloadSvg: () => void;
    onDownloadVCard: () => void;
  }

  let {
    svg,
    vcard,
    hasContent,
    loading,
    showLengthWarning,
    errorCorrection,
    qrColor,
    qrBgColor,
    onErrorCorrectionChange,
    onColorChange,
    onBgColorChange,
    onDownloadPng,
    onDownloadSvg,
    onDownloadVCard,
  }: Props = $props();

  // Local hex input state (without # prefix for display)
  let hexInput = $state(qrColor.replace('#', ''));
  let bgHexInput = $state(qrBgColor.replace('#', ''));
  
  // Sync hex inputs when colors change externally
  $effect(() => {
    hexInput = qrColor.replace('#', '');
  });
  $effect(() => {
    bgHexInput = qrBgColor.replace('#', '');
  });

  function handleEcChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onErrorCorrectionChange(target.value as ErrorCorrectionLevel);
  }

  function handleColorPickerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onColorChange(target.value);
  }

  function handleBgColorPickerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onBgColorChange(target.value);
  }

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
    validateAndApplyHex(hexInput, onColorChange);
  }

  function handleBgHexInputChange() {
    validateAndApplyHex(bgHexInput, onBgColorChange);
  }

  function handleHexInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleHexInputChange();
    }
  }

  function handleBgHexInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleBgHexInputChange();
    }
  }

  /**
   * Parse a vCard line for syntax highlighting.
   */
  function parseVCardLine(line: string) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      return { field: line, value: '', isStructural: false, isProperty: false };
    }
    const field = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);
    return {
      field,
      value,
      isStructural: /^(BEGIN|END|VERSION)$/i.test(field),
      isProperty: /^(FN|N|TITLE|ORG|TEL|EMAIL|ADR|URL|NOTE|X-SOCIALPROFILE)/i.test(field),
    };
  }

  let vcardLines = $derived(vcard.split(/\r?\n/));
</script>

<Card>

  <!-- QR Code Display -->
  <div class="qr-container relative rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-300 {hasContent && !loading ? 'border-accent' : 'border-input'} {!hasContent ? 'qr-placeholder' : ''}"
  >
    {#if !hasContent}
      <!-- Empty state -->
      <div class="flex flex-col items-center justify-center min-h-[320px] text-center px-6 py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
          <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
          </svg>
        </div>
        <p class="text-sm font-medium text-foreground mb-1">{$_('qr.empty_title')}</p>
        <p class="text-sm text-muted-foreground">{$_('qr.empty_subtitle')}</p>
      </div>
    {:else if loading && !svg}
      <!-- Loading state -->
      <div class="flex items-center justify-center min-h-[320px] text-center px-6 py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center animate-pulse-soft">
          <svg class="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-sm font-medium text-foreground">{$_('qr.loading')}</p>
      </div>
    {:else}
      <!-- QR code display -->
      <div class="[&>svg]:w-full [&>svg]:h-auto [&>svg]:block" style="background-color: {qrBgColor}">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG is from trusted qrcode library -->
        {@html svg}
      </div>
    {/if}
    
    {#if loading && svg}
      <!-- Updating indicator -->
      <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-accent/90 text-accent-foreground rounded-full text-xs font-medium">
        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        {$_('qr.updating')}
      </div>
    {/if}
  </div>

  <!-- Controls -->
  <div class="space-y-4">
    <!-- Color pickers -->
    <div class="grid grid-cols-2 gap-3">
      <div class="grid gap-2">
        <Label for="qr-color">{$_('qr.color_label')}</Label>
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-mono">#</span>
            <input
              id="qr-color"
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
        <Label for="qr-bg-color">{$_('qr.bg_label')}</Label>
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-mono">#</span>
            <input
              id="qr-bg-color"
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

    <!-- Collapsible sections -->
    <div class="space-y-1">
      <details class="group">
        <summary class="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
            {$_('qr.advanced')}
          </span>
          <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </summary>
        <div class="mt-2 grid gap-2">
          <Label for="ec">{$_('qr.ec_label')}</Label>
          <Select id="ec" value={errorCorrection} onchange={handleEcChange} class="w-full" aria-label={$_('qr.ec_label')}>
            <option value="L">{$_('qr.ec_L')}</option>
            <option value="M">{$_('qr.ec_M')}</option>
            <option value="Q">{$_('qr.ec_Q')}</option>
            <option value="H">{$_('qr.ec_H')}</option>
          </Select>
        </div>
      </details>

      <details class="group">
        <summary class="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            {$_('qr.view_payload')}
          </span>
          <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </summary>
        <pre class="mt-2 text-xs font-mono rounded-xl border bg-secondary/50 p-4 overflow-auto whitespace-pre-wrap max-h-64">{#each vcardLines as line, i (i)}{@const parsed = parseVCardLine(line)}<span><span class={parsed.isStructural ? 'text-violet-600 font-semibold' : parsed.isProperty ? 'text-sky-600 font-medium' : ''}>{parsed.field}</span>{#if parsed.value || line.includes(':')}<span class="text-slate-400">:</span><span class="text-emerald-700">{parsed.value}</span>{/if}
</span>{/each}</pre>
      </details>
    </div>

    {#if showLengthWarning}
      <div class="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
        <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-sm">
          <strong>{$_('qr.length_warning_title')}</strong> {$_('qr.length_warning_text')}
        </p>
      </div>
    {/if}

    <!-- Download buttons -->
    <div class="space-y-2">
      <Button variant="accent" onclick={onDownloadPng} disabled={!hasContent || loading} class="w-full font-semibold">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        {$_('qr.download_png')}
        <span class="text-xs opacity-70 font-normal">{$_('qr.download_png_size')}</span>
      </Button>
      <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" onclick={onDownloadSvg} disabled={!hasContent || loading || !svg} class="w-full">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          {$_('qr.download_svg')}
          <span class="text-xs opacity-70 font-normal">{$_('qr.download_svg_hint')}</span>
        </Button>
        <Button variant="outline" onclick={onDownloadVCard} disabled={!hasContent} class="w-full">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          {$_('qr.download_vcard')}
          <span class="text-xs opacity-70 font-normal">{$_('qr.download_vcard_hint')}</span>
        </Button>
      </div>
    </div>
  </div>

</Card>
