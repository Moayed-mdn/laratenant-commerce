# Error Handling Standards

- API wrappers throw normalized errors with status/message/errors.
- feature components own user-facing fallbacks (toast, empty, retry state).
- log unexpected failures with `src/lib/logger.ts`.
- prefer explicit error states over silent failures.
- keep auth 401 handling consistent with `auth:unauthorized` flow.

## Canonical ApiError Shape

- all transport wrappers and server-side API access must normalize errors to:
  - `message: string`
  - `errors: Record<string, string[]>`
  - `status: number`
  - `code: string`
- use `src/lib/api/core/transport.ts` (`toApiError`) for HTTP error normalization.
- do not introduce symbolic-only error code systems in fetch-based paths.

## Guardrails

- never duplicate response parsing logic in feature modules.
- never implement per-feature HTTP error normalization.
- never swallow unexpected errors silently in shared API utilities.
- do not use `console.*` for application error logging; use `src/lib/logger.ts`.
