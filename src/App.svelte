<script lang="ts">
  import { _, locale, isLoading } from 'svelte-i18n';
  import type { PhoneEntry, EmailEntry, SocialEntry } from '$lib/vcard';
  import type { ErrorCorrectionLevel } from '$lib/qr';
  import { buildVCard } from '$lib/vcard';
  import { generateQrSvg, generateQrPng, DOWNLOAD_SIZE } from '$lib/qr';
  import { downloadBlob, downloadDataUrl, safeFilename } from '$lib/download';
  import {
    detectBrowserLocale,
    getLocaleFromPath,
    parseRoute,
    getAlternatePath,
    updateSeoForRoute,
    type SupportedLocale,
  } from '$lib/i18n';
  import ContactForm from './components/ContactForm.svelte';
  import QrPreview from './components/QrPreview.svelte';
  import WhatIsVcard from './pages/WhatIsVcard.svelte';
  import Faq from './pages/Faq.svelte';

  const GITHUB_URL = 'https://github.com/theyve/vcard-qr';

  // ---------------------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------------------
  let currentPath = $state(window.location.pathname);

  // On first load: if bare "/" redirect to language-prefixed path
  if (!getLocaleFromPath(currentPath)) {
    const detected = detectBrowserLocale();
    const target = `/${detected}/`;
    window.history.replaceState(null, '', target);
    currentPath = target;
  }

  // Derive lang + page from the current path
  let routeInfo = $derived(parseRoute(currentPath));
  let currentLang = $derived(routeInfo.lang);
  let currentPage = $derived(routeInfo.route?.page ?? 'home');

  // Keep svelte-i18n locale in sync with the URL
  $effect(() => {
    $locale = currentLang;
    updateSeoForRoute(currentLang, currentPath);
  });

  // Navigation helper
  function navigate(path: string, e?: MouseEvent) {
    if (e) e.preventDefault();
    window.history.pushState(null, '', path);
    currentPath = path;
    // Eagerly set locale for the new path
    const { lang } = parseRoute(path);
    $locale = lang;
    updateSeoForRoute(lang, path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Back/forward navigation
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      currentPath = window.location.pathname;
      const { lang } = parseRoute(window.location.pathname);
      $locale = lang;
      updateSeoForRoute(lang, window.location.pathname);
    });
  }

  // Compute the alternate-language path for the language switcher
  let alternateLang = $derived<SupportedLocale>(currentLang === 'de' ? 'en' : 'de');
  let alternatePath = $derived(getAlternatePath(currentPath, alternateLang));

  // ---------------------------------------------------------------------------
  // PWA Install prompt
  // ---------------------------------------------------------------------------
  let deferredPrompt = $state<any>(null);
  let isInstalled = $state(false);
  let showInstallToast = $state(false);
  let installToastMessage = $state('');

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true);

  if (isStandalone) {
    isInstalled = true;
  }

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
  const bookmarkShortcut = isMac ? '⌘D' : 'Ctrl+D';

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      isInstalled = true;
      deferredPrompt = null;
      showToast($_('install.installed_toast'));
    });
  }

  function showToast(message: string) {
    installToastMessage = message;
    showInstallToast = true;
    setTimeout(() => { showInstallToast = false; }, 3500);
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
      }
    } else {
      showToast($_('install.bookmark_toast', { values: { shortcut: bookmarkShortcut } }));
    }
  }

  let installLabel = $derived(
    deferredPrompt ? $_('install.install_app') : $_('install.bookmark')
  );

  let installTitle = $derived(
    deferredPrompt
      ? $_('install.install_title')
      : $_('install.bookmark_title', { values: { shortcut: bookmarkShortcut } })
  );

  // ---------------------------------------------------------------------------
  // Form state
  // ---------------------------------------------------------------------------
  let prefix = $state('');
  let firstName = $state('');
  let lastName = $state('');
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

  let vcard = $derived(
    buildVCard({ prefix, firstName, lastName, jobTitle, company, address, phones, emails, website, socials })
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
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
    </svg>
    {installToastMessage}
  </div>
{/if}

{#key $locale}
<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="border-b bg-card/80 backdrop-blur-sm top-0 z-10">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-5">
      <div class="flex items-center justify-between">
        <a href="/{currentLang}/" onclick={(e) => navigate(`/${currentLang}/`, e)} class="flex items-center gap-3 no-underline text-inherit">
          <div class="brand-qr" aria-hidden="true">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight">
              {$_('header.title')}
            </h1>
            <p class="text-sm text-muted-foreground hidden sm:block">
              {$_('header.subtitle')}
            </p>
          </div>
        </a>
        {#if !isInstalled}
          <button
            type="button"
            onclick={handleInstall}
            class="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-card hover:bg-secondary transition-all text-sm text-muted-foreground hover:text-foreground"
            title={installTitle}
          >
            {#if deferredPrompt}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            {:else}
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
          <strong class="font-semibold">{$_('privacy_banner.strong')}</strong> — {$_('privacy_banner.text')}
        </p>
        <button
          type="button"
          onclick={dismissPrivacy}
          class="shrink-0 p-1 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
          title={$_('privacy_banner.dismiss')}
          aria-label={$_('privacy_banner.dismiss')}
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
      {#if currentPage === 'home'}
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
      {:else if currentPage === 'vcard'}
        <WhatIsVcard {navigate} lang={currentLang} />
      {:else if currentPage === 'faq'}
        <Faq {navigate} lang={currentLang} />
      {:else}
        <!-- 404 fallback: redirect to home -->
        {(() => { navigate(`/${currentLang}/`); return ''; })()}
      {/if}
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t bg-card mt-auto">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {#if currentPage === 'home'}
        <!-- SEO content (only on home page) -->
        <div class="mb-8 pb-8 border-b space-y-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {$_('footer.seo_heading')}
            </h2>
            <p class="text-muted-foreground">
              {$_('footer.seo_text')}
            </p>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-1.5">{$_('footer.how_heading')}</h3>
            <p class="text-muted-foreground">
              {$_('footer.how_text_before')}<a href="https://en.wikipedia.org/wiki/VCard" target="_blank" rel="noopener noreferrer" class="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">{$_('footer.how_link_text')}</a>{$_('footer.how_text_after')}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            {#each ['offline', 'no_tracking', 'no_signup', 'open_source', 'cross_platform'] as featureKey}
              <span class="feature-badge">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                {$_(`features.${featureKey}`)}
              </span>
            {/each}
          </div>

          <!-- Links to static pages -->
          <div class="flex flex-wrap gap-4 text-sm">
            {#if currentLang === 'de'}
              <a href="/de/was-ist-vcard" onclick={(e) => navigate('/de/was-ist-vcard', e)} class="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">Was ist eine vCard?</a>
              <a href="/de/faq" onclick={(e) => navigate('/de/faq', e)} class="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">Häufige Fragen (FAQ)</a>
            {:else}
              <a href="/en/what-is-vcard" onclick={(e) => navigate('/en/what-is-vcard', e)} class="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">What is a vCard?</a>
              <a href="/en/faq" onclick={(e) => navigate('/en/faq', e)} class="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">FAQ</a>
            {/if}
          </div>
        </div>
      {/if}

      <div class="grid gap-8 sm:grid-cols-2">
        <!-- About -->
        <div>
          <h2 class="font-semibold mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {$_('footer.about_heading')}
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {$_('footer.about_text')}
          </p>
        </div>
        
        <!-- Privacy -->
        <div>
          <h2 class="font-semibold mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            {$_('footer.privacy_heading')}
          </h2>
          <ul class="text-sm text-muted-foreground space-y-1.5">
            <li class="flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-success"></span>
              {$_('footer.privacy_1')}
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-success"></span>
              {$_('footer.privacy_2')}
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-success"></span>
              {$_('footer.privacy_3')}
            </li>
          </ul>
        </div>
      </div>
      
      <div class="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
        <div class="flex flex-col gap-4">
          <p>
            {$_('footer.built_with_before')}<a href="https://svelte.dev" target="_blank" rel="noopener noreferrer" class="text-foreground hover:text-accent transition-colors underline underline-offset-2">Svelte</a>{$_('footer.built_with_mid')}<a href="https://www.npmjs.com/package/qrcode" target="_blank" rel="noopener noreferrer" class="text-foreground hover:text-accent transition-colors underline underline-offset-2">qrcode</a>{$_('footer.built_with_after')}
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
          {$_('footer.github_link')}
        </a>
      </div>
        <div class="flex items-center gap-4">
          <!-- Language switcher -->
          <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
            {#if currentLang === 'de'}
              <span class="font-semibold text-foreground">{$_('footer.lang_de')}</span>
              <span class="text-border">|</span>
              <a href={alternatePath} onclick={(e) => navigate(alternatePath, e)} class="hover:text-foreground transition-colors">{$_('footer.lang_en')}</a>
            {:else}
              <a href={alternatePath} onclick={(e) => navigate(alternatePath, e)} class="hover:text-foreground transition-colors">{$_('footer.lang_de')}</a>
              <span class="text-border">|</span>
              <span class="font-semibold text-foreground">{$_('footer.lang_en')}</span>
            {/if}
          </span>
        </div>
      </div>
    </div>
  </footer>
</div>
{/key}