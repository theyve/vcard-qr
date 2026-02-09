<script lang="ts">
  import type { PhoneEntry, SocialEntry, SocialType } from '$lib/vcard';
  import Card from './ui/Card.svelte';
  import Input from './ui/Input.svelte';
  import Label from './ui/Label.svelte';
  import Button from './ui/Button.svelte';
  import PhoneInput from './PhoneInput.svelte';
  import SocialInput from './SocialInput.svelte';

  interface Props {
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
    address: string;
    email: string;
    website: string;
    phones: PhoneEntry[];
    socials: SocialEntry[];
  }

  let {
    firstName = $bindable(),
    lastName = $bindable(),
    jobTitle = $bindable(),
    company = $bindable(),
    address = $bindable(),
    email = $bindable(),
    website = $bindable(),
    phones = $bindable(),
    socials = $bindable(),
  }: Props = $props();

  function addPhone() {
    phones = [...phones, { number: '', type: 'CELL' }];
  }

  function removePhone(index: number) {
    phones = phones.filter((_, i) => i !== index);
  }

  function updatePhone(index: number, phone: PhoneEntry) {
    phones = phones.map((p, i) => (i === index ? phone : p));
  }

  function addSocial() {
    socials = [...socials, { type: 'linkedin' as SocialType, url: '' }];
  }

  function removeSocial(index: number) {
    socials = socials.filter((_, i) => i !== index);
  }

  function updateSocial(index: number, social: SocialEntry) {
    socials = socials.map((s, i) => (i === index ? social : s));
  }
</script>

<Card>
  <header>
    <h2 class="text-lg font-semibold">Contact Details</h2>
    <p class="text-sm text-muted-foreground">
      Fill in what you want on the QR code. All fields are optional.
    </p>
  </header>

  <div class="grid gap-3">
    <div class="grid grid-cols-2 gap-3">
      <div class="grid gap-1">
        <Label for="firstName">First name</Label>
        <Input id="firstName" bind:value={firstName} />
      </div>
      <div class="grid gap-1">
        <Label for="lastName">Last name</Label>
        <Input id="lastName" bind:value={lastName} />
      </div>
    </div>

    <div class="grid gap-1">
      <Label for="jobTitle">Job title</Label>
      <Input id="jobTitle" bind:value={jobTitle} />
    </div>

    <div class="grid gap-1">
      <Label for="company">Company</Label>
      <Input id="company" bind:value={company} />
    </div>

    <div class="grid gap-1">
      <Label for="address">Address</Label>
      <Input id="address" bind:value={address} />
    </div>

    <!-- Phone numbers -->
    <div class="grid gap-2">
      <div class="flex items-center justify-between">
        <Label>Phone numbers</Label>
        <Button type="button" variant="ghost" size="sm" onclick={addPhone} class="h-7 text-xs">
          + Add phone
        </Button>
      </div>
      {#each phones as phone, i (i)}
        <PhoneInput
          {phone}
          canRemove={phones.length > 1}
          onchange={(p) => updatePhone(i, p)}
          onremove={() => removePhone(i)}
        />
      {/each}
    </div>

    <div class="grid gap-1">
      <Label for="email">Email</Label>
      <Input id="email" bind:value={email} />
    </div>

    <div class="grid gap-1">
      <Label for="website">Website</Label>
      <Input id="website" bind:value={website} placeholder="example.com" />
    </div>

    <!-- Social profiles -->
    <div class="grid gap-2">
      <div class="flex items-center justify-between">
        <Label>Social profiles</Label>
        <Button type="button" variant="ghost" size="sm" onclick={addSocial} class="h-7 text-xs">
          + Add social
        </Button>
      </div>
      {#if socials.length === 0}
        <p class="text-xs text-muted-foreground">No social profiles added yet.</p>
      {/if}
      {#each socials as social, i (i)}
        <SocialInput
          {social}
          onchange={(s) => updateSocial(i, s)}
          onremove={() => removeSocial(i)}
        />
      {/each}
    </div>
  </div>
</Card>
