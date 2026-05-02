# F.4 Admin Layout - Complete

## Overview

This document describes the admin shell layout implementation for the multi-store e-commerce admin dashboard. The layout provides a responsive sidebar navigation, topbar with user controls, and mobile navigation overlay.

---

## Files Created/Modified

### 1. Core Layout Files

| File | Path | Exports | Purpose |
|------|------|---------|---------|
| `layout.tsx` | `src/app/[locale]/(admin)/layout.tsx` | default (AdminLayout) | Server component that fetches user, redirects if unauthenticated, renders AdminShell |
| `AuthInitializer.tsx` | `src/app/[locale]/(admin)/_components/AuthInitializer.tsx` | `AuthInitializer` | Client component that syncs server-fetched user to Zustand store |
| `AdminShell.tsx` | `src/app/[locale]/(admin)/_components/AdminShell.tsx` | `AdminShell` | Main layout shell composing sidebar, topbar, content area |

### 2. Sidebar Components

| File | Path | Exports | Purpose |
|------|------|---------|---------|
| `Sidebar.tsx` | `src/app/[locale]/(admin)/_components/sidebar/Sidebar.tsx` | `Sidebar` | Fixed-width navigation sidebar with collapse toggle |
| `SidebarNav.tsx` | `src/app/[locale]/(admin)/_components/sidebar/SidebarNav.tsx` | `SidebarNav` | Navigation list with permission-based filtering |
| `SidebarNavItem.tsx` | `src/app/[locale]/(admin)/_components/sidebar/SidebarNavItem.tsx` | `SidebarNavItem` | Individual nav item with active state styling |

### 3. Topbar Components

| File | Path | Exports | Purpose |
|------|------|---------|---------|
| `Topbar.tsx` | `src/app/[locale]/(admin)/_components/topbar/Topbar.tsx` | `Topbar` | Header bar with mobile toggle, theme/locale controls |
| `UserMenu.tsx` | `src/app/[locale]/(admin)/_components/topbar/UserMenu.tsx` | `UserMenu` | Dropdown with user info and logout |
| `ThemeToggle.tsx` | `src/app/[locale]/(admin)/_components/topbar/ThemeToggle.tsx` | `ThemeToggle` | Light/dark mode toggle |
| `LocaleToggle.tsx` | `src/app/[locale]/(admin)/_components/topbar/LocaleToggle.tsx` | `LocaleToggle` | English/Arabic language switcher |

### 4. Mobile Navigation

| File | Path | Exports | Purpose |
|------|------|---------|---------|
| `MobileNav.tsx` | `src/app/[locale]/(admin)/_components/MobileNav.tsx` | `MobileNav` | Mobile overlay navigation using Sheet component |

### 5. API & Hooks

| File | Path | Exports | Purpose |
|------|------|---------|---------|
| `stores.ts` | `src/lib/api/stores.ts` | `getStoreContext` | Placeholder for store context API (TODO: implement in F.5) |
| `useMe.ts` | `src/hooks/auth/useMe.ts` | `useMe` | Query hook for current user (client-side refetch) |
| `useLogout.ts` | `src/hooks/auth/useLogout.ts` | `useLogout`, `UseLogoutOptions` | Mutation hook for logout |

### 6. Translation Files (Updated)

| File | Path | Namespaces Added |
|------|------|------------------|
| `common.json` | `src/locales/en/common.json` | `nav`, `auth`, `theme`, `locale` |
| `common.json` | `src/locales/ar/common.json` | `nav`, `auth`, `theme`, `locale` |

### 7. Configuration Files (Updated)

| File | Change |
|------|--------|
| `src/app/globals.css` | Updated sidebar CSS variables to use shadcn-compatible naming (`--color-sidebar`, `--color-sidebar-foreground`, etc.) |
| `tailwind.config.ts` | Updated sidebar color mappings to match new CSS variable names |

---

## Architecture Decisions

### AuthInitializer: Bridging RSC to Client Store

The `AuthInitializer` component solves the problem of syncing server-fetched user data into the client-side Zustand store:

```tsx
// In layout.tsx (RSC):
const response = await serverFetch<ApiResponse<AdminUser>>(API_ROUTES.auth.me())
const user = response.data

return (
  <AuthInitializer user={user}>
    <AdminShell>{children}</AdminShell>
  </AuthInitializer>
)

// In AuthInitializer.tsx (Client):
useEffect(() => {
  setUser(user) // Sync to Zustand on mount
}, [user, setUser])
```

**Why this pattern?**
- RSC fetches user once on initial load (no waterfalls)
- Client components need user in Zustand for reactive UI
- Single source of truth: server fetches first, then syncs to client

### storeId Flow: URL Params Only

**Hard rule enforced:** `storeId` ALWAYS comes from URL params, NEVER from Zustand.

```tsx
// In every component that needs storeId:
const params = useParams()
const storeId = params.storeId as string
```

This ensures:
- No stale store state in global store
- URL is the source of truth
- Easy to reason about data flow

### Sidebar Collapse/Expand Mechanism

The sidebar uses Zustand state with CSS transitions:

```tsx
// State in uiStore
sidebarCollapsed: boolean

// CSS classes in Sidebar.tsx
className={cn(
  'transition-all duration-200',
  isCollapsed ? 'w-16' : 'w-60'
)}

// Toggle button
<Button onClick={toggleSidebar}>
  {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
</Button>
```

