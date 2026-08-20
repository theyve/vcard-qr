<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PhoneEntry, EmailEntry, UrlEntry } from '$lib/vcard';
  import type { ErrorCorrectionLevel } from '$lib/qr';
  import {
    DOT_ROUNDNESS,
    CORNER_SQUARE_ROUNDNESS,
    CORNER_DOT_ROUNDNESS,
  } from '$lib/qr';
  import { buildVCard } from '$lib/vcard';
  import { generateQrSvg, generateQrPng, DOWNLOAD_SIZE } from '$lib/qr';
  import { downloadBlob, downloadDataUrl, safeFilename } from '$lib/download';
  import ContactForm from './ContactForm.svelte';
  import DesignForm from './DesignForm.svelte';
  import QrPreview from './QrPreview.svelte';
  import Button from './ui/Button.svelte';

  let prefix = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let jobTitle = $state('');
  let company = $state('');
  let street = $state('');
  let city = $state('');
  let postalCode = $state('');
  let country = $state('');
  let phones = $state<PhoneEntry[]>([{ id: 'phone-0', number: '', type: 'CELL' }]);
  let emails = $state<EmailEntry[]>([{ id: 'email-0', address: '', type: 'WORK' }]);
  let websites = $state<UrlEntry[]>([{ id: 'url-0', url: '' }]);

  let errorCorrection = $state<ErrorCorrectionLevel>('M');
  let qrColor = $state('#000000');
  let qrBgColor = $state('#ffffff');
  let dotsRoundness = $state(0);
  let cornersSquareRoundness = $state(0);
  let cornersDotRoundness = $state(0);
  let logo = $state('');
  let svg = $state('');
  let loading = $state(false);
  let qrError = $state('');
  let downloadNotice = $state('');

  let dotsType = $derived(DOT_ROUNDNESS[dotsRoundness] ?? 'square');
  let cornersSquareType = $derived(CORNER_SQUARE_ROUNDNESS[cornersSquareRoundness] ?? 'square');
  let cornersDotType = $derived(CORNER_DOT_ROUNDNESS[cornersDotRoundness] ?? 'square');
  let hasLogo = $derived(logo.length > 0);

  let vcard = $derived(
    buildVCard({
      prefix,
      firstName,
      lastName,
      jobTitle,
      company,
      poBox: '',
      addressExtended: '',
      street,
      city,
      postalCode,
      country,
      phones,
      emails,
      websites,
    }),
  );

  let hasContent = $derived(
    [prefix, firstName, lastName, jobTitle, company, street, city, postalCode, country].some(
      (v) => v.trim().length > 0,
    ) ||
      phones.some((p) => p.number.trim().length > 0) ||
      emails.some((e) => e.address.trim().length > 0) ||
      websites.some((w) => w.url.trim().length > 0),
  );

  let downloadName = $derived(
    [prefix, firstName, lastName].filter(Boolean).join(' ') ||
      company.trim() ||
      phones.find((p) => p.number.trim())?.number ||
      emails.find((e) => e.address.trim())?.address ||
      'vcard',
  );

  let showLengthWarning = $derived(vcard.length > 900);

  // Logo overlays need high error correction to stay scannable.
  $effect(() => {
    if (hasLogo && errorCorrection !== 'H') {
      errorCorrection = 'H';
    }
  });

  $effect(() => {
    const currentVcard = vcard;
    const currentEc = errorCorrection;
    const currentColor = qrColor;
    const currentBgColor = qrBgColor;
    const currentDots = dotsType;
    const currentCornersSquare = cornersSquareType;
    const currentCornersDot = cornersDotType;
    const currentLogo = logo;

    if (!hasContent) {
      svg = '';
      qrError = '';
      return;
    }

    loading = true;
    let cancelled = false;

    generateQrSvg(currentVcard, {
      errorCorrectionLevel: currentEc,
      color: currentColor,
      bgColor: currentBgColor,
      dotsType: currentDots,
      cornersSquareType: currentCornersSquare,
      cornersDotType: currentCornersDot,
      logo: currentLogo || undefined,
    })
      .then((result) => {
        if (!cancelled) {
          svg = result;
          qrError = '';
        }
      })
      .catch((err) => {
        if (!cancelled) {
          svg = '';
          qrError = $_('qr.error_text');
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

  function flashNotice(message: string) {
    downloadNotice = message;
    setTimeout(() => {
      downloadNotice = '';
    }, 4000);
  }

  async function handleDownloadPng() {
    try {
      const dataUrl = await generateQrPng(vcard, {
        errorCorrectionLevel: errorCorrection,
        width: DOWNLOAD_SIZE,
        color: qrColor,
        bgColor: qrBgColor,
        dotsType,
        cornersSquareType,
        cornersDotType,
        logo: logo || undefined,
      });
      downloadDataUrl(`${safeFilename(downloadName)}-qr.png`, dataUrl);
    } catch (err) {
      console.error('PNG generation failed:', err);
      flashNotice($_('qr.download_error'));
    }
  }

  function handleDownloadSvg() {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(`${safeFilename(downloadName)}-qr.svg`, blob);
  }

  function handleDownloadVCard() {
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    downloadBlob(`${safeFilename(downloadName)}.vcf`, blob);
  }

  const isDev = import.meta.env.DEV;

  /** Local-only: fill every contact + design field for quick QR/vCard checks. */
  function fillDemoData() {
    prefix = 'Dr.';
    firstName = 'Max';
    lastName = 'Muster';
    jobTitle = 'Software Engineer';
    company = 'Muster AG';
    street = 'Bahnhofstrasse 10';
    city = 'Zürich';
    postalCode = '8001';
    country = 'Schweiz';
    phones = [
      { id: 'phone-demo-0', number: '+41 79 123 45 67', type: 'CELL' },
      { id: 'phone-demo-1', number: '+41 44 123 45 67', type: 'WORK' },
      { id: 'phone-demo-2', number: '+41 44 987 65 43', type: 'HOME' },
    ];
    emails = [
      { id: 'email-demo-0', address: 'max.muster@example.com', type: 'WORK' },
      { id: 'email-demo-1', address: 'max@privat.ch', type: 'HOME' },
    ];
    websites = [
      { id: 'url-demo-0', url: 'muster.ch' },
      { id: 'url-demo-1', url: 'https://linkedin.com/in/maxmuster' },
      { id: 'url-demo-2', url: 'https://github.com/maxmuster' },
    ];
    qrColor = '#0f766e';
    qrBgColor = '#f8fafc';
    dotsRoundness = 2;
    cornersSquareRoundness = 3;
    cornersDotRoundness = 3;
    errorCorrection = 'M';
    // Tiny teal mark so logo overlay + EC lock can be checked.
    logo =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0f766e"/><text x="32" y="42" text-anchor="middle" font-size="28" font-family="system-ui,sans-serif" fill="#fff">M</text></svg>',
      );
  }
</script>

{#if downloadNotice}
  <div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
    {downloadNotice}
  </div>
{/if}

{#if isDev}
  <div class="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2">
    <span class="text-xs font-medium uppercase tracking-wide text-amber-800">Dev</span>
    <Button type="button" variant="outline" size="sm" onclick={fillDemoData} class="h-8 text-xs">
      Demo-Daten füllen
    </Button>
  </div>
{/if}

<div class="grid gap-6 lg:grid-cols-2 lg:items-start">
  <div class="space-y-6">
    <ContactForm
      bind:prefix
      bind:firstName
      bind:lastName
      bind:jobTitle
      bind:company
      bind:street
      bind:city
      bind:postalCode
      bind:country
      bind:phones
      bind:emails
      bind:websites
    />

    <DesignForm
      bind:qrColor
      bind:qrBgColor
      bind:dotsRoundness
      bind:cornersSquareRoundness
      bind:cornersDotRoundness
      bind:logo
    />
  </div>

  <div class="lg:sticky lg:top-20">
    <QrPreview
      {svg}
      {vcard}
      {hasContent}
      {loading}
      {showLengthWarning}
      {errorCorrection}
      {qrBgColor}
      {hasLogo}
      error={qrError}
      onErrorCorrectionChange={(level) => (errorCorrection = level)}
      onDownloadPng={handleDownloadPng}
      onDownloadSvg={handleDownloadSvg}
      onDownloadVCard={handleDownloadVCard}
    />
  </div>
</div>
