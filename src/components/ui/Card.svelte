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
  class="bg-card text-card-foreground border rounded-2xl shadow-sm p-5 space-y-5 {className}"
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</div>
