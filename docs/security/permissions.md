# Permission Security

- frontend permission checks are UX controls, not security boundaries.
- authoritative authorization is enforced by Laravel API.
- permission matrix is centralized and role-based.
- sensitive mutations must assume backend may reject even if UI shows action.
