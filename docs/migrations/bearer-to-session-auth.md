# Migration: Bearer To Session Auth

## Outcome

Legacy bearer-token-oriented documentation was retired in favor of session/cookie-based auth architecture.

## Why

- current middleware and fetch layers are implemented around cookie sessions.
- proxy and server fetch both assume credentialed cookie forwarding.
- bearer-token guidance created contradictions and invalid AI context.

## Current Rule

Treat session/cookie auth as canonical unless implementation changes and ADRs are updated.
