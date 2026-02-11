<!--
  Card component - combines container and content padding.
  Use semantic children: <header>, <div>, <footer> for structure.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<div
  class="bg-card text-card-foreground border rounded-2xl p-6 space-y-6 transition-shadow duration-200 hover:shadow-md {className}"
  style="box-shadow: var(--shadow-sm);"
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  div :global(header) {
    padding-bottom: 0.25rem;
  }
  
  div :global(header h2) {
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  
  div :global(header p) {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: hsl(var(--secondary-foreground));
  }
</style>
