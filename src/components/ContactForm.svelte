<script lang="ts">
  import type { PhoneEntry, EmailEntry, SocialEntry, SocialType } from '$lib/vcard';
  import Card from './ui/Card.svelte';
  import Input from './ui/Input.svelte';
  import Label from './ui/Label.svelte';
  import Button from './ui/Button.svelte';
  import PhoneInput from './PhoneInput.svelte';
  import EmailInput from './EmailInput.svelte';
  import SocialInput from './SocialInput.svelte';

  interface Props {
    prefix: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
    address: string;
    website: string;
    phones: PhoneEntry[];
    emails: EmailEntry[];
    socials: SocialEntry[];
  }

  let {
    prefix = $bindable(),
    firstName = $bindable(),
    lastName = $bindable(),
    jobTitle = $bindable(),
    company = $bindable(),
    address = $bindable(),
    website = $bindable(),
    phones = $bindable(),
    emails = $bindable(),
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

  function addEmail() {
    emails = [...emails, { address: '', type: 'WORK' }];
  }

  function removeEmail(index: number) {
    emails = emails.filter((_, i) => i !== index);
  }

  function updateEmail(index: number, email: EmailEntry) {
    emails = emails.map((e, i) => (i === index ? email : e));
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
    <!-- Name section -->
    <div class="grid gap-2">
      <Label>Name</Label>
      <div class="grid grid-cols-[80px_1fr_1fr] gap-2">
        <Input bind:value={prefix} placeholder="Dr." title="Title/Prefix" />
        <Input bind:value={firstName} placeholder="First" title="First name" />
        <Input bind:value={lastName} placeholder="Last" title="Last name" />
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

    <!-- Email addresses -->
    <div class="grid gap-2">
      <div class="flex items-center justify-between">
        <Label>Email addresses</Label>
        <Button type="button" variant="ghost" size="sm" onclick={addEmail} class="h-7 text-xs">
          + Add email
        </Button>
      </div>
      {#each emails as email, i (i)}
        <EmailInput
          {email}
          canRemove={emails.length > 1}
          onchange={(e) => updateEmail(i, e)}
          onremove={() => removeEmail(i)}
        />
      {/each}
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
