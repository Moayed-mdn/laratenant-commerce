# API Layer Standards

- define all API endpoints through `API_ROUTES` in `src/config/routes.ts`.
- browser code uses `clientFetch` only (proxy-backed).
- server components/actions use `serverFetch` or server actions.
- always return/throw normalized API error shape.
- include tenant scope (`storeId`) in endpoint construction.

## Canonical Fetch Utilities

- shared low-level transport concerns live in `src/lib/api/core/transport.ts`.
- transport core is runtime-agnostic and handles only:
  - safe response parsing
  - JSON content-type checks
  - request body serialization
  - default JSON header composition
  - `ApiError` normalization from HTTP responses
- transport core must not know about:
  - browser/server runtime boundaries
  - proxy route behavior
  - Laravel base URL selection
  - cookie/auth forwarding
  - tenant/locale routing logic

## Runtime Boundaries

- `serverFetch` owns server runtime concerns:
  - Laravel base URL calls
  - cookie forwarding from `next/headers`
  - SSR-safe cache controls
- `clientFetch` owns browser runtime concerns:
  - same-origin calls to `/api/proxy`
  - client-side unauthorized event dispatching
- route handlers and server actions must use canonical server fetch utilities instead of raw duplicated fetch setup when calling Laravel.

## Auth Access Pattern

- browser auth operations must go through auth API modules in `src/lib/api/*`, not direct component-level `fetch` calls.
- `AuthContext` must consume auth API helpers (no duplicated internal route fetch logic).
- server-side auth actions and route handlers must use `serverFetch` for upstream Laravel communication.

## Raw fetch Policy

- raw `fetch` is allowed only in:
  - canonical wrappers (`serverFetch`, `clientFetch`)
  - browser bridge route (`/api/proxy`)
  - centralized auth API helpers that call internal Next route handlers
- any new raw `fetch` usage outside these areas requires architecture justification in docs/ADR.

## Duplication Guardrails

- never duplicate header composition in multiple API modules.
- never duplicate `ApiError` normalization logic.
- never create additional fetch wrappers without explicit runtime boundary need.
