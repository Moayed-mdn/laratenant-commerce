# Fetching Standards

- use Server Components + `serverFetch` for initial and detail reads.
- use TanStack Query hooks for interactive lists, filters, and mutations.
- parse URL query state with schemas and keep URL as source of truth.
- debounce text filters before query execution when needed.
- keep query keys stable and parameterized by locale/tenant/filter context.

## SSR vs CSR Request Flow

- SSR/RSC flow:
  - Server Components and server actions call `serverFetch` directly to Laravel.
  - `serverFetch` forwards session cookies and throws normalized `ApiError` on non-2xx responses.
- CSR/interactive flow:
  - hooks and client modules call `clientFetch`.
  - `clientFetch` always sends browser traffic to `/api/proxy`.
  - `/api/proxy` is responsible for browser-to-upstream forwarding concerns (cookies, XSRF, locale header handoff).

## Proxy Responsibility Rules

- keep `/api/proxy` as a bridge for browser requests in cookie-session architecture.
- do not use `/api/proxy` for server runtime calls that should use `serverFetch`.
- avoid duplicating parsing/normalization logic in feature-level modules; use canonical fetch wrappers.

## Extension Rules

- if you add a new API module, consume `clientApi`/`clientFetch` (browser) or `serverFetch` (server).
- keep query keys, hook signatures, and response shapes stable when refactoring transport internals.
- for auth/session-related browser helpers, centralize internal route calls in auth API modules, not components.
- avoid introducing runtime-mixed helpers that can run in both browser and server implicitly.
