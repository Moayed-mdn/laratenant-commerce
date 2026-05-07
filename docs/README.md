# Documentation System

This directory is the canonical documentation for the Next.js + Laravel multi-tenant admin dashboard.
The codebase is the source of truth. These docs describe what exists today.

## How To Use This

- Start with `architecture/` for system-level behavior and boundaries.
- Use `standards/` for implementation rules used in day-to-day work.
- Use `features/` for module-specific behavior and conventions.
- Use `security/` for session auth, Sanctum, and permission boundaries.
- Use `decisions/` for ADRs that explain why key patterns exist.
- Use `troubleshooting/` for recurring operational/debug issues.
- Use `migrations/` for historical changes that still matter.

## Structure

```text
docs/
├── README.md
├── architecture/
├── standards/
├── features/
├── security/
├── decisions/
├── troubleshooting/
├── migrations/
└── archive/
```

## Architectural Philosophy

- Locale-first App Router with tenant-scoped URLs (`/{locale}/stores/{storeId}/...`).
- Session/cookie auth with middleware route protection.
- Server Components for initial/detail reads; client hooks for interactive lists and mutations.
- Laravel is consumed through a strict API layer (`serverFetch` and `/api/proxy` bridge).
- Shared standards (types, forms, styling, routing, i18n, errors) must stay centralized.

## Contributor Rules

- Update canonical docs when architecture or standards change.
- Avoid adding one-off fix logs to top-level docs.
- Keep one source of truth per topic; link instead of duplicating.
- Put temporary incidents in `troubleshooting/` and completed migrations in `migrations/`.
- Move obsolete notes to `archive/` with short context, never as active guidance.
