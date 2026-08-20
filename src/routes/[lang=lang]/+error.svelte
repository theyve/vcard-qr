<script lang="ts">
  import { page } from '$app/stores';
  import Seo from '$lib/components/Seo.svelte';
  import de from '$lib/i18n/de.json';
  import en from '$lib/i18n/en.json';
  import { seoFor, type SupportedLocale } from '$lib/site';

  let lang = $derived<SupportedLocale>($page.params.lang === 'en' ? 'en' : 'de');
  let seo = $derived(seoFor(lang, 'not-found'));
  let is404 = $derived($page.status === 404);
  let copy = $derived(lang === 'en' ? en.not_found : de.not_found);
</script>

<Seo {lang} page="not-found" title={seo.title} description={seo.description} robots="noindex, follow" />

<div class="space-y-4 py-6">
  <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
    {is404 ? copy.heading : $page.error?.message}
  </h1>
  {#if is404}
    <p class="text-muted-foreground leading-relaxed max-w-xl">{copy.text}</p>
  {/if}
  <a
    href="/{lang}/"
    class="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
  >
    {copy.back}
  </a>
</div>
