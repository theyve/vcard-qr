<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { SupportedLocale } from '$lib/i18n';
  import Card from '$lib/components/ui/Card.svelte';
  import { pathFor } from '$lib/site';

  interface Props {
    lang: SupportedLocale;
  }

  let { lang }: Props = $props();
  let homePath = $derived(pathFor('home', lang));
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <a href={homePath} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    {$_('vcard_page.back_link')}
  </a>

  <Card>
    <article class="prose-content space-y-6">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">{$_('vcard_page.heading')}</h1>
      <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.intro')}</p>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('vcard_page.why_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.why_text')}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('vcard_page.spread_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.spread_text')}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('vcard_page.fields_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.fields_text')}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('vcard_page.qr_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.qr_text')}</p>
      </section>

    </article>
  </Card>
</div>
