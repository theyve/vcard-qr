<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';

  interface Props extends HTMLSelectAttributes {
    value?: string;
    children?: Snippet;
  }

  let { class: className = '', value = $bindable(''), children, ...rest }: Props = $props();
</script>

<select
  class="h-11 rounded-xl border border-input bg-card px-3 text-sm transition-all duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer {className}"
  bind:value
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</select>
