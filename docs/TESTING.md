# Frontend Testing

This document contains the testing strategy, tools, and critical flows.

---

# 31. Testing Strategy

## Scope (Minimal — implement when ready)

| Type | Tool | Target |
|------|------|--------|
| Unit | Vitest | Utils, helpers, store logic |
| Component | React Testing Library | Common components |
| E2E | Playwright | Critical user flows |

## Critical Flows to Test (E2E)

- Login and redirect to dashboard
- View users list with pagination
- Block and unblock a user
- Create a product
- Update order status

## Rules

- Utils MUST be unit tested
- No tests required for page components yet
- E2E tests cover happy paths only for now
- Test files live next to the file they test
