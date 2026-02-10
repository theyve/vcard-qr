<script lang="ts">
  import type { PhoneEntry, EmailEntry, SocialEntry } from '$lib/vcard';
  import type { ErrorCorrectionLevel } from '$lib/qr';
  import { buildVCard } from '$lib/vcard';
  import { generateQrSvg, generateQrPng, DOWNLOAD_SIZE } from '$lib/qr';
  import { downloadBlob, downloadDataUrl, safeFilename } from '$lib/download';
  import ContactForm from './components/ContactForm.svelte';
  import QrPreview from './components/QrPreview.svelte';

  const GITHUB_URL = 'https://github.com/theyve/vcard-qr';

  // Form state - Name fields
  let prefix = $state('');
  let firstName = $state('');
  let lastName = $state('');

  // Form state - Other fields
  let jobTitle = $state('');
  let company = $state('');
  let address = $state('');
  let website = $state('');
  let phones = $state<PhoneEntry[]>([{ number: '', type: 'CELL' }]);
  let emails = $state<EmailEntry[]>([{ address: '', type: 'WORK' }]);
  let socials = $state<SocialEntry[]>([]);

  // QR options
  let errorCorrection = $state<ErrorCorrectionLevel>('M');

  // QR generation state
  let svg = $state('');
  let loading = $state(false);

  // Derived values
  let vcard = $derived(
    buildVCard({
      prefix,
      firstName,
      lastName,
      jobTitle,
      company,
      address,
      phones,
      emails,
      website,
      socials,
    })
  );

  let hasContent = $derived(
    [prefix, firstName, lastName, jobTitle, company, address, website].some(
      (v) => v.trim().length > 0
    ) ||
      phones.some((p) => p.number.trim().length > 0) ||
      emails.some((e) => e.address.trim().length > 0) ||
      socials.some((s) => s.url.trim().length > 0)
  );

  let fullName = $derived(
    [prefix, firstName, lastName].filter(Boolean).join(' ')
  );

  let showLengthWarning = $derived(vcard.length > 900);

  // Generate QR code when vcard or error correction changes
  $effect(() => {
    const currentVcard = vcard;
    const currentEc = errorCorrection;

    if (!hasContent) {
      svg = '';
      return;
    }

    loading = true;
    let cancelled = false;

    generateQrSvg(currentVcard, { errorCorrectionLevel: currentEc })
      .then((result) => {
        if (!cancelled) svg = result;
      })
      .catch((err) => {
        if (!cancelled) {
          svg = '';
          console.error('QR generation failed:', err);
        }
      })
      .finally(() => {
        if (!cancelled) loading = false;
      });

    return () => {
      cancelled = true;
    };
  });

  async function handleDownloadPng() {
    try {
      const dataUrl = await generateQrPng(vcard, {
        errorCorrectionLevel: errorCorrection,
        width: DOWNLOAD_SIZE,
      });
      downloadDataUrl(`${safeFilename(fullName)}-qr.png`, dataUrl);
    } catch (err) {
      console.error('PNG generation failed:', err);
    }
  }

  function handleDownloadSvg() {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(`${safeFilename(fullName)}-qr.svg`, blob);
  }

  function handleDownloadVCard() {
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    downloadBlob(`${safeFilename(fullName)}.vcf`, blob);
  }
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="border-b bg-card">
    <div class="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-4xl font-bold tracking-tight">
            Open Source vCard QR Code Generator
          </h1>
          <p class="text-muted-foreground mt-1">
            Create contact QR codes that work on any phone — free, private, no tracking
          </p>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-accent transition-colors text-sm font-medium"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
          View on GitHub
        </a>
      </div>
    </div>
  </header>

  <!-- Features bar -->
  <div class="border-b bg-secondary/60">
    <div class="max-w-5xl mx-auto px-4 py-3">
      <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground justify-center md:justify-start">
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          100% Client-side
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          No data collection
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          No analytics
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Open source
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          vCard 3.0 format
        </span>
      </div>
    </div>
  </div>

  <!-- Main content -->
  <main class="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full mt-10">
    <div class="grid gap-4 md:grid-cols-2">
      <ContactForm
        bind:prefix
        bind:firstName
        bind:lastName
        bind:jobTitle
        bind:company
        bind:address
        bind:website
        bind:phones
        bind:emails
        bind:socials
      />

      <QrPreview
        {svg}
        {vcard}
        {hasContent}
        {loading}
        {showLengthWarning}
        {errorCorrection}
        onErrorCorrectionChange={(level) => (errorCorrection = level)}
        onDownloadPng={handleDownloadPng}
        onDownloadSvg={handleDownloadSvg}
        onDownloadVCard={handleDownloadVCard}
      />
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t bg-card mt-20">
    <div class="max-w-5xl mx-auto px-4 py-6">
      <div class="grid gap-6 md:grid-cols-2">
        <!-- About -->
        <div>
          <h2 class="font-semibold mb-2">About this tool</h2>
          <p class="text-sm text-muted-foreground">
            This open source vCard QR code generator creates scannable contact cards in vCard 3.0 format. Your contact information never leaves your browser.
            All processing happens locally, and the source code is fully auditable on GitHub.
          </p>
        </div>
        
        <!-- Privacy -->
        <div>
          <h2 class="font-semibold mb-2">Privacy guarantee</h2>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>• No server, no backend, no API calls</li>
            <li>• No cookies, localStorage, or session storage</li>
            <li>• No analytics, tracking pixels, or telemetry</li>
          </ul>
        </div>
      </div>
      
      <div class="mt-6 pt-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-muted-foreground">
        <p>
          Built with <a href="https://svelte.dev" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">Svelte</a>, 
          <a href="https://www.npmjs.com/package/qrcode" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">qrcode</a>,
          and AI coding tools.
          MIT licensed.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-foreground"
        >
          github.com/theyve/vcard-qr
        </a>
      </div>
    </div>
  </footer>
</div>
