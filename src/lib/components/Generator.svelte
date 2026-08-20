<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PhoneEntry, EmailEntry, SocialEntry } from '$lib/vcard';
  import type { ErrorCorrectionLevel } from '$lib/qr';
  import { buildVCard } from '$lib/vcard';
  import { generateQrSvg, generateQrPng, DOWNLOAD_SIZE } from '$lib/qr';
  import { downloadBlob, downloadDataUrl, safeFilename } from '$lib/download';
  import ContactForm from './ContactForm.svelte';
  import QrPreview from './QrPreview.svelte';

  let prefix = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let jobTitle = $state('');
  let company = $state('');
  let address = $state('');
  let website = $state('');
  let phones = $state<PhoneEntry[]>([{ id: 'phone-0', number: '', type: 'CELL' }]);
  let emails = $state<EmailEntry[]>([{ id: 'email-0', address: '', type: 'WORK' }]);
  let socials = $state<SocialEntry[]>([]);

  let errorCorrection = $state<ErrorCorrectionLevel>('M');
  let qrColor = $state('#000000');
  let qrBgColor = $state('#ffffff');
  let svg = $state('');
  let loading = $state(false);
  let qrError = $state('');
  let downloadNotice = $state('');

  let vcard = $derived(
    buildVCard({ prefix, firstName, lastName, jobTitle, company, address, phones, emails, website, socials }),
  );

  let hasContent = $derived(
    [prefix, firstName, lastName, jobTitle, company, address, website].some((v) => v.trim().length > 0) ||
      phones.some((p) => p.number.trim().length > 0) ||
      emails.some((e) => e.address.trim().length > 0) ||
      socials.some((s) => s.url.trim().length > 0),
  );

  let downloadName = $derived(
    [prefix, firstName, lastName].filter(Boolean).join(' ') ||
      company.trim() ||
      phones.find((p) => p.number.trim())?.number ||
      emails.find((e) => e.address.trim())?.address ||
      'vcard',
  );

  let showLengthWarning = $derived(vcard.length > 900);

  $effect(() => {
    const currentVcard = vcard;
    const currentEc = errorCorrection;
    const currentColor = qrColor;
    const currentBgColor = qrBgColor;

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
</script>

{#if downloadNotice}
  <div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
    {downloadNotice}
  </div>
{/if}

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

  <div class="lg:sticky lg:top-20">
    <QrPreview
      {svg}
      {vcard}
      {hasContent}
      {loading}
      {showLengthWarning}
      {errorCorrection}
      {qrColor}
      {qrBgColor}
      error={qrError}
      onErrorCorrectionChange={(level) => (errorCorrection = level)}
      onColorChange={(color) => (qrColor = color)}
      onBgColorChange={(color) => (qrBgColor = color)}
      onDownloadPng={handleDownloadPng}
      onDownloadSvg={handleDownloadSvg}
      onDownloadVCard={handleDownloadVCard}
    />
  </div>
</div>
