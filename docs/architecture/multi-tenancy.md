# Multi-Tenancy

## Tenant Boundary

- Tenant identity is URL-driven by `storeId`.
- Canonical route shape: `/{locale}/stores/{storeId}/...`.
- API endpoints are tenant-scoped through `API_ROUTES.store(storeId)`.

## Source Of Truth

- `storeId` comes from route params, not global state.
- Zustand store context (`storeStore`) is metadata only (name/currency/etc).

## Rules

- never infer tenant from cached user/store metadata.
- never build tenant API URLs manually; use route config helpers.
- every tenant page and query key must include `storeId`.
