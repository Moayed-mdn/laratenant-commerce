# Frontend Build

This document contains the ESLint, TypeScript strict, Prettier, CI rules, and corrected useEffect rule.

---

# 42. Build & Code Quality Rules

## TypeScript

Strict mode ON — zero tolerance for errors
`any` type is FORBIDDEN
All build must pass `tsc --noEmit` with zero errors

## ESLint

Required rules (`.eslintrc`):

```json
{
  "rules": {
    "no-console":               "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Prettier

Enforced formatting. No debates on style.

```json
{
  "semi":         true,
  "singleQuote":  true,
  "tabWidth":     2,
  "trailingComma": "all"
}
```

## Pre-commit Checks (via husky + lint-staged)

```text
TypeScript → zero errors
ESLint     → zero errors
Prettier   → auto-format
```

## CI Rules

- Build MUST pass before any merge
- TypeScript MUST have zero errors
- ESLint MUST have zero errors
- No `console.log` in committed code

---

# 43. Corrected Rule — useEffect

Replace the absolute rule from Section 14 with this:

## useEffect Rules

```text
useEffect is FORBIDDEN for:
- Data fetching (use RSC or TanStack Query)
- Derived state (use useMemo)
- Event handling (use event handlers directly)

useEffect is ALLOWED for:
- DOM subscriptions (resize, scroll observers)
- Third-party library initialization
- Cleanup on unmount
```
