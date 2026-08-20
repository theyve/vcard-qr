<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'accent';
  type Size = 'default' | 'sm' | 'lg' | 'icon';

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
    children?: Snippet;
  }

  const variantStyles: Record<Variant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-card hover:bg-secondary hover:text-foreground',
    ghost: 'hover:bg-secondary hover:text-foreground',
    accent: 'bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm',
  };

  const sizeStyles: Record<Size, string> = {
    default: 'h-11 px-5 py-2.5',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10',
  };

  let {
    variant = 'default',
    size = 'default',
    class: className = '',
    children,
    ...rest
  }: Props = $props();
</script>

<button
  class="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] {variantStyles[variant]} {sizeStyles[size]} {className}"
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</button>
