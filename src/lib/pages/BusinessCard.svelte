<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { resolve } from '$app/paths';
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
  <a href={resolve(homePath as `/${string}/`)} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    {$_('business_card_page.back_link')}
  </a>

  <Card>
    <article class="prose-content space-y-6">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">{$_('business_card_page.heading')}</h1>
      <p class="text-muted-foreground leading-relaxed">{$_('business_card_page.intro_p1')}</p>
      <p class="text-muted-foreground leading-relaxed">{$_('business_card_page.intro_p2')}</p>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('business_card_page.vcard_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('business_card_page.vcard_text')}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('business_card_page.fields_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('business_card_page.fields_intro')}</p>
        <ul class="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
          <li>{$_('business_card_page.field_name')}</li>
          <li>{$_('business_card_page.field_company')}</li>
          <li>{$_('business_card_page.field_role')}</li>
          <li>{$_('business_card_page.field_phone')}</li>
          <li>{$_('business_card_page.field_email')}</li>
          <li>{$_('business_card_page.field_website')}</li>
          <li>{$_('business_card_page.field_address')}</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('business_card_page.size_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('business_card_page.size_text')}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('business_card_page.format_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('business_card_page.format_text')}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('business_card_page.placement_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('business_card_page.placement_text')}</p>
      </section>

      <p>
        <a
          href={resolve(homePath as `/${string}/`)}
          class="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {$_('business_card_page.cta')}
        </a>
      </p>
    </article>
  </Card>
</div>
