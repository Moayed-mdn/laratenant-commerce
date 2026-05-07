# Rendering Strategy

## Component Types

- prefer Server Components for initial data reads and detail pages.
- use Client Components for interactivity:
  - forms
  - controlled inputs
  - TanStack Query hooks
  - browser-only APIs/effects

## Current Pattern

- route `page.tsx` is typically server-side and wraps content in `Suspense`.
- `_components/*Content` can be server or client depending on behavior.
- skeleton/loading behavior is usually component-local.

## Rules

- do not convert interactive flows into server components.
- do not fetch interactive table/filter state in server components.
- keep server/client boundaries explicit at file level (`'use client'`).
