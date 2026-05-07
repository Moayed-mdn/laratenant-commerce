# Build Errors

- validate import paths and alias usage first (`@/` vs relative paths).
- ensure client hooks are not imported into server-only modules.
- verify `nuqs` parser APIs against installed version.
- check named vs default export mismatches before deeper debugging.
