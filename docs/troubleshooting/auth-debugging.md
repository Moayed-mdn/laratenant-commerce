# Auth Debugging

- first check middleware cookie detection (`SANCTUM_SESSION_COOKIE`, `laravel_session`, `ecommerce_session`).
- verify login flow requests CSRF cookie before credential POST.
- check `/api/proxy` forwards cookies and XSRF headers for mutations.
- confirm protected paths are locale-aware and redirect correctly.
- inspect 401 handling path from `clientFetch` to auth-state clear behavior.
