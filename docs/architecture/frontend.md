# Frontend Architecture

## Runtime Shape

- App Router is locale-first under `src/app/[locale]`.
- Protected dashboard UI lives in route group `src/app/[locale]/(dashboard)`.
- Tenant scope is path-driven using `stores/[storeId]`.
- Pages are thin wrappers that delegate behavior to feature modules in `src/features/*`.

## Core Providers

- Locale layout (`src/app/[locale]/layout.tsx`) wires:
  - `NextIntlClientProvider`
  - `NuqsAdapter`
  - `QueryProvider`
  - global `Toaster`
- Root layout (`src/app/layout.tsx`) sets global shell and font setup.

## UI Boundaries

- `components/ui/*`: shared low-level primitives (shadcn/ui).
- `components/shared/*`: cross-feature reusable business-agnostic components.
- `features/*`: domain-specific business logic and UI.
- avoid cross-feature imports except shared utilities/components.
