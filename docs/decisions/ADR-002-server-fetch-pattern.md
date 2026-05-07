# ADR-002: Split Server And Client Fetching

## Status
Accepted

## Decision

Use `serverFetch` for server-rendered reads and `clientFetch` (proxy-backed) for browser interactivity.

## Rationale

- server path has direct cookie forwarding and no browser dependency.
- client path centralizes locale, XSRF, and cookie handoff in one bridge.
- this split keeps RSC and interactive data concerns explicit.
