# Migration: App Router Conventions

## Outcome

Documentation now uses App Router terminology and locale-first route structure only.

## Key Conventions

- route shape: `/{locale}/...`
- admin scope: `(dashboard)` route group under locale segment
- tenant scope: `stores/[storeId]`
- page wrappers stay thin; `_components/*Content` hold behavior

## Deprecated Guidance

Any references to legacy route trees, non-locale-first paths, or obsolete middleware filenames are non-canonical.
