<script lang="ts">
  import type { PhoneEntry, SocialEntry } from '$lib/vcard';
  import type { ErrorCorrectionLevel } from '$lib/qr';
  import { buildVCard } from '$lib/vcard';
  import { generateQrSvg, generateQrPng, DOWNLOAD_SIZE } from '$lib/qr';
  import { downloadBlob, downloadDataUrl, safeFilename } from '$lib/download';
  import ContactForm from './components/ContactForm.svelte';
  import QrPreview from './components/QrPreview.svelte';

  // Form state
  let firstName = $state('');
  let lastName = $state('');
  let jobTitle = $state('');
  let company = $state('');
  let address = $state('');
  let email = $state('');
  let website = $state('');
  let phones = $state<PhoneEntry[]>([{ number: '', type: 'CELL' }]);
  let socials = $state<SocialEntry[]>([]);

  // QR options
  let errorCorrection = $state<ErrorCorrectionLevel>('M');

  // QR generation state
  let svg = $state('');
  let loading = $state(false);

  // Derived values
  let vcard = $derived(
    buildVCard({
      firstName,
      lastName,
      jobTitle,
      company,
      address,
      phones,
      email,
      website,
      socials,
    })
  );

  let hasContent = $derived(
    [firstName, lastName, jobTitle, company, address, email, website].some(
      (v) => v.trim().length > 0
    ) ||
      phones.some((p) => p.number.trim().length > 0) ||
      socials.some((s) => s.url.trim().length > 0)
  );

  let fullName = $derived([firstName, lastName].filter(Boolean).join(' '));

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

<main class="p-4 md:p-8 max-w-5xl mx-auto">
  <div class="grid gap-4 md:grid-cols-2">
    <ContactForm
      bind:firstName
      bind:lastName
      bind:jobTitle
      bind:company
      bind:address
      bind:email
      bind:website
      bind:phones
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
