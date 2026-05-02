# Frontend State Management

This document contains the Zustand stores, store context rule, and no derived state duplication rules.

---

# 8. Zustand Stores

Three stores only:

| Store | Purpose |
|-------|---------|
| `authStore` | Current user, permissions, logout |
| `storeStore` | Currently selected store context |
| `uiStore` | Sidebar open/close, active modals |

## Rules

- Zustand stores are client-side only
- No API calls inside Zustand stores
- No business logic inside Zustand stores
- Stores hold UI state and session state only
- Use `persist` middleware for auth and store context

---

# 16. Store Context Rule

Every admin page lives under `/stores/[store]/`.
The `[store]` param is the store ID.
It MUST be passed to every API call.
It MUST be stored in `storeStore` (Zustand).
It MUST never be hardcoded.

```tsx
// Always read store from params or Zustand
const { storeId } = useStoreStore();
```

---

# 55. No Derived State Duplication

## Rule

Derived data MUST NOT be stored in state.
State duplication causes sync bugs.

## ❌ Forbidden

```ts
const [users, setUsers] = useState(data?.data ?? []);
const [total, setTotal] = useState(data?.meta.total ?? 0);

// Now you have two sources of truth — data and state
```

## ✅ Required

```ts
// Derive directly from source
const users = data?.data ?? [];
const total = data?.meta.total ?? 0;

// For expensive derivations
const activeUsers = useMemo(
  () => users.filter((u) => u.isActive),
  [users],
);
```

## Rules

- Never copy API response data into local state
- Never copy props into local state
- Use `useMemo` for expensive derived values
- Use direct derivation for simple values
- State is for user interaction only
  (form input, toggle open/closed, etc.)
