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
    <h2 class="text-xl font-semibold">Preview</h2>
    <p class="text-sm text-muted-foreground">
      Scanning should open "Add contact" on most phones.
    </p>
  </header>

  <!-- QR Code Display -->
  <div class="flex items-center justify-center rounded-2xl border p-4 min-h-[380px]">
    {#if !hasContent}
      <p class="text-sm text-muted-foreground">Fill at least one field to generate a QR.</p>
    {:else if loading && !svg}
      <p class="text-sm text-muted-foreground">Generating…</p>
    {:else}
      <div class="max-w-full max-h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG is from trusted qrcode library -->
        {@html svg}
      </div>
    {/if}
  </div>

  <!-- Controls -->
  <div class="grid gap-3">
    <div class="grid gap-1">
      <Label for="ec">Error correction</Label>
      <Select id="ec" value={errorCorrection} onchange={handleEcChange} class="px-3">
        <option value="L">L (smallest QR)</option>
        <option value="M">M (balanced)</option>
        <option value="Q">Q (robust)</option>
        <option value="H">H (most robust)</option>
      </Select>
    </div>

    {#if showLengthWarning}
      <p class="text-sm rounded-xl border p-3">
        Your vCard is long. The QR might be dense and harder to scan. Consider shortening fields or lowering error correction.
      </p>
    {/if}

    <div class="grid gap-2">
      <Button onclick={onDownloadPng} disabled={!hasContent || loading} class="w-full">
        Download PNG <span class="text-xs ml-1 opacity-70">(1024×1024)</span>
      </Button>
      <Button variant="secondary" onclick={onDownloadSvg} disabled={!hasContent || loading || !svg} class="w-full">
        Download SVG
      </Button>
      <Button variant="outline" onclick={onDownloadVCard} disabled={!hasContent} class="w-full">
        Download vCard
      </Button>
    </div>
  </div>

  <!-- vCard Payload Display -->
  <section class="space-y-2">
    <h3 class="text-sm font-medium">vCard payload</h3>
    <pre class="text-xs rounded-xl border p-3 overflow-auto whitespace-pre-wrap">{#each vcardLines as line, i (i)}{@const parsed = parseVCardLine(line)}<span><span class={parsed.isStructural ? 'text-violet-600 font-semibold' : parsed.isProperty ? 'text-sky-600 font-medium' : ''}>{parsed.field}</span>{#if parsed.value || line.includes(':')}<span class="text-slate-400">:</span><span class="text-emerald-700">{parsed.value}</span>{/if}
</span>{/each}</pre>
  </section>
</Card>
