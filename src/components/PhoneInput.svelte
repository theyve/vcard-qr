<script lang="ts">
  import type { PhoneEntry, PhoneType } from '$lib/vcard';
  import Input from './ui/Input.svelte';
  import Select from './ui/Select.svelte';
  import Button from './ui/Button.svelte';

  interface Props {
    phone: PhoneEntry;
    canRemove: boolean;
    onchange: (phone: PhoneEntry) => void;
    onremove: () => void;
  }

  let { phone, canRemove, onchange, onremove }: Props = $props();

  function handleNumberChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onchange({ ...phone, number: target.value });
  }

  function handleTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onchange({ ...phone, type: target.value as PhoneType });
  }
</script>

<div class="flex gap-2 items-center">
  <Select
    value={phone.type}
    onchange={handleTypeChange}
    class="w-24 shrink-0"
  >
    <option value="CELL">Cell</option>
    <option value="WORK">Work</option>
    <option value="HOME">Home</option>
  </Select>
  <Input
    value={phone.number}
    oninput={handleNumberChange}
    placeholder="+1 555 123 4567"
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
