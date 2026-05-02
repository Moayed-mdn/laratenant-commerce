# Frontend Styling

This document contains the color token system, CSS variables, and Tailwind configuration.

---

# 4. Color Token System (CRITICAL)

## Problem This Solves

The client has not finalized colors. This system allows the
entire app color scheme to be changed by editing ONE file.

## How It Works

All colors are defined as CSS variables in `globals.css`.
Tailwind is configured to read those variables.
Components NEVER use hardcoded Tailwind color classes like
`bg-blue-500` or `text-gray-900`.
They ALWAYS use semantic token classes like
`bg-primary` or `text-foreground`.

## Token Definitions (`src/app/globals.css`)

```css
@layer base {
  :root {
    /* Brand */
    --color-primary:         221 83% 53%;
    --color-primary-hover:   221 83% 45%;
    --color-primary-fore:    0 0% 100%;

    /* Backgrounds */
    --color-bg:              0 0% 100%;
    --color-surface:         0 0% 98%;
    --color-surface-raised:  0 0% 96%;

    /* Sidebar */
    --color-sidebar-bg:      222 47% 11%;
    --color-sidebar-fore:    210 40% 96%;
    --color-sidebar-active:  221 83% 53%;
    --color-sidebar-border:  217 33% 17%;

    /* Borders */
    --color-border:          214 32% 91%;
    --color-border-strong:   214 32% 80%;

    /* Text */
    --color-foreground:      222 47% 11%;
    --color-muted:           215 16% 47%;
    --color-subtle:          215 16% 65%;

    /* Status */
    --color-success:         142 71% 45%;
    --color-success-bg:      142 71% 95%;
    --color-warning:         38 92% 50%;
    --color-warning-bg:      38 92% 95%;
    --color-danger:          0 84% 60%;
    --color-danger-bg:       0 84% 95%;
    --color-info:            199 89% 48%;
    --color-info-bg:         199 89% 95%;
  }

  .dark {
    --color-bg:              222 47% 11%;
    --color-surface:         217 33% 17%;
    --color-surface-raised:  215 28% 22%;
    --color-border:          217 33% 25%;
    --color-foreground:      210 40% 96%;
    --color-muted:           215 16% 65%;
  }
}
```

## Tailwind Config (`tailwind.config.ts`)

```ts
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          hover:   'hsl(var(--color-primary-hover))',
          fore:    'hsl(var(--color-primary-fore))',
        },
        bg:       'hsl(var(--color-bg))',
        surface:  'hsl(var(--color-surface))',
        raised:   'hsl(var(--color-surface-raised))',
        border:   'hsl(var(--color-border))',
        fore:     'hsl(var(--color-foreground))',
        muted:    'hsl(var(--color-muted))',
        subtle:   'hsl(var(--color-subtle))',
        sidebar: {
          bg:     'hsl(var(--color-sidebar-bg))',
          fore:   'hsl(var(--color-sidebar-fore))',
          active: 'hsl(var(--color-sidebar-active))',
          border: 'hsl(var(--color-sidebar-border))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          bg:      'hsl(var(--color-success-bg))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          bg:      'hsl(var(--color-warning-bg))',
        },
        danger: {
          DEFAULT: 'hsl(var(--color-danger))',
          bg:      'hsl(var(--color-danger-bg))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          bg:      'hsl(var(--color-info-bg))',
        },
      },
    },
  },
}
```

## Rules

- NEVER use hardcoded Tailwind color classes
- ALWAYS use semantic token classes
- When client decides on colors → edit `globals.css` only
- Dark mode is handled by `.dark` class on `<html>`

### ❌ Forbidden
```tsx
<div className="bg-blue-500 text-gray-900">
<div className="border-gray-200">
```

### ✅ Required
```tsx
<div className="bg-primary text-primary-fore">
<div className="border-border">
```
