# Architectural State - May 2026

## Overview
The LaraTenant Commerce platform has been stabilized and cleaned up as part of its evolution toward a Shopify-style SaaS architecture. This document outlines the current state, folder ownership, and deprecated patterns.

## Current Architecture Direction
The project follows a **Feature-Driven Architecture** combined with Next.js App Router **Route Groups**.

### 1. Application Layers (Route Groups)
- `(auth)`: Authentication and onboarding flows.
- `(dashboard)`: Multi-tenant store management (previously `(admin)`).
- `(marketing)`: Public-facing landing pages and marketing content.
- `(storefront)`: Tenant-specific public storefronts.

### 2. Folder Ownership
- `src/app/[locale]/`: Routing logic and page composition. `page.tsx` files should be thin wrappers.
- `src/features/`: Domain-specific business logic and UI.
  - `auth/`: Login, signup, onboarding.
  - `dashboard/`: Users, orders, brands, categories, tags management.
  - `products/`:
    - `editor/`: The complex product editing experience.
    - `creation/`: The multi-step product creation wizard.
- `src/components/`:
  - `ui/`: Reusable primitive components (shadcn/ui).
  - `shared/`: Generic business-agnostic components.
- `src/lib/`: Core utilities, API clients, and shared logic.
- `src/stores/`: Global state (Zustand).
- `src/hooks/`: Shared React hooks (domain-specific hooks can live in `features/`).

## Terminology Migration
The terminology `(admin)` has been fully migrated to `(dashboard)` for routing and application architecture.
- **AdminShell** is now **DashboardShell**.
- **Admin routes** are now **Dashboard routes**.
- **Admin role/user/permissions** remain as domain concepts.

## Deprecated Patterns
- **Route-local `_components`**: Large component trees inside `src/app` are deprecated. Reusable business UI must live in `src/features`.
- **Duplicate Routes**: Creation routes should always use the `/new` convention. `/create` is deprecated.
- **`src/lib/products`**: Product-specific logic has been moved to `src/features/products/editor`.

## Technical Debt & Future Cleanup
- **Breadcrumbs**: Some breadcrumbs may still use "Admin" instead of "Dashboard".
- **Tests**: Some test mocks may need further stabilization after the move.
- **Storefront**: The `(storefront)` group is currently a placeholder and needs full implementation.
