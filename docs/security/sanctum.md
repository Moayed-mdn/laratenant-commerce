# Sanctum Integration

- frontend treats auth as cookie/session-based, not bearer-token-managed.
- login flow explicitly calls `/sanctum/csrf-cookie` before credential POST.
- non-GET proxy requests forward decoded `XSRF-TOKEN` as `X-XSRF-TOKEN`.
- backend session cookies are forwarded and persisted via proxy response headers.
