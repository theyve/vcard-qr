<script lang="ts">
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
    onErrorCorrectionChange: (level: ErrorCorrectionLevel) => void;
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
    onErrorCorrectionChange,
    onDownloadPng,
    onDownloadSvg,
    onDownloadVCard,
  }: Props = $props();

  function handleEcChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onErrorCorrectionChange(target.value as ErrorCorrectionLevel);
  }

  /**
   * Parse a vCard line for syntax highlighting.
   * Returns field name, value, and classification for styling.
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
  <header>
    <h2 class="flex items-center gap-2">
      <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
      </svg>
      QR Preview
    </h2>
    <p>Scan with any phone camera to add contact</p>
  </header>

  <!-- QR Code Display -->
  <div class="qr-container relative flex items-center justify-center rounded-2xl border-2 border-dashed min-h-[320px] overflow-hidden transition-all duration-300 {hasContent && !loading ? 'border-accent' : 'border-input'} {!hasContent ? 'qr-placeholder' : ''}"
  >
    {#if !hasContent}
      <!-- Empty state -->
      <div class="text-center px-6 py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
          <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
          </svg>
        </div>
        <p class="text-sm font-medium text-foreground mb-1">Your QR code will appear here</p>
        <p class="text-sm text-muted-foreground">Fill in at least one field to generate</p>
      </div>
    {:else if loading && !svg}
      <!-- Loading state -->
      <div class="text-center px-6 py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center animate-pulse-soft">
          <svg class="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-sm font-medium text-foreground">Generating QR code…</p>
      </div>
    {:else}
      <!-- QR code display -->
      <div class="qr-display p-6 bg-white rounded-xl shadow-sm transition-transform duration-200 hover:scale-[1.02]">
        <div class="[&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-[280px]">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG is from trusted qrcode library -->
          {@html svg}
        </div>
      </div>
    {/if}
    
    {#if loading && svg}
      <!-- Updating indicator (when regenerating) -->
      <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-accent/90 text-accent-foreground rounded-full text-xs font-medium">
        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Updating
      </div>
    {/if}
  </div>

  <!-- Controls -->
  <div class="space-y-4">
    <div class="grid gap-2">
      <Label for="ec">Error correction level</Label>
      <Select id="ec" value={errorCorrection} onchange={handleEcChange} class="w-full">
        <option value="L">L — Smallest QR, less redundancy</option>
        <option value="M">M — Balanced (recommended)</option>
        <option value="Q">Q — More robust</option>
        <option value="H">H — Most robust, largest QR</option>
      </Select>
    </div>

    {#if showLengthWarning}
      <div class="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
        <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-sm">
          <strong>Large vCard:</strong> The QR might be dense. Consider shortening fields or lowering error correction.
        </p>
      </div>
    {/if}

    <!-- Download buttons -->
    <div class="space-y-2">
      <Button variant="accent" onclick={onDownloadPng} disabled={!hasContent || loading} class="w-full font-semibold">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Download PNG
        <span class="text-xs opacity-70 font-normal">(1024×1024)</span>
      </Button>
      <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" onclick={onDownloadSvg} disabled={!hasContent || loading || !svg} class="w-full">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          SVG
        </Button>
        <Button variant="outline" onclick={onDownloadVCard} disabled={!hasContent} class="w-full">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          vCard
        </Button>
      </div>
    </div>
  </div>

  <!-- vCard Payload Display (collapsible) -->
  <details class="group">
    <summary class="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
      <span class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
        </svg>
        View vCard payload
      </span>
      <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </summary>
    <pre class="mt-3 text-xs font-mono rounded-xl border bg-secondary/50 p-4 overflow-auto whitespace-pre-wrap max-h-64">{#each vcardLines as line, i (i)}{@const parsed = parseVCardLine(line)}<span><span class={parsed.isStructural ? 'text-violet-600 font-semibold' : parsed.isProperty ? 'text-sky-600 font-medium' : ''}>{parsed.field}</span>{#if parsed.value || line.includes(':')}<span class="text-slate-400">:</span><span class="text-emerald-700">{parsed.value}</span>{/if}
</span>{/each}</pre>
  </details>
</Card>
