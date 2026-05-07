# Products Feature

- routes:
  - `/{locale}/stores/{storeId}/products`
  - `/{locale}/stores/{storeId}/products/new`
  - `/{locale}/stores/{storeId}/products/{productId}`
- list uses client filters/query hooks; detail/edit combines server fetch + client form.
- form architecture uses shared `ProductForm` with section subcomponents.
- validation uses product schemas from `src/schemas/products.ts`.
