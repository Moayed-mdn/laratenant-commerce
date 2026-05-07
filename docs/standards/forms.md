# Forms Standards

- use `react-hook-form` with `zodResolver`.
- schema source of truth lives in `src/schemas/*`.
- define default values explicitly and keep nullable fields consistent.
- put API mutations in hooks; keep form UI focused on inputs/UX.
- translate labels/errors through i18n namespaces, not hardcoded strings.
