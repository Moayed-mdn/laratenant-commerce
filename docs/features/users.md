# Users Feature

- routes:
  - `/{locale}/stores/{storeId}/users`
  - `/{locale}/stores/{storeId}/users/{userId}`
- list/search/pagination are client-driven with schema-validated URL state.
- detail uses server data mapping and permission-gated actions.
- role display and capability checks are integrated with permission matrix.
