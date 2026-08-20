<script lang="ts">
  import { _ } from 'svelte-i18n';

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }

  let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
  let isInstalled = $state(false);
  let showInstallToast = $state(false);
  let installToastMessage = $state('');

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));

  if (isStandalone) {
    isInstalled = true;
  }

  const isAppleTouch =
    typeof navigator !== 'undefined' &&
    (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const isMacDesktop =
    typeof navigator !== 'undefined' && /Macintosh/.test(navigator.userAgent) && !isAppleTouch;
  const bookmarkShortcut = isMacDesktop ? '⌘D' : 'Ctrl+D';

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
    });

    window.addEventListener('appinstalled', () => {
      isInstalled = true;
      deferredPrompt = null;
      showToast($_('install.installed_toast'));
    });
  }

  function showToast(message: string) {
    installToastMessage = message;
    showInstallToast = true;
    setTimeout(() => {
      showInstallToast = false;
    }, 3500);
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
      }
    } else if (isAppleTouch) {
      showToast($_('install.bookmark_toast_ios'));
    } else {
      showToast($_('install.bookmark_toast', { values: { shortcut: bookmarkShortcut } }));
    }
  }

  let installLabel = $derived(deferredPrompt ? $_('install.install_app') : $_('install.bookmark'));
  let installTitle = $derived(
    deferredPrompt
      ? $_('install.install_title')
      : isAppleTouch
        ? $_('install.bookmark_title_ios')
        : $_('install.bookmark_title', { values: { shortcut: bookmarkShortcut } }),
  );
</script>

{#if showInstallToast}
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-fade-in">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
    </svg>
    {installToastMessage}
  </div>
{/if}

{#if !isInstalled}
  <button
    type="button"
    onclick={handleInstall}
    class="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-card hover:bg-secondary transition-all text-sm text-muted-foreground hover:text-foreground {deferredPrompt ? '' : 'plausible-event-name=Bookmark'}"
    title={installTitle}
    aria-label={installTitle}
  >
    {#if deferredPrompt}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
    {:else}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
      </svg>
    {/if}
    <span class="hidden sm:inline">{installLabel}</span>
  </button>
{/if}
