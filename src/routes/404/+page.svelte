<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Seo from '$lib/components/Seo.svelte';
  import { seoFor } from '$lib/site';

  const seo = seoFor('de', 'not-found');
</script>

<Seo lang="de" page="not-found" title={seo.title} description={seo.description} robots="noindex, follow" />

<div class="min-h-screen flex flex-col items-center justify-center px-6 py-16">
  <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{$_('not_found.heading')}</h1>
  <p class="text-muted-foreground leading-relaxed mb-6 max-w-md text-center">{$_('not_found.text')}</p>
  <div class="flex gap-3">
    <a href="/de/" class="rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background">{$_('not_found.back')}</a>
    <a href="/en/" class="rounded-xl border border-input px-4 py-2.5 text-sm font-semibold">English</a>
  </div>
</div>
