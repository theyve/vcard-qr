<script lang="ts">
  import {
    BASE_URL,
    OG_IMAGE_URL,
    OG_LOCALES,
    hreflangFor,
    pathFor,
    type PageId,
    type SupportedLocale,
  } from '$lib/site';

  interface Props {
    lang: SupportedLocale;
    page: PageId | 'not-found';
    title: string;
    description: string;
    robots?: string;
    jsonLd?: Record<string, unknown>[];
  }

  let { lang, page, title, description, robots = 'index, follow', jsonLd = [] }: Props = $props();

  let canonicalPath = $derived(page === 'not-found' ? '/404/' : pathFor(page, lang));
  let canonicalUrl = $derived(`${BASE_URL}${canonicalPath}`);
  let hreflang = $derived(page === 'not-found' ? null : hreflangFor(page));
  let json = $derived(jsonLd.map((block) => JSON.stringify(block).replaceAll('<', '\\u003c')));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content={robots} />
  <link rel="canonical" href={canonicalUrl} />
  {#if hreflang}
    <link rel="alternate" hreflang="de" href="{BASE_URL}{hreflang.de}" />
    <link rel="alternate" hreflang="en" href="{BASE_URL}{hreflang.en}" />
    <link rel="alternate" hreflang="x-default" href="{BASE_URL}{hreflang.xDefault}" />
  {/if}
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={OG_IMAGE_URL} />
  <meta property="og:locale" content={OG_LOCALES[lang]} />
  <meta property="og:locale:alternate" content={OG_LOCALES[lang === 'de' ? 'en' : 'de']} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={OG_IMAGE_URL} />
  {#each json as block, i (i)}
    {@html `<script type="application/ld+json">${block}</script>`}
  {/each}
</svelte:head>
