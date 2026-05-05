/**
 * Route configuration.
 * 
 * IMPORTANT RULE: ROUTES never include locale prefix.
 * next-intl router adds locale automatically.
 * These are used with next-intl's useRouter() and Link components.
 *
 * For hard redirects (redirect() from next/navigation in server components),
 * you must prepend the locale manually.
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
    csrfCookie: () => '/sanctum/csrf-cookie',
    login: () => '/api/v1/users/auth/login',
    logout: () => '/api/v1/users/auth/logout',
    me: () => '/api/v1/users/auth/me',
    register: () => '/api/v1/users/auth/register',
  },
  store: (storeId: string) => ({
    dashboard: () => ({
      stats: () =>
        `/api/v1/admin/stores/${storeId}/dashboard/stats`,
      recentOrders: () =>
        `/api/v1/admin/stores/${storeId}/dashboard/recent-orders`,
      topProducts: () =>
        `/api/v1/admin/stores/${storeId}/dashboard/top-products`,
    }),
    users: () => ({
      list: () =>
        `/api/v1/admin/stores/${storeId}/users`,
      detail: (userId: string) =>
        `/api/v1/admin/stores/${storeId}/users/${userId}`,
      block: (userId: string) =>
        `/api/v1/admin/stores/${storeId}/users/${userId}/block`,
      unblock: (userId: string) =>
        `/api/v1/admin/stores/${storeId}/users/${userId}/unblock`,
      restore: (userId: string) =>
        `/api/v1/admin/stores/${storeId}/users/${userId}/restore`,
    }),
    products: () => ({
      list: () =>
        `/api/v1/admin/stores/${storeId}/products`,
      detail: (productId: string) =>
        `/api/v1/admin/stores/${storeId}/products/${productId}`,
      restore: (productId: string) =>
        `/api/v1/admin/stores/${storeId}/products/${productId}/restore`,
    }),
    orders: () => ({
      list: () =>
        `/api/v1/admin/stores/${storeId}/orders`,
      detail: (orderId: string) =>
        `/api/v1/admin/stores/${storeId}/orders/${orderId}`,
      updateStatus: (orderId: string) =>
        `/api/v1/admin/stores/${storeId}/orders/${orderId}/status`,
      cancel: (orderId: string) =>
        `/api/v1/admin/stores/${storeId}/orders/${orderId}/cancel`,
      refund: (orderId: string) =>
        `/api/v1/admin/stores/${storeId}/orders/${orderId}/refund`,
    }),
  }),
} as const;
