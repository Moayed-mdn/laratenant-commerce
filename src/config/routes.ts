/**
 * Route configuration.
 * All routes are functions that return strings.
 * storeId param is always a string.
 * locale param must be included for all client-side navigation.
 *
 * IMPORTANT: All client-side links must include the locale prefix
 * to support multilingual routing (e.g., /en/stores/1/dashboard or /ar/stores/1/dashboard)
 *
 * Example usage:
 *   import { useLocale } from 'next-intl';
 *   const locale = useLocale();
 *   href={ROUTES.store(locale, storeId).dashboard()}
 */

export const ROUTES = {
  auth: {
    login: (locale: string) => `/${locale}/login` as const,
    logout: (locale: string) => `/${locale}/logout` as const,
  },
  store: (locale: string, storeId: string) => ({
    dashboard: () => `/${locale}/stores/${storeId}/dashboard` as const,
    users: {
      list: () => `/${locale}/stores/${storeId}/users` as const,
      detail: (userId: string) => `/${locale}/stores/${storeId}/users/${userId}` as const,
    },
    products: {
      list: () => `/${locale}/stores/${storeId}/products` as const,
      new: () => `/${locale}/stores/${storeId}/products/new` as const,
      edit: (productId: string) => `/${locale}/stores/${storeId}/products/${productId}` as const,
    },
    orders: {
      list: () => `/${locale}/stores/${storeId}/orders` as const,
      detail: (orderId: string) => `/${locale}/stores/${storeId}/orders/${orderId}` as const,
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
