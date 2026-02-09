<script lang="ts">
  import type { SocialEntry, SocialType } from '$lib/vcard';
  import { SOCIAL_TYPES } from '$lib/vcard';
  import Input from './ui/Input.svelte';
  import Select from './ui/Select.svelte';
  import Button from './ui/Button.svelte';

  interface Props {
    social: SocialEntry;
    onchange: (social: SocialEntry) => void;
    onremove: () => void;
  }

  let { social, onchange, onremove }: Props = $props();

  function handleUrlChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onchange({ ...social, url: target.value });
  }

  function handleTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onchange({ ...social, type: target.value as SocialType });
  }

  let placeholder = $derived(
    social.type === 'linkedin'
      ? 'linkedin.com/in/example'
      : `${social.type}.com/...`
  );
</script>

<div class="flex gap-2 items-center">
  <Select
    value={social.type}
    onchange={handleTypeChange}
    class="w-28 shrink-0 capitalize"
  >
    {#each SOCIAL_TYPES as t (t)}
      <option value={t} class="capitalize">{t}</option>
    {/each}
  </Select>
  <Input
    value={social.url}
    oninput={handleUrlChange}
    {placeholder}
    class="flex-1"
  />
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onclick={onremove}
    class="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
  >
    ×
  </Button>
</div>
