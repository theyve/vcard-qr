<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { resolve } from '$app/paths';
  import Generator from '$lib/components/Generator.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { pathFor, seoFor, webApplicationJsonLd, type SupportedLocale } from '$lib/site';

  let { data } = $props();
  let lang = $derived(data.lang as SupportedLocale);
  let seo = $derived(seoFor(lang, 'home'));
  let vcardPath = $derived(pathFor('vcard', lang));
  let businessCardPath = $derived(pathFor('businessCard', lang));
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
      href={resolve(vcardPath as `/${string}/`)}
      class="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors"
    >{$_('home.about_vcard_link')}</a>{$_('home.about_p2_after')}
  </p>
  <section class="pt-2 space-y-3">
    <h2 class="text-xl font-semibold tracking-tight">{$_('home.contact_heading')}</h2>
    <p class="text-sm sm:text-base text-muted-foreground leading-relaxed">
      {$_('home.contact_text')}
    </p>
    <a href={resolve(businessCardPath as `/${string}/`)} class="inline-flex text-sm text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors">
      {$_('home.business_card_link')}
    </a>
  </section>
</section>
