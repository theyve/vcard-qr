<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { UrlEntry } from '$lib/vcard';
  import Input from './ui/Input.svelte';
  import Button from './ui/Button.svelte';

  interface Props {
    website: UrlEntry;
    canRemove: boolean;
    onchange: (website: UrlEntry) => void;
    onremove: () => void;
  }

  let { website, canRemove, onchange, onremove }: Props = $props();

  function handleUrlChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onchange({ ...website, url: target.value });
  }
</script>

<div class="flex gap-2 items-center">
  <Input
    type="url"
    value={website.url}
    oninput={handleUrlChange}
    placeholder={$_('form.website_placeholder')}
    aria-label={$_('form.website')}
    autocomplete="url"
    class="flex-1"
  />
  {#if canRemove}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onclick={onremove}
      class="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      aria-label={$_('form.remove')}
    >
      ×
    </Button>
  {/if}
</div>
