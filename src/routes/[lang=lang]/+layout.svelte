<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { page } from '$app/stores';
  import InstallButton from '$lib/components/InstallButton.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  import { pathFor, type PageId, type SupportedLocale } from '$lib/site';

  let { data, children } = $props();
  let lang = $derived(data.lang as SupportedLocale);

  let currentPage = $derived<PageId | 'not-found'>(($page.data as { page?: PageId }).page ?? 'not-found');
  let homePath = $derived(pathFor('home', lang));

  let privacyDismissed = $state(false);
  $effect(() => {
    privacyDismissed = localStorage.getItem('privacy-dismissed') === '1';
  });

  function dismissPrivacy() {
    privacyDismissed = true;
    localStorage.setItem('privacy-dismissed', '1');
  }
</script>

<div class="min-h-screen flex flex-col">
  <header class="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-5">
      <div class="flex items-center justify-between">
        <a href={homePath} class="flex items-center gap-3 no-underline text-inherit">
          <div class="brand-qr" aria-hidden="true">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-bold tracking-tight">{$_('header.site_name')}</p>
            <p class="text-sm text-muted-foreground hidden sm:block">{$_('header.tagline')}</p>
          </div>
        </a>
        <InstallButton />
      </div>
    </div>
  </header>

  {#if !privacyDismissed}
    <div class="bg-emerald-50 border-b border-emerald-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-start sm:items-center gap-3">
        <div class="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 sm:mt-0">
          <svg class="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <p class="flex-1 text-sm text-emerald-800 leading-relaxed">
          <strong class="font-semibold">{$_('privacy_banner.strong')}</strong>
          {$_('privacy_banner.text')}
        </p>
        <button
          type="button"
          onclick={dismissPrivacy}
          class="shrink-0 p-1 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
          title={$_('privacy_banner.dismiss')}
          aria-label={$_('privacy_banner.dismiss')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <main class="flex-1 px-4 mb-10 sm:px-6 py-6 sm:py-8">
    <div class="max-w-5xl mx-auto">
      {@render children()}
    </div>
  </main>

  <SiteFooter {lang} page={currentPage} />
</div>
