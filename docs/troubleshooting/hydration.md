# Hydration Issues

- avoid nested document tags (`html`, `body`) inside route components.
- keep server/client component boundaries explicit (`'use client'` only where needed).
- avoid divergent render paths based on browser-only values before hydration.
- isolate browser APIs to effects and client-only components.
