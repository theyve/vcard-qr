<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    value?: string;
  }

  let { class: className = '', value = $bindable(''), ...rest }: Props = $props();
</script>

<input
  class="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm transition-all duration-150 placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 {className}"
  bind:value
  {...rest}
/>
