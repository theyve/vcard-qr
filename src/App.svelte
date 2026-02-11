<script lang="ts">
  import type { PhoneEntry, EmailEntry, SocialEntry } from '$lib/vcard';
  import type { ErrorCorrectionLevel } from '$lib/qr';
  import { buildVCard } from '$lib/vcard';
  import { generateQrSvg, generateQrPng, DOWNLOAD_SIZE } from '$lib/qr';
  import { downloadBlob, downloadDataUrl, safeFilename } from '$lib/download';
  import ContactForm from './components/ContactForm.svelte';
  import QrPreview from './components/QrPreview.svelte';

  const GITHUB_URL = 'https://github.com/theyve/vcard-qr';

  // PWA Install prompt
  let deferredPrompt = $state<any>(null);
  let isInstalled = $state(false);
  let showInstallToast = $state(false);
  let installToastMessage = $state('');

  // Detect if already running as installed PWA
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true);

  if (isStandalone) {
    isInstalled = true;
  }

  // Detect iOS (no beforeinstallprompt support)
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  // Listen for beforeinstallprompt (Chrome, Edge, Samsung, etc.)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      isInstalled = true;
      deferredPrompt = null;
      showToast('App installed successfully!');
    });
  }

  function showToast(message: string) {
    installToastMessage = message;
    showInstallToast = true;
    setTimeout(() => { showInstallToast = false; }, 3500);
  }

  async function handleInstall() {
    if (deferredPrompt) {
      // Native install prompt available (Chromium browsers)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
      }
    } else if (isIOS) {
      // iOS: guide user to use Safari's "Add to Home Screen"
      showToast('Tap the Share button, then "Add to Home Screen"');
    } else {
      // Fallback for other browsers
      const isMac = /Mac/.test(navigator.userAgent);
      showToast(isMac ? 'Press ⌘D to bookmark this page' : 'Press Ctrl+D to bookmark this page');
    }
  }

  // Button label and icon depend on the install state
  let installLabel = $derived(
    isInstalled ? 'Installed' : deferredPrompt ? 'Install App' : isIOS ? 'Add to Home' : 'Bookmark'
  );

  let installTitle = $derived(
    isInstalled
      ? 'App is installed'
      : deferredPrompt
        ? 'Install as app on your device'
        : isIOS
          ? 'Add to your Home Screen'
          : 'Bookmark this page'
  );

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
  let qrColor = $state('#000000');
  let qrBgColor = $state('#ffffff');

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

  // Generate QR code when vcard, error correction, or color changes
  $effect(() => {
    const currentVcard = vcard;
    const currentEc = errorCorrection;
    const currentColor = qrColor;
    const currentBgColor = qrBgColor;

    if (!hasContent) {
      svg = '';
      return;
    }

    loading = true;
    let cancelled = false;

    generateQrSvg(currentVcard, { errorCorrectionLevel: currentEc, color: currentColor, bgColor: currentBgColor })
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
        color: qrColor,
        bgColor: qrBgColor,
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

  const features = [
    'Works offline',
    'No data collection',
    'No sign-up needed',
    'Open source',
    'iPhone & Android',
  ];

  // Privacy banner dismissal (persisted in localStorage)
  let privacyDismissed = $state(
    typeof localStorage !== 'undefined' && localStorage.getItem('privacy-dismissed') === '1'
  );

  function dismissPrivacy() {
    privacyDismissed = true;
    localStorage.setItem('privacy-dismissed', '1');
  }
</script>

{#if showInstallToast}
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-fade-in">
    {#if isIOS}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
      </svg>
    {:else}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
    {/if}
    {installToastMessage}
  </div>
{/if}

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="border-b bg-card/80 backdrop-blur-sm top-0 z-10">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="brand-qr" aria-hidden="true">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight">
              vCard QR Code Generator
            </h1>
            <p class="text-sm text-muted-foreground hidden sm:block">
              Create a QR code for your business card
            </p>
          </div>
        </div>
        {#if !isInstalled}
          <button
            type="button"
            onclick={handleInstall}
            class="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-card hover:bg-secondary transition-all text-sm text-muted-foreground hover:text-foreground"
            title={installTitle}
          >
            {#if deferredPrompt}
              <!-- Download / install icon -->
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            {:else if isIOS}
              <!-- Share icon (iOS-style) -->
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            {:else}
              <!-- Bookmark icon (fallback) -->
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            {/if}
            <span class="hidden sm:inline">{installLabel}</span>
          </button>
        {/if}
      </div>
    </div>
  </header>

  <!-- Privacy banner -->
  {#if !privacyDismissed}
    <div class="bg-emerald-50 border-b border-emerald-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-start sm:items-center gap-3">
        <div class="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 sm:mt-0">
          <svg class="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <p class="flex-1 text-sm text-emerald-800 leading-relaxed">
          <strong class="font-semibold">Totally private</strong> — your info never leaves your device. No servers, no tracking, no storage, nothing gets shared or sold.
        </p>
        <button
          type="button"
          onclick={dismissPrivacy}
          class="shrink-0 p-1 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
          title="Dismiss"
          aria-label="Dismiss privacy notice"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <!-- Main content -->
  <main class="flex-1 px-4 mb-10 sm:px-6 py-6 sm:py-8">
    <div class="max-w-5xl mx-auto">
      <div class="grid gap-6 lg:grid-cols-2 lg:items-start">
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

        <div class="lg:sticky lg:top-2">
          <QrPreview
            {svg}
            {vcard}
            {hasContent}
            {loading}
            {showLengthWarning}
            {errorCorrection}
            {qrColor}
            {qrBgColor}
            onErrorCorrectionChange={(level) => (errorCorrection = level)}
            onColorChange={(color) => (qrColor = color)}
            onBgColorChange={(color) => (qrBgColor = color)}
            onDownloadPng={handleDownloadPng}
            onDownloadSvg={handleDownloadSvg}
            onDownloadVCard={handleDownloadVCard}
          />
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t bg-card mt-auto">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <!-- SEO content -->
      <div class="mb-8 pb-8 border-b space-y-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Free QR Code Generator for Business Cards
          </h2>
          <p class="text-muted-foreground">
            Turn your contact details into a scannable QR code. Anyone who scans it can save your name, phone number, email, and more directly to their phone — no app needed. Perfect for business cards, email signatures, conference badges, and networking events.
          </p>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-1.5">How does it work?</h3>
          <p class="text-muted-foreground">
            This tool creates a <a href="https://en.wikipedia.org/wiki/VCard" target="_blank" rel="noopener noreferrer" class="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">vCard QR code</a> — an industry-standard format (vCard 3.0) that both iPhones and Android phones understand. When someone scans the QR code with their camera, it prompts them to save your contact information. No special app required.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          {#each features as feature}
            <span class="feature-badge">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              {feature}
            </span>
          {/each}
        </div>
      </div>

      <div class="grid gap-8 sm:grid-cols-2">
        <!-- About -->
        <div>
          <h2 class="font-semibold mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            About this tool
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            A free, open source QR code generator for business cards and contact info. Your data never leaves your browser — everything happens right on your device. No sign-up, no account needed.
          </p>
        </div>
        
        <!-- Privacy -->
        <div>
          <h2 class="font-semibold mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Privacy guarantee
          </h2>
          <ul class="text-sm text-muted-foreground space-y-1.5">
            <li class="flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-success"></span>
              Everything happens on your device — nothing is sent anywhere
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-success"></span>
              No account needed, nothing is saved or stored
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-success"></span>
              No tracking, no ads, no data collection of any kind
            </li>
          </ul>
        </div>
      </div>
      
      <div class="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Built with 
          <a href="https://svelte.dev" target="_blank" rel="noopener noreferrer" class="text-foreground hover:text-accent transition-colors underline underline-offset-2">Svelte</a>, 
          <a href="https://www.npmjs.com/package/qrcode" target="_blank" rel="noopener noreferrer" class="text-foreground hover:text-accent transition-colors underline underline-offset-2">qrcode</a>,
          and AI. MIT licensed.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-foreground hover:text-accent transition-colors font-medium"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
          View on GitHub →
        </a>
      </div>
    </div>
  </footer>
</div>
