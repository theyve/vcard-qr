<script lang="ts">
  import { browser } from '$app/environment';
  import { BASE_URL, localeFromAcceptLanguage } from '$lib/site';

  if (browser) {
    const lang = localeFromAcceptLanguage(navigator.languages?.join(',') || navigator.language);
    location.replace(`/${lang}/`);
  }
</script>

<svelte:head>
  <title>vcardqr.ch</title>
  <meta name="description" content="vCard QR-Code für die gedruckte Visitenkarte. / vCard QR code for a printed business card." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="{BASE_URL}/" />
  <link rel="alternate" hreflang="de" href="{BASE_URL}/de/" />
  <link rel="alternate" hreflang="en" href="{BASE_URL}/en/" />
  <link rel="alternate" hreflang="x-default" href="{BASE_URL}/" />
  <meta property="og:title" content="vcardqr.ch" />
  <meta property="og:description" content="vCard QR-Code für die gedruckte Visitenkarte." />
  <meta property="og:url" content="{BASE_URL}/" />
  <meta property="og:locale" content="de_CH" />
  <meta property="og:locale:alternate" content="en_US" />
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
  <p class="text-2xl font-bold tracking-tight mb-2">vcardqr.ch</p>
  <p class="text-muted-foreground mb-8 text-center">QR-Code für die gedruckte Visitenkarte</p>
  <nav class="flex gap-4">
    <a href="/de/" class="rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background">Deutsch</a>
    <a href="/en/" class="rounded-xl border border-input px-4 py-2.5 text-sm font-semibold">English</a>
  </nav>
</div>
