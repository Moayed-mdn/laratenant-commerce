# Data Flow

## Read Path

- Server components fetch initial/detail data via `serverFetch`.
- Response mapping happens in mapper layer before UI rendering.
- Client components receive already-shaped view data.

## Interactive Path

- Client tables/forms use TanStack Query hooks.
- URL state uses `nuqs` and schema-validated params.
- mutations are encapsulated in feature hooks (`hooks/*`).

## Error Path

- API wrappers throw normalized errors.
- components handle errors locally with fallback UI/toasts.
- no global route-level error boundary is currently enforced.
