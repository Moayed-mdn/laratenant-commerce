# State Management Standards

## Server State

- TanStack Query is the only client server-state cache.
- query keys are centralized via `src/lib/queryKeys.ts`.

## Client App State

- Zustand stores hold UI/session metadata (`authStore`, `uiStore`, `storeStore`).
- route params remain source of truth for `storeId`.

## Rules

- do not duplicate derived values across multiple stores.
- do not use Zustand for data that should live in URL params.
