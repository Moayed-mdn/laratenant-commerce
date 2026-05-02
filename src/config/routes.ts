/**
 * Route configuration.
 * All routes are functions that return strings.
 * storeId param is always a string.
 */

export const ROUTES = {
  auth: {
    login: () => '/login' as const,
    logout: () => '/logout' as const,
  },
  store: (storeId: string) => ({
    dashboard: () => `/stores/${storeId}/dashboard` as const,
    users: {
      list: () => `/stores/${storeId}/users` as const,
      detail: (userId: string) => `/stores/${storeId}/users/${userId}` as const,
    },
    products: {
      list: () => `/stores/${storeId}/products` as const,
      new: () => `/stores/${storeId}/products/new` as const,
      edit: (productId: string) => `/stores/${storeId}/products/${productId}` as const,
    },
    orders: {
      list: () => `/stores/${storeId}/orders` as const,
      detail: (orderId: string) => `/stores/${storeId}/orders/${orderId}` as const,
    },
  }),
} as const;

export const API_ROUTES = {
  auth: {
    login: () => '/api/v1/users/auth/login' as const,
    logout: () => '/api/v1/logout' as const,
    me: () => '/api/v1/me' as const,
  },
  store: (storeId: string) => ({
    dashboard: {
      stats: () => `/api/v1/admin/stores/${storeId}/dashboard/stats` as const,
      recentOrders: () => `/api/v1/admin/stores/${storeId}/dashboard/recent-orders` as const,
      topProducts: () => `/api/v1/admin/stores/${storeId}/dashboard/top-products` as const,
    },
    users: {
      list: () => `/api/v1/admin/stores/${storeId}/users` as const,
      detail: (userId: string) => `/api/v1/admin/stores/${storeId}/users/${userId}` as const,
    },
    products: {
      list: () => `/api/v1/admin/stores/${storeId}/products` as const,
      detail: (productId: string) => `/api/v1/admin/stores/${storeId}/products/${productId}` as const,
    },
    orders: {
      list: () => `/api/v1/admin/stores/${storeId}/orders` as const,
      detail: (orderId: string) => `/api/v1/admin/stores/${storeId}/orders/${orderId}` as const,
    },
  }),
} as const;
