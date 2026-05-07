# API Layer Standards

- define all API endpoints through `API_ROUTES` in `src/config/routes.ts`.
- browser code uses `clientFetch` only (proxy-backed).
- server components/actions use `serverFetch` or server actions.
- always return/throw normalized API error shape.
- include tenant scope (`storeId`) in endpoint construction.
