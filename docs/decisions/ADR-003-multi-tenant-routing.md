# ADR-003: URL-Driven Tenant Scope

## Status
Accepted

## Decision

Use route params (`storeId`) as the canonical tenant boundary for navigation, queries, and API endpoint construction.

## Rationale

- tenant context is explicit, sharable, and URL-stable.
- avoids stale global state causing cross-tenant leakage.
- aligns with existing route config and API helper patterns.
