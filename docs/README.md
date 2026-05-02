# Frontend Architecture Rules

This directory contains the focused architecture and coding standards for the frontend.

# 1. Quick Reference


| Topic | File |
|-------|------|
| Core philosophy + structure | [README.md](./README.md) |
| Hard rules (Start Here) | [HARD-RULES.md](./HARD-RULES.md) |
| Styling + tokens | [STYLING.md](./STYLING.md) |
| API layer | [API-LAYER.md](./API-LAYER.md) |
| Data fetching | [DATA-FETCHING.md](./DATA-FETCHING.md) |
| Authentication | [AUTH.md](./AUTH.md) |
| State management | [STATE.md](./STATE.md) |
| Components | [COMPONENTS.md](./COMPONENTS.md) |
| Forms | [FORMS.md](./FORMS.md) |
| Internationalization | [I18N.md](./I18N.md) |
| Routing | [ROUTING.md](./ROUTING.md) |
| Error handling | [ERROR-HANDLING.md](./ERROR-HANDLING.md) |
| Permissions | [PERMISSIONS.md](./PERMISSIONS.md) |
| Performance | [PERFORMANCE.md](./PERFORMANCE.md) |
| TypeScript | [TYPESCRIPT.md](./TYPESCRIPT.md) |
| Config + constants | [CONFIG.md](./CONFIG.md) |
| Testing | [TESTING.md](./TESTING.md) |
| Security | [SECURITY.md](./SECURITY.md) |
| Build + CI | [BUILD.md](./BUILD.md) |



# 2. Tech Stack (FIXED — do not change)

| Concern          | Tool                          |
|------------------|-------------------------------|
| Framework        | Next.js 14+ (App Router)      |
| Language         | TypeScript (strict mode)      |
| Styling          | Tailwind CSS + shadcn/ui      |
| State Management | Zustand                       |
| Server Data      | React Server Components (RSC) |
| Client Data      | TanStack Query v5             |
| Auth             | Sanctum tokens + httpOnly cookies |
| HTTP Client      | Axios (typed instance)        |
| Forms            | React Hook Form + Zod         |
| Icons            | Lucide React                  |

---

# 3. Project Structure

```plaintext
src/
 ├── app/                        ← App Router (pages + layouts)
 │    ├── (auth)/                ← Auth group (login, etc.)
 │    │    ├── login/
 │    │    │    └── page.tsx
 │    │    └── layout.tsx
 │    ├── (admin)/               ← Admin group
 │    │    ├── stores/
 │    │    │    └── [store]/
 │    │    │         ├── dashboard/
 │    │    │         │    └── page.tsx
 │    │    │         ├── users/
 │    │    │         │    ├── page.tsx
 │    │    │         │    └── [user]/
 │    │    │         │         └── page.tsx
 │    │    │         ├── products/
 │    │    │         │    ├── page.tsx
 │    │    │         │    └── [product]/
 │    │    │         │         └── page.tsx
 │    │    │         ├── orders/
 │    │    │         │    ├── page.tsx
 │    │    │         │    └── [order]/
 │    │    │         │         └── page.tsx
 │    │    └── layout.tsx
 │    ├── layout.tsx             ← Root layout
 │    └── globals.css            ← CSS tokens live here
 │
 ├── components/
 │    ├── ui/                    ← shadcn/ui primitives (auto-generated)
 │    ├── common/                ← Shared across domains
 │    │    ├── DataTable/
 │    │    ├── PageHeader/
 │    │    ├── ConfirmDialog/
 │    │    └── StatusBadge/
 │    ├── admin/                 ← Domain-grouped admin components
 │    │    ├── users/
 │    │    ├── products/
 │    │    ├── orders/
 │    │    └── dashboard/
 │    └── layout/                ← Sidebar, Navbar, etc.
 │
 ├── lib/
 │    ├── api/                   ← Typed API layer
 │    │    ├── axios.ts          ← Axios instance
 │    │    ├── admin/
 │    │    │    ├── users.ts
 │    │    │    ├── products.ts
 │    │    │    ├── orders.ts
 │    │    │    └── dashboard.ts
 │    │    └── auth.ts
 │    ├── hooks/                 ← TanStack Query hooks
 │    │    ├── admin/
 │    │    │    ├── useUsers.ts
 │    │    │    ├── useProducts.ts
 │    │    │    ├── useOrders.ts
 │    │    │    └── useDashboard.ts
 │    │    └── useAuth.ts
 │    └── utils/                 ← Pure utility functions
 │
 ├── stores/                     ← Zustand stores
 │    ├── authStore.ts
 │    ├── storeStore.ts          ← Current active store context
 │    └── uiStore.ts             ← Sidebar state, modals, etc.
 │
 ├── types/                      ← Global TypeScript types
 │    ├── api.ts                 ← API response shapes
 │    ├── user.ts
 │    ├── product.ts
 │    ├── order.ts
 │    └── store.ts
 │
 └── middleware.ts               ← Auth protection middleware
```

---
