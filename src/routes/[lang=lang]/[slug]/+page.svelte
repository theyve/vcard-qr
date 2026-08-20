<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Faq from '$lib/pages/Faq.svelte';
  import WhatIsVcard from '$lib/pages/WhatIsVcard.svelte';
  import {
    BASE_URL,
    faqPageJsonLd,
    pathFor,
    seoFor,
    webPageJsonLd,
    type PageId,
    type SupportedLocale,
  } from '$lib/site';

  let { data } = $props();
  let lang = $derived(data.lang as SupportedLocale);
  let page = $derived(data.page as PageId);
  let seo = $derived(seoFor(lang, page));
  let jsonLd = $derived.by(() => {
    if (page === 'faq') return [faqPageJsonLd(lang)];
    return [webPageJsonLd(lang, seo.title, `${BASE_URL}${pathFor(page, lang)}`, seo.description)];
  });
</script>

<Seo {lang} {page} title={seo.title} description={seo.description} jsonLd={jsonLd} />

{#if page === 'vcard'}
  <WhatIsVcard {lang} />
{:else}
  <Faq {lang} />
{/if}
