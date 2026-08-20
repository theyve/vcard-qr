<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PhoneEntry, EmailEntry, UrlEntry } from '$lib/vcard';
  import Card from './ui/Card.svelte';
  import Input from './ui/Input.svelte';
  import Label from './ui/Label.svelte';
  import Button from './ui/Button.svelte';
  import PhoneInput from './PhoneInput.svelte';
  import EmailInput from './EmailInput.svelte';
  import UrlInput from './UrlInput.svelte';

  interface Props {
    prefix: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phones: PhoneEntry[];
    emails: EmailEntry[];
    websites: UrlEntry[];
  }

  let {
    prefix = $bindable(),
    firstName = $bindable(),
    lastName = $bindable(),
    jobTitle = $bindable(),
    company = $bindable(),
    street = $bindable(),
    city = $bindable(),
    postalCode = $bindable(),
    country = $bindable(),
    phones = $bindable(),
    emails = $bindable(),
    websites = $bindable(),
  }: Props = $props();

  let phoneSeq = $state(1);
  let emailSeq = $state(1);
  let websiteSeq = $state(1);

  function addPhone() {
    phones = [...phones, { id: `phone-${phoneSeq++}`, number: '', type: 'CELL' }];
  }

  function removePhone(index: number) {
    phones = phones.filter((_, i) => i !== index);
  }

  function updatePhone(index: number, phone: PhoneEntry) {
    phones = phones.map((p, i) => (i === index ? phone : p));
  }

  function addEmail() {
    emails = [...emails, { id: `email-${emailSeq++}`, address: '', type: 'WORK' }];
  }

  function removeEmail(index: number) {
    emails = emails.filter((_, i) => i !== index);
  }

  function updateEmail(index: number, email: EmailEntry) {
    emails = emails.map((e, i) => (i === index ? email : e));
  }

  function addWebsite() {
    websites = [...websites, { id: `url-${websiteSeq++}`, url: '' }];
  }

  function removeWebsite(index: number) {
    websites = websites.filter((_, i) => i !== index);
  }

  function updateWebsite(index: number, website: UrlEntry) {
    websites = websites.map((w, i) => (i === index ? website : w));
  }
</script>

<Card>
  <header class="flex items-baseline justify-between gap-x-3 gap-y-0.5">
    <h2 class="flex items-baseline gap-2 min-w-0">
      <svg class="w-5 h-5 shrink-0 translate-y-[0.125em] text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      {$_('form.heading')}
    </h2>
    <p class="!mt-0 shrink-0 text-sm font-normal text-right !text-muted-foreground/65">{$_('form.description')}</p>
  </header>

  <div class="space-y-5">
    <!-- Name section -->
    <fieldset class="space-y-2">
      <legend class="text-sm font-medium text-foreground/90">{$_('form.name')}</legend>
      <div class="grid grid-cols-[72px_1fr_1fr] gap-2">
        <Input
          id="prefix"
          bind:value={prefix}
          placeholder={$_('form.prefix_placeholder')}
          aria-label={$_('form.prefix_title')}
          autocomplete="honorific-prefix"
        />
        <Input
          id="firstName"
          bind:value={firstName}
          placeholder={$_('form.first_name_placeholder')}
          aria-label={$_('form.first_name_title')}
          autocomplete="given-name"
        />
        <Input
          id="lastName"
          bind:value={lastName}
          placeholder={$_('form.last_name_placeholder')}
          aria-label={$_('form.last_name_title')}
          autocomplete="family-name"
        />
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

    <!-- Structured address (ADR) -->
    <fieldset class="space-y-3">
      <legend class="text-sm font-medium text-foreground/90">{$_('form.address')}</legend>
      <div class="space-y-1">
        <Label for="street">{$_('form.street')}</Label>
        <Input id="street" bind:value={street} placeholder={$_('form.street_placeholder')} autocomplete="street-address" />
      </div>
      <div class="grid grid-cols-[7rem_1fr] gap-2">
        <div class="space-y-1">
          <Label for="postalCode">{$_('form.postal_code')}</Label>
          <Input id="postalCode" bind:value={postalCode} placeholder={$_('form.postal_code_placeholder')} autocomplete="postal-code" />
        </div>
        <div class="space-y-1">
          <Label for="city">{$_('form.city')}</Label>
          <Input id="city" bind:value={city} placeholder={$_('form.city_placeholder')} autocomplete="address-level2" />
        </div>
      </div>
      <div class="space-y-1">
        <Label for="country">{$_('form.country')}</Label>
        <Input id="country" bind:value={country} placeholder={$_('form.country_placeholder')} autocomplete="country-name" />
      </div>
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
      {#each phones as phone, i (phone.id)}
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
      {#each emails as email, i (email.id)}
        <EmailInput
          {email}
          canRemove={emails.length > 1}
          onchange={(e) => updateEmail(i, e)}
          onremove={() => removeEmail(i)}
        />
      {/each}
    </fieldset>

    <!-- Websites / URLs -->
    <fieldset class="space-y-3">
      <div class="flex items-center justify-between">
        <Label>{$_('form.websites')}</Label>
        <Button type="button" variant="ghost" size="sm" onclick={addWebsite} class="h-8 text-xs gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {$_('form.add_website')}
        </Button>
      </div>
      {#each websites as website, i (website.id)}
        <UrlInput
          {website}
          canRemove={websites.length > 1}
          onchange={(w) => updateWebsite(i, w)}
          onremove={() => removeWebsite(i)}
        />
      {/each}
    </fieldset>
  </div>
</Card>
