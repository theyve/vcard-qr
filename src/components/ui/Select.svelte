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
  class="h-10 rounded-md border border-input bg-background px-2 text-sm {className}"
  bind:value
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</select>
