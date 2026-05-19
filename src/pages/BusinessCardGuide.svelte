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
  let vcardPath = $derived(lang === 'de' ? '/de/was-ist-vcard' : '/en/what-is-vcard');
  let faqPath = $derived(`/${lang}/faq`);

  const contactKeys = ['name', 'phone', 'email', 'company', 'website'] as const;
  const formatKeys = ['svg', 'png', 'vcf'] as const;
  const faqKeys = ['q1', 'q2', 'q3'] as const;
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <a href={homePath} onclick={(e) => navigate(homePath, e)} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    {$_('guide_page.back_link')}
  </a>

  <Card>
    <article class="space-y-8">
      <header class="space-y-4">
        <p class="text-sm font-semibold uppercase tracking-wide text-accent">{$_('guide_page.kicker')}</p>
        <div class="space-y-3">
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">{$_('guide_page.heading')}</h1>
          <p class="text-lg text-muted-foreground leading-relaxed">{$_('guide_page.intro')}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a href={homePath} onclick={(e) => navigate(homePath, e)} class="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
            {$_('guide_page.cta')}
          </a>
          <a href={faqPath} onclick={(e) => navigate(faqPath, e)} class="inline-flex items-center justify-center rounded-xl border border-input px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
            {$_('guide_page.faq_cta')}
          </a>
        </div>
      </header>

      <section class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border bg-secondary/35 p-4">
          <p class="text-sm font-semibold">{$_('guide_page.benefit_fast_heading')}</p>
          <p class="mt-1 text-sm text-muted-foreground leading-relaxed">{$_('guide_page.benefit_fast_text')}</p>
        </div>
        <div class="rounded-xl border bg-secondary/35 p-4">
          <p class="text-sm font-semibold">{$_('guide_page.benefit_print_heading')}</p>
          <p class="mt-1 text-sm text-muted-foreground leading-relaxed">{$_('guide_page.benefit_print_text')}</p>
        </div>
        <div class="rounded-xl border bg-secondary/35 p-4">
          <p class="text-sm font-semibold">{$_('guide_page.benefit_private_heading')}</p>
          <p class="mt-1 text-sm text-muted-foreground leading-relaxed">{$_('guide_page.benefit_private_text')}</p>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold tracking-tight">{$_('guide_page.how_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('guide_page.how_text')}</p>
        <ol class="grid gap-3 sm:grid-cols-3">
          <li class="rounded-xl border p-4">
            <span class="text-xs font-semibold text-accent">01</span>
            <p class="mt-1 font-semibold">{$_('guide_page.step_1_heading')}</p>
            <p class="mt-1 text-sm text-muted-foreground leading-relaxed">{$_('guide_page.step_1_text')}</p>
          </li>
          <li class="rounded-xl border p-4">
            <span class="text-xs font-semibold text-accent">02</span>
            <p class="mt-1 font-semibold">{$_('guide_page.step_2_heading')}</p>
            <p class="mt-1 text-sm text-muted-foreground leading-relaxed">{$_('guide_page.step_2_text')}</p>
          </li>
          <li class="rounded-xl border p-4">
            <span class="text-xs font-semibold text-accent">03</span>
            <p class="mt-1 font-semibold">{$_('guide_page.step_3_heading')}</p>
            <p class="mt-1 text-sm text-muted-foreground leading-relaxed">{$_('guide_page.step_3_text')}</p>
          </li>
        </ol>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold tracking-tight">{$_('guide_page.contact_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('guide_page.contact_text')}</p>
        <ul class="grid gap-2 sm:grid-cols-2">
          {#each contactKeys as contactKey (contactKey)}
            <li class="flex items-start gap-2 text-sm text-muted-foreground">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
              <span>{$_(`guide_page.contact_${contactKey}`)}</span>
            </li>
          {/each}
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold tracking-tight">{$_('guide_page.print_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('guide_page.print_text')}</p>
        <div class="grid gap-3 sm:grid-cols-3">
          {#each formatKeys as formatKey (formatKey)}
            <div class="rounded-xl border p-4">
              <p class="font-semibold">{$_(`guide_page.format_${formatKey}_heading`)}</p>
              <p class="mt-1 text-sm text-muted-foreground leading-relaxed">{$_(`guide_page.format_${formatKey}_text`)}</p>
            </div>
          {/each}
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold tracking-tight">{$_('guide_page.static_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('guide_page.static_text')}</p>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold tracking-tight">{$_('guide_page.scan_heading')}</h2>
        <p class="text-muted-foreground leading-relaxed">{$_('guide_page.scan_text')}</p>
      </section>

      <section class="rounded-xl border bg-accent/10 p-5">
        <h2 class="text-xl font-bold tracking-tight">{$_('guide_page.ready_heading')}</h2>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">{$_('guide_page.ready_text')}</p>
        <a href={homePath} onclick={(e) => navigate(homePath, e)} class="mt-4 inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
          {$_('guide_page.cta')}
        </a>
      </section>

      <section class="space-y-3">
        <h2 class="text-2xl font-bold tracking-tight">{$_('guide_page.faq_heading')}</h2>
        <div class="divide-y rounded-xl border">
          {#each faqKeys as faqKey (faqKey)}
            <div class="p-4">
              <h3 class="font-semibold">{$_(`guide_page.${faqKey}`)}</h3>
              <p class="mt-1 text-sm text-muted-foreground leading-relaxed">{$_(`guide_page.${faqKey.replace('q', 'a')}`)}</p>
            </div>
          {/each}
        </div>
      </section>

      <p class="text-sm text-muted-foreground">
        {$_('guide_page.more_before')}
        <a href={vcardPath} onclick={(e) => navigate(vcardPath, e)} class="font-medium text-foreground underline underline-offset-2 hover:text-accent transition-colors">{$_('guide_page.more_vcard_link')}</a>
        {$_('guide_page.more_mid')}
        <a href={faqPath} onclick={(e) => navigate(faqPath, e)} class="font-medium text-foreground underline underline-offset-2 hover:text-accent transition-colors">{$_('guide_page.more_faq_link')}</a>
        {$_('guide_page.more_after')}
      </p>
    </article>
  </Card>
</div>
