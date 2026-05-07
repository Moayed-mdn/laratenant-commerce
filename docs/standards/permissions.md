# Permissions Standards

- role matrix is defined in `src/config/permissions.ts`.
- UI access checks use `useCan(permissionKey)`.
- hide/disable privileged actions in UI based on permissions.
- backend remains authority for final authorization decisions.
- do not hardcode role checks in multiple components.
