---
name: "shadcn-vue-architect"
description: "Architect consistent UI components using Shadcn-Nuxt, Reka-UI, and Tailwind 4. Focuses on accessibility, variant management, and clean class merging."
---

# Shadcn-Vue Component Architect

## Objectives
- Create highly accessible UI components using Reka-UI (formerly Radix Vue) primitives.
- Manage complex component states and styles using Tailwind Variants (TV).
- Ensure full compatibility with Tailwind 4 (modern engine).
- Maintain clean code by merging classes correctly to avoid CSS conflicts.

## Prerequisites
- Nuxt 4 with `shadcn-nuxt` module.
- `reka-ui` for unstyled accessible primitives.
- `tailwind-variants`, `tailwind-merge`, and `clsx` installed.

## Conventions
- Use `tailwind-merge` and `clsx` via a `cn()` utility for all class processing.
- Define component logic using Reka-UI to ensure keyboard navigation and ARIA attributes.
- Use the `tv()` function from `tailwind-variants` to define styles, slots, and responsive variants.
- Strictly follow Tailwind 4 syntax (e.g., use CSS variables for theme colors if defined in the new @theme block).

## The Base Utility (cn)
The Agent must always use this utility to merge classes safely.

```ts
// utils/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Component Structure with Variants
When creating a new UI element, use the following pattern with `tailwind-variants`.

```ts
<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '~/utils/cn'

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
      outline: 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    },
    size: {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

type ButtonProps = VariantProps<typeof buttonVariants>

interface Props {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <button :class="cn(buttonVariants({ variant, size }), props.class)">
    <slot />
  </button>
</template>
```

## Accessibility with Reka-UI
Always wrap components in Reka-UI primitives to ensure they are functional for all users.

```ts
<script setup lang="ts">
import { 
  PopoverRoot, 
  PopoverTrigger, 
  PopoverPortal, 
  PopoverContent 
} from 'reka-ui'
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger>Open</PopoverTrigger>
    <PopoverPortal>
      <PopoverContent 
        :side-offset="5"
        class="z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
```

## Internationalization (i18n)
- No Hardcoded Text: Never use plain strings for labels, placeholders, or aria-labels.
- Usage: Always use the $t('key') helper in templates or const { t } = useI18n() in script setup.
- Structure: Use hierarchical keys, e.g., $t('components.product_card.add_to_cart').

## Acceptance Criteria
- Components must not have CSS conflicts (use `twMerge`).
- Variants must be defined using `tailwind-variants` (TV).
- Interactive elements (modals, dropdowns, tabs) must use `reka-ui`.
- Props must include a class attribute to allow external styling overrides.

## Design Rules (STRICT)
- Typography:
  - Titles (H1-H6) and component headers: Always use font Figtree.
  - Body text, labels, and buttons: Always use font Figtree.
- Colors (Tailwind v4 Variables):
  - Primary: var(--color-primary)
  - Headings: var(--color-background)
  - Background: var(--color-background)
- Light Mode Only: Never use dark: classes.