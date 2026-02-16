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

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <a href={homePath} onclick={(e) => navigate(homePath, e)} class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    {$_('faq.back_link')}
  </a>

  <Card>
    <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">{$_('faq.heading')}</h1>

    <div class="space-y-1">
      {#each faqKeys as qKey}
        <details class="group">
          <summary class="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground hover:text-accent transition-colors py-3 border-b border-border/50">
            <span>{$_(`faq.${qKey}`)}</span>
            <svg class="w-4 h-4 shrink-0 ml-2 text-muted-foreground transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </summary>
          <div class="py-3 text-sm text-muted-foreground leading-relaxed">
            {$_(`faq.${qKey.replace('q', 'a')}`)}
          </div>
        </details>
      {/each}
    </div>
  </Card>
</div>
