# Data Flow

## Read Path

- Server components fetch initial/detail data via `serverFetch`.
- Response mapping happens in mapper layer before UI rendering.
- Client components receive already-shaped view data.

## Interactive Path

- Client tables/forms use TanStack Query hooks.
- URL state uses `nuqs` and schema-validated params.
- mutations are encapsulated in feature hooks (`hooks/*`).

## Request Lifecycle Boundaries

- shared transport lifecycle (`src/lib/api/core/transport.ts`):
  - serialize body
  - compose default JSON headers
  - parse response body safely
  - normalize HTTP errors into `ApiError`
- server runtime lifecycle:
  - `serverFetch` injects server cookies and calls Laravel directly
- browser runtime lifecycle:
  - `clientFetch` calls `/api/proxy`
  - proxy forwards browser session/XSRF/locale context upstream

## Current Runtime Request Flow

```text
Server Component / Server Action
  -> serverFetch
  -> Laravel API

Client Hook / Client Component
  -> clientFetch
  -> /api/proxy
  -> Laravel API
```

## Auth Flow

```text
Login (browser)
  -> auth API module
  -> clientFetch
  -> /api/proxy
  -> Laravel /sanctum + /auth/login
  -> session cookies set

Auth hydration (browser)
  -> AuthContext
  -> auth API module
  -> internal /api/auth/me
  -> serverFetch
  -> Laravel /auth/me
```

## Proxy Responsibility Clarification

- `/api/proxy` is the browser-only upstream bridge.
- it forwards:
  - session cookies
  - XSRF token for non-GET requests
  - resolved locale header
- it is not a general replacement for server runtime requests.

## Error Path

- API wrappers throw normalized errors.
- components handle errors locally with fallback UI/toasts.
- no global route-level error boundary is currently enforced.
