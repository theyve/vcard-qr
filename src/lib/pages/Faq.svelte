<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { SupportedLocale } from '$lib/i18n';
  import Card from '$lib/components/ui/Card.svelte';
  import de from '$lib/i18n/de.json';
  import en from '$lib/i18n/en.json';
  import { pathFor } from '$lib/site';

  interface Props {
    lang: SupportedLocale;
  }

  let { lang }: Props = $props();
  let homePath = $derived(pathFor('home', lang));

  function faqQuestionKeys(faq: Record<string, string>): string[] {
    return Object.keys(faq)
      .filter((key) => /^q\d+$/.test(key))
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  }

  function answerParagraphs(text: string): string[] {
    return text
      .split(/\n\n+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  let messages = $derived((lang === 'de' ? de : en).faq as Record<string, string>);
  let faqKeys = $derived(faqQuestionKeys(messages));
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <a href={homePath} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    {$_('faq.back_link')}
  </a>

  <Card>
    <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">{$_('faq.heading')}</h1>

    <div class="space-y-1">
      {#each faqKeys as qKey (qKey)}
        {@const aKey = qKey.replace('q', 'a')}
        <details class="group">
          <summary class="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground hover:text-accent transition-colors py-3 border-b border-border/50">
            <span>{$_(`faq.${qKey}`)}</span>
            <svg class="w-4 h-4 shrink-0 ml-2 text-muted-foreground transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </summary>
          <div class="py-3 space-y-3 text-sm text-muted-foreground leading-relaxed">
            {#each answerParagraphs(messages[aKey] ?? '') as para, i (`${aKey}-${i}`)}
              <p>{para}</p>
            {/each}
          </div>
        </details>
      {/each}
    </div>
  </Card>
</div>
