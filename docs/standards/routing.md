# Routing Standards

- all user-facing routes are locale-aware (`/{locale}/...`).
- admin tenant routes are scoped under `stores/[storeId]`.
- use `src/lib/navigation.ts` helpers for locale-aware links/navigation.
- keep route builders in `src/config/routes.ts`; avoid string literals.
- for server redirects, prepend locale explicitly when needed.
