# Frontend Architecture

## Runtime Shape

- App Router is locale-first under `src/app/[locale]`.
- Protected admin UI lives in route group `src/app/[locale]/(admin)`.
- Tenant scope is path-driven using `stores/[storeId]`.
- Pages are thin wrappers that delegate behavior to `_components/*Content`.

## Core Providers

- Locale layout (`src/app/[locale]/layout.tsx`) wires:
  - `NextIntlClientProvider`
  - `NuqsAdapter`
  - `QueryProvider`
  - global `Toaster`
- Root layout (`src/app/layout.tsx`) sets global shell and font setup.

## UI Boundaries

- `components/ui/*`: shared low-level primitives.
- `components/shared/*`: cross-feature reusable components.
- feature `_components/*`: page/module-specific behavior.
- avoid cross-feature imports except shared utilities/components.
