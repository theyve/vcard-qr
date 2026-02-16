<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { SupportedLocale } from '$lib/i18n';
  import Card from '../components/ui/Card.svelte';

  interface Props {
    navigate: (path: string, e?: MouseEvent) => void;
    lang: SupportedLocale;
  }

  let { navigate, lang }: Props = $props();

  let homePath = $derived(`/${lang}/`);
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <a href={homePath} onclick={(e) => navigate(homePath, e)} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    {$_('vcard_page.back_link')}
  </a>

  <Card>
    <article class="prose-content space-y-6">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">{$_('vcard_page.heading')}</h1>
      
      <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.intro')}</p>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('vcard_page.usage_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.usage_text')}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('vcard_page.scan_heading')}</h2>
        <ul class="text-muted-foreground space-y-2">
          <li class="flex items-start gap-2">
            <span class="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent"></span>
            <span>{$_('vcard_page.scan_iphone')}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent"></span>
            <span>{$_('vcard_page.scan_android')}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('vcard_page.print_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.print_text')}</p>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">{$_('vcard_page.format_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('vcard_page.format_text')}</p>
      </section>
    </article>
  </Card>
</div>
