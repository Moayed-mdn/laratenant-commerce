# Dashboard Feature

- route: `/{locale}/stores/{storeId}/dashboard`
- page is server-rendered and fetches stats/recent orders/top products.
- display components are feature-local under dashboard `_components`.
- API access is tenant-scoped through dashboard routes in `API_ROUTES`.
