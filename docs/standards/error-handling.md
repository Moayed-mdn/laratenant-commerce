# Error Handling Standards

- API wrappers throw normalized errors with status/message/errors.
- feature components own user-facing fallbacks (toast, empty, retry state).
- log unexpected failures with `src/lib/logger.ts`.
- prefer explicit error states over silent failures.
- keep auth 401 handling consistent with `auth:unauthorized` flow.
