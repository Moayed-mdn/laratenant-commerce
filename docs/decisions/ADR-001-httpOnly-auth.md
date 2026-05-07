# ADR-001: Cookie Session Auth Boundary

## Status
Accepted

## Decision

Use cookie/session authentication as the frontend auth boundary. Do not architect around browser-managed bearer tokens.

## Rationale

- middleware already protects routes by session cookie presence.
- proxy and server fetch paths are cookie-forwarding by design.
- this model aligns with Laravel Sanctum CSRF/session flow.
