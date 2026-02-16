<script lang="ts">
  import { _ } from 'svelte-i18n';
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
  <header class="">
    <h2 class="flex items-center gap-2">
      <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      {$_('form.heading')}
    </h2>
    <p>{$_('form.description')}</p>
  </header>

  <div class="space-y-5">
    <!-- Name section -->
    <fieldset class="space-y-2">
      <Label>{$_('form.name')}</Label>
      <div class="grid grid-cols-[72px_1fr_1fr] gap-2">
        <Input bind:value={prefix} placeholder={$_('form.prefix_placeholder')} title={$_('form.prefix_title')} />
        <Input bind:value={firstName} placeholder={$_('form.first_name_placeholder')} title={$_('form.first_name_title')} />
        <Input bind:value={lastName} placeholder={$_('form.last_name_placeholder')} title={$_('form.last_name_title')} />
      </div>
    </fieldset>

    <div class="grid sm:grid-cols-2 gap-4">
      <fieldset class="space-y-2">
        <Label for="jobTitle">{$_('form.job_title')}</Label>
        <Input id="jobTitle" bind:value={jobTitle} placeholder={$_('form.job_title_placeholder')} />
      </fieldset>

      <fieldset class="space-y-2">
        <Label for="company">{$_('form.company')}</Label>
        <Input id="company" bind:value={company} placeholder={$_('form.company_placeholder')} />
      </fieldset>
    </div>

    <fieldset class="space-y-2">
      <Label for="address">{$_('form.address')}</Label>
      <Input id="address" bind:value={address} placeholder={$_('form.address_placeholder')} />
    </fieldset>

    <!-- Phone numbers -->
    <fieldset class="space-y-3">
      <div class="flex items-center justify-between">
        <Label>{$_('form.phone_numbers')}</Label>
        <Button type="button" variant="ghost" size="sm" onclick={addPhone} class="h-8 text-xs gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {$_('form.add_phone')}
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
    </fieldset>

    <!-- Email addresses -->
    <fieldset class="space-y-3">
      <div class="flex items-center justify-between">
        <Label>{$_('form.email_addresses')}</Label>
        <Button type="button" variant="ghost" size="sm" onclick={addEmail} class="h-8 text-xs gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {$_('form.add_email')}
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
    </fieldset>

    <fieldset class="space-y-2">
      <Label for="website">{$_('form.website')}</Label>
      <Input id="website" bind:value={website} placeholder={$_('form.website_placeholder')} />
    </fieldset>

    <!-- Social profiles -->
    <fieldset class="space-y-3">
      <div class="flex items-center justify-between">
        <Label>{$_('form.social_profiles')}</Label>
        <Button type="button" variant="ghost" size="sm" onclick={addSocial} class="h-8 text-xs gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {$_('form.add_social')}
        </Button>
      </div>
      {#if socials.length === 0}
        <p class="text-sm text-secondary-foreground py-2 px-3 bg-secondary rounded-xl text-center">
          {$_('form.no_socials')}
        </p>
      {/if}
      {#each socials as social, i (i)}
        <SocialInput
          {social}
          onchange={(s) => updateSocial(i, s)}
          onremove={() => removeSocial(i)}
        />
      {/each}
    </fieldset>
  </div>
</Card>
