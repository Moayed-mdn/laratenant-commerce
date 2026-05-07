# Fetching Standards

- use Server Components + `serverFetch` for initial and detail reads.
- use TanStack Query hooks for interactive lists, filters, and mutations.
- parse URL query state with schemas and keep URL as source of truth.
- debounce text filters before query execution when needed.
- keep query keys stable and parameterized by locale/tenant/filter context.
