/**
 * Query key factory.
 * Every query key in the app must use this.
 * No inline query key strings allowed anywhere.
 */

export const queryKeys = {
  auth: {
    all: () => ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },
  stores: {
    all: () => ['stores'] as const,
  },
  dashboard: (storeId: string) => ({
    all: () => ['dashboard', storeId] as const,
    stats: () => ['dashboard', storeId, 'stats'] as const,
    recentOrders: () => ['dashboard', storeId, 'recent-orders'] as const,
    topProducts: () => ['dashboard', storeId, 'top-products'] as const,
  }),
  users: (storeId: string) => ({
    all: () => ['users', storeId] as const,
    lists: () => ['users', storeId, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      ['users', storeId, 'list', filters] as const,
    detail: (userId: string) => ['users', storeId, 'detail', userId] as const,
  }),
  products: (storeId: string) => ({
    all: () => ['products', storeId] as const,
    lists: () => ['products', storeId, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      ['products', storeId, 'list', filters] as const,
    detail: (productId: string) =>
      ['products', storeId, 'detail', productId] as const,
  }),
  orders: (storeId: string) => ({
    all: () => ['orders', storeId] as const,
    lists: () => ['orders', storeId, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      ['orders', storeId, 'list', filters] as const,
    detail: (orderId: string) => ['orders', storeId, 'detail', orderId] as const,
  }),
} as const;
