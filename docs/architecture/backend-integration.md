# Backend Integration

## Integration Model

- Backend is Laravel API (`APP_CONFIG.apiBaseUrl`).
- Browser calls internal Next route `src/app/api/proxy/route.ts`.
- Server components call Laravel directly with `serverFetch`.

## Client Path

- `clientFetch` sends requests to `/api/proxy?endpoint=...`.
- proxy forwards cookies, locale (`Accept-Language`), and XSRF token (`X-XSRF-TOKEN`).
- proxy relays upstream status/body and propagates `set-cookie`.

## Server Path

- `serverFetch` uses `next/headers` cookies and forwards cookie header upstream.
- default cache mode is `no-store`.
- non-2xx responses throw normalized `ApiError` objects.

## Rules

- do not call Laravel directly from browser code.
- all browser network access must go through proxy.
- all API routes must be defined in `src/config/routes.ts`.