When collapsed:
- Width reduces from 240px (w-60) to 64px (w-16)
- Labels hide, icons remain centered
- Tooltip shows full label via `title` attribute

### Theme Toggle: Syncing Zustand to DOM

**Documented useEffect exception #2:**

```tsx
// In ThemeToggle.tsx
useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [theme])
```

**Reason:** Tailwind's `darkMode: 'class'` requires the `dark` class on `<html>` element. This useEffect syncs Zustand theme state to the DOM.

### Locale Toggle: Pathname Reconstruction

The locale toggle rebuilds the pathname with the new locale prefix:

```tsx
const handleToggle = () => {
  const newLocale = locale === 'en' ? 'ar' : 'en'
  setLocale(newLocale) // Updates direction in uiStore too
  
  // /en/stores/1/dashboard → /ar/stores/1/dashboard
  const newPathname = pathname.replace(`/${locale}/`, `/${newLocale}/`)
  router.push(newPathname)
}
```

This preserves the full route structure while switching locales.

---

## Token Classes Used

All components use token classes only — no hardcoded colors:

| Token Class | CSS Variable | Usage |
|-------------|--------------|-------|
| `bg-sidebar` | `--color-sidebar` | Sidebar background |
| `text-sidebar-foreground` | `--color-sidebar-foreground` | Sidebar text |
| `border-sidebar-border` | `--color-sidebar-border` | Sidebar borders |
| `bg-sidebar-accent` | `--color-sidebar-accent` | Active nav items |
| `text-sidebar-accent-foreground` | `--color-sidebar-accent-foreground` | Active nav text |
| `bg-background` | `--color-bg` | Main content background |
| `text-foreground` | `--color-foreground` | Main text color |
| `border-border` | `--color-border` | Standard borders |
| `text-muted-foreground` | `--color-muted` | Secondary text |

---

## useEffect Exceptions (Documented)

Two useEffect usages are explicitly allowed and documented:

### 1. AuthInitializer.tsx
```tsx
useEffect(() => {
  setUser(user)
}, [user, setUser])
```
**Reason:** Sync server-fetched user into client Zustand store on mount.

### 2. ThemeToggle.tsx
```tsx
useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [theme])
```
**Reason:** Sync Zustand theme state to DOM class for Tailwind dark mode.

---

## Permission-Based Navigation

Navigation items are filtered by user role using the `selectCan` selector:

```tsx
const navItems = [
  { label: t('dashboard'), href: ..., show: true },
  { label: t('users'), href: ..., show: can('canManageUsers') },
  { label: t('products'), href: ..., show: can('canManageProducts') },
  { label: t('orders'), href: ..., show: can('canManageOrders') },
]
```

Permissions are defined in `src/config/permissions.ts`:
- `store_admin`: All permissions except `canManageAllStores`
- `staff`: Products, Orders, Dashboard only
- `super_admin`: All permissions

---

## Active Route Detection

```tsx
// Dashboard uses exact match
const isActive = item.label === t('dashboard')
  ? pathname === item.href
  : pathname.startsWith(item.href)
```

This prevents dashboard from being "active" on all routes (since all routes start with `/stores/{id}`).

---

## Error Handling Flow

If the admin layout fails to fetch the user (401):

```tsx
try {
  const response = await serverFetch<ApiResponse<AdminUser>>(
    API_ROUTES.auth.me()
  )
  user = response.data
} catch (error) {
  logger.warn('Admin layout: unauthenticated, redirecting to login')
  redirect('/login')
}
```

The redirect happens at the server level — no client-side handling needed.

---

## What F.5 (Dashboard Page) Will Need

The dashboard page (`/stores/[storeId]/dashboard`) will need:

1. **Query hooks** for dashboard data:
   - `useDashboardStats(storeId)` — fetch stats from `API_ROUTES.store(storeId).dashboard.stats()`
   - `useRecentOrders(storeId)` — fetch recent orders
   - `useTopProducts(storeId)` — fetch top products

2. **Store context initialization**:
   - Call `getStoreContext(storeId)` or derive from stats response
   - Populate `useStoreStore` with store metadata (name, currency)

3. **Dashboard components**:
   - Stats cards (revenue, orders, customers, products)
   - Recent orders table
   - Top products chart/list

4. **Date formatting**:
   - Use `formatCurrency()` for monetary values
   - Use `formatDate()` or `formatRelative()` for timestamps

5. **Loading states**:
   - Use TanStack Query `isLoading`, `isFetching` states
   - Show skeleton loaders from `@/components/ui/skeleton`

---

## Testing Checklist

Before marking F.4 complete, verify:

- [ ] Unauthenticated user redirects to `/login`
- [ ] Authenticated user sees sidebar with correct nav items based on role
- [ ] Sidebar collapse/expand works smoothly
- [ ] Theme toggle applies dark/light mode correctly
- [ ] Locale toggle switches between English/Arabic with correct RTL layout
- [ ] Mobile nav overlay appears on small screens
- [ ] User menu shows correct initials and email
- [ ] Logout clears auth state and redirects to login
- [ ] No console.log statements (logger utility only)
- [ ] No hardcoded colors (token classes only)
- [ ] No hardcoded text (t() only)
- [ ] storeId comes from useParams(), not Zustand

---

## Next Steps (F.5)

1. Create dashboard stats query hook
2. Create dashboard page with stats cards
3. Implement store context loading
4. Add recent orders table
5. Add top products visualization
