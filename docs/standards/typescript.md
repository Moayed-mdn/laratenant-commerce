# TypeScript Standards

- strict typing is required for feature and shared modules.
- define API/raw types separately from UI/view types.
- map backend payloads in mapper layer before UI use.
- avoid `any`; use explicit unions and narrow typed helpers.
- keep route/query/config constants strongly typed (`as const` where useful).
