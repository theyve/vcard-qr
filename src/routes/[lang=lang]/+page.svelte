<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Generator from '$lib/components/Generator.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { pathFor, seoFor, webApplicationJsonLd, type SupportedLocale } from '$lib/site';

  let { data } = $props();
  let lang = $derived(data.lang as SupportedLocale);
  let seo = $derived(seoFor(lang, 'home'));
  let vcardPath = $derived(pathFor('vcard', lang));
</script>

<Seo
  {lang}
  page="home"
  title={seo.title}
  description={seo.description}
  jsonLd={[webApplicationJsonLd(lang, seo.description)]}
/>

<Generator />

<section class="mt-10 max-w-3xl space-y-4">
  <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
    {$_('home.about_heading')}
  </h1>
  <p class="text-sm sm:text-base text-muted-foreground leading-relaxed">
    {$_('home.about_p1')}
  </p>
  <p class="text-sm sm:text-base text-muted-foreground leading-relaxed">
    {$_('home.about_p2_before')}<a
      href={vcardPath}
      class="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors"
    >{$_('home.about_vcard_link')}</a>{$_('home.about_p2_after')}
  </p>
</section>
