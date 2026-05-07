# Orders Feature

- routes:
  - `/{locale}/stores/{storeId}/orders`
  - `/{locale}/stores/{storeId}/orders/{orderId}`
- list page is interactive client UI with URL-synced filters.
- detail page uses server-fetch pattern with mapped view models.
- status updates are permission-aware in UI and tenant-scoped in API routes.
