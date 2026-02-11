<script lang="ts">
  import type { EmailEntry, EmailType } from '$lib/vcard';
  import Input from './ui/Input.svelte';
  import Select from './ui/Select.svelte';
  import Button from './ui/Button.svelte';

  interface Props {
    email: EmailEntry;
    canRemove: boolean;
    onchange: (email: EmailEntry) => void;
    onremove: () => void;
  }

  let { email, canRemove, onchange, onremove }: Props = $props();

  function handleAddressChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onchange({ ...email, address: target.value });
  }

  function handleTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onchange({ ...email, type: target.value as EmailType });
  }
</script>

<div class="flex gap-2 items-center">
  <Select
    value={email.type}
    onchange={handleTypeChange}
    aria-label="Email type"
    class="w-24 shrink-0"
  >
    <option value="WORK">Work</option>
    <option value="HOME">Home</option>
  </Select>
  <Input
    type="email"
    value={email.address}
    oninput={handleAddressChange}
    placeholder="email@example.com"
    class="flex-1"
  />
  {#if canRemove}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onclick={onremove}
      class="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
    >
      ×
    </Button>
  {/if}
</div>
