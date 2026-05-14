/**
 * Centralized TanStack Query key factory.
 * All query keys must be defined here — never inline.
 */

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────
  me: () => ['me'] as const,

  auth: {
    me: () => ['me'] as const,
  },

  // ── Products ──────────────────────────────────────────────────
  products: (storeId: string) => ({
    all:    () => ['products', storeId] as const,
    lists:  () => ['products', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['products', storeId, 'list', filters] as const,
    detail: (productId: string) =>
      ['products', storeId, 'detail', productId] as const,
  }),

  // ── Categories ────────────────────────────────────────────────
  categories: (storeId: string) => ({
    all:    () => ['categories', storeId] as const,
    lists:  () => ['categories', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['categories', storeId, 'list', filters] as const,
    detail: (categoryId: string) =>
      ['categories', storeId, 'detail', categoryId] as const,
  }),

  // ── Brands ────────────────────────────────────────────────────
  brands: (storeId: string) => ({
    all:    () => ['brands', storeId] as const,
    lists:  () => ['brands', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['brands', storeId, 'list', filters] as const,
    detail: (brandId: string) =>
      ['brands', storeId, 'detail', brandId] as const,
  }),

  // ── Tags ────────────────────────────────────────────────────
  tags: (storeId: string) => ({
    all:    () => ['tags', storeId] as const,
    lists:  () => ['tags', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['tags', storeId, 'list', filters] as const,
    detail: (tagId: string) =>
      ['tags', storeId, 'detail', tagId] as const,
  }),

  // ── Orders ────────────────────────────────────────────────────
  orders: (storeId: string) => ({
    all:    () => ['orders', storeId] as const,
    lists:  () => ['orders', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['orders', storeId, 'list', filters] as const,
    detail: (orderId: string) =>
      ['orders', storeId, 'detail', orderId] as const,
  }),

  // ── Users ─────────────────────────────────────────────────────
  users: (storeId: string) => ({
    all:    () => ['users', storeId] as const,
    lists:  () => ['users', storeId, 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['users', storeId, 'list', filters] as const,
    detail: (userId: string) =>
      ['users', storeId, 'detail', userId] as const,
  }),

  // ── Dashboard ─────────────────────────────────────────────────
  dashboard: (storeId: string) => ({
    stats:        () => ['dashboard', storeId, 'stats'] as const,
    recentOrders: () => ['dashboard', storeId, 'recent-orders'] as const,
    topProducts:  () => ['dashboard', storeId, 'top-products'] as const,
  }),
};