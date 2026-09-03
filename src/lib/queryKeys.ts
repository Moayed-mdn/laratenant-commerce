/**
 * Centralized TanStack Query key factory.
 * All query keys must be defined here — never inline.
 */

export const queryKeys = {
  // ── MERCHANT ──────────────────────────────────────────────────
  merchant: {
    me: () => ['merchant', 'me'] as const,
    stores: () => ['merchant', 'stores'] as const,
    store: (storeSlug: string) => ({
      all:    () => ['merchant', 'store', storeSlug] as const,
      detail: () => ['merchant', 'store', storeSlug, 'detail'] as const,
      provisioning: () => ['merchant', 'store', storeSlug, 'provisioning'] as const,
    }),
  },

  // ── CUSTOMER ──────────────────────────────────────────────────
  customer: {
    me: () => ['customer', 'me'] as const,
  },

  // ── PLATFORM ──────────────────────────────────────────────────
  platform: {
    dashboard: () => ['platform', 'dashboard'] as const,
    subscriptions: {
      all:    () => ['platform', 'subscriptions'] as const,
      lists:  () => ['platform', 'subscriptions', 'list'] as const,
      list:   (filters: Record<string, unknown>) =>
        ['platform', 'subscriptions', 'list', filters] as const,
      detail: (id: number) =>
        ['platform', 'subscriptions', 'detail', id] as const,
    },
  },

  // ── STOREFRONT ────────────────────────────────────────────────
  storefront: {
    runtime: {
      resolve:    (path: string) => ['storefront', 'runtime', 'resolve', path] as const,
      page:       (pageId: string) => ['storefront', 'runtime', 'page', pageId] as const,
      navigation: () => ['storefront', 'runtime', 'navigation'] as const,
      theme:      () => ['storefront', 'runtime', 'theme'] as const,
    },
    store: (storeSlug: string) => ({
      products: () => ['storefront', 'store', storeSlug, 'products'] as const,
      cart:     () => ['storefront', 'store', storeSlug, 'cart'] as const,
    }),
  },

  // ── PRODUCTS ──────────────────────────────────────────────────
  products: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'products'] as const,
    lists:  () => ['merchant', storeSlug, 'products', 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['merchant', storeSlug, 'products', 'list', filters] as const,
    detail: (productId: string) =>
      ['merchant', storeSlug, 'products', 'detail', productId] as const,
  }),

  // ── CATEGORIES ────────────────────────────────────────────────
  categories: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'categories'] as const,
    lists:  () => ['merchant', storeSlug, 'categories', 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['merchant', storeSlug, 'categories', 'list', filters] as const,
    detail: (categoryId: string) =>
      ['merchant', storeSlug, 'categories', 'detail', categoryId] as const,
  }),

  // ── BRANDS ────────────────────────────────────────────────────
  brands: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'brands'] as const,
    lists:  () => ['merchant', storeSlug, 'brands', 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['merchant', storeSlug, 'brands', 'list', filters] as const,
    detail: (brandId: string) =>
      ['merchant', storeSlug, 'brands', 'detail', brandId] as const,
  }),

  // ── TAGS ────────────────────────────────────────────────────
  tags: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'tags'] as const,
    lists:  () => ['merchant', storeSlug, 'tags', 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['merchant', storeSlug, 'tags', 'list', filters] as const,
    detail: (tagId: string) =>
      ['merchant', storeSlug, 'tags', 'detail', tagId] as const,
  }),

  // ── ORDERS ────────────────────────────────────────────────────
  orders: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'orders'] as const,
    lists:  () => ['merchant', storeSlug, 'orders', 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['merchant', storeSlug, 'orders', 'list', filters] as const,
    detail: (orderId: string) =>
      ['merchant', storeSlug, 'orders', 'detail', orderId] as const,
  }),

  // ── USERS ─────────────────────────────────────────────────────
  users: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'users'] as const,
    lists:  () => ['merchant', storeSlug, 'users', 'list'] as const,
    list:   (filters: Record<string, unknown>) =>
      ['merchant', storeSlug, 'users', 'list', filters] as const,
    detail: (userId: string) =>
      ['merchant', storeSlug, 'users', 'detail', userId] as const,
  }),

  // ── CMS PAGES ─────────────────────────────────────────────────
  cmsPages: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'cms-pages'] as const,
    lists:  () => ['merchant', storeSlug, 'cms-pages', 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['merchant', storeSlug, 'cms-pages', 'list', filters] as const,
    detail: (pageId: string) =>
      ['merchant', storeSlug, 'cms-pages', 'detail', pageId] as const,
  }),

  // ── CMS SECTION TYPES ─────────────────────────────────────────
  marketingSectionTypes: (storeSlug: string) => ({
    all: () => ['merchant', storeSlug, 'marketing-section-types'] as const,
  }),

  // ── DASHBOARD ─────────────────────────────────────────────────
  dashboard: (storeSlug: string) => ({
    stats:        () => ['merchant', storeSlug, 'dashboard', 'stats'] as const,
    recentOrders: () => ['merchant', storeSlug, 'dashboard', 'recent-orders'] as const,
    topProducts:  () => ['merchant', storeSlug, 'dashboard', 'top-products'] as const,
  }),

  // ── NAVIGATION ────────────────────────────────────────────────
  navigation: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'navigation'] as const,
    lists:  () => ['merchant', storeSlug, 'navigation', 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['merchant', storeSlug, 'navigation', 'list', filters] as const,
    detail: (menuId: string) =>
      ['merchant', storeSlug, 'navigation', 'detail', menuId] as const,
  }),

  // ── ASSETS ────────────────────────────────────────────────────
  assets: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'assets'] as const,
    lists:  () => ['merchant', storeSlug, 'assets', 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['merchant', storeSlug, 'assets', 'list', filters] as const,
  }),

  // ── THEMES ────────────────────────────────────────────────────
  themes: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'themes'] as const,
    lists:  () => ['merchant', storeSlug, 'themes', 'list'] as const,
    list:   (filters: Record<string, unknown> = {}) =>
      ['merchant', storeSlug, 'themes', 'list', filters] as const,
    detail: (themeSlug: string) =>
      ['merchant', storeSlug, 'themes', 'detail', themeSlug] as const,
  }),

  // ── PAGE TEMPLATES ────────────────────────────────────────────
  pageTemplates: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'page-templates'] as const,
    lists:  () => ['merchant', storeSlug, 'page-templates', 'list'] as const,
    list:   () => ['merchant', storeSlug, 'page-templates', 'list'] as const,
    detail: (templateId: string) =>
      ['merchant', storeSlug, 'page-templates', 'detail', templateId] as const,
  }),

  // ── SYSTEM TEMPLATES ──────────────────────────────────────────
  systemTemplates: (storeSlug: string, themeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'system-templates', themeSlug] as const,
    lists:  () => ['merchant', storeSlug, 'system-templates', themeSlug, 'list'] as const,
    list:   () => ['merchant', storeSlug, 'system-templates', themeSlug, 'list'] as const,
    detail: (templateId: string) =>
      ['merchant', storeSlug, 'system-templates', themeSlug, 'detail', templateId] as const,
  }),

  // ── BLOCK INSTANCES ────────────────────────────────────────────
  blockInstances: (storeSlug: string, themeSlug: string, sectionId: string) => ({
    all:    () => ['merchant', storeSlug, 'block-instances', themeSlug, sectionId] as const,
    list:   () => ['merchant', storeSlug, 'block-instances', themeSlug, sectionId, 'list'] as const,
    detail: (blockInstanceId: string) =>
      ['merchant', storeSlug, 'block-instances', themeSlug, sectionId, 'detail', blockInstanceId] as const,
  }),

  // ── SECTION GROUPS ────────────────────────────────────────────
  sectionGroups: (storeSlug: string, themeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'section-groups', themeSlug] as const,
    list:   () => ['merchant', storeSlug, 'section-groups', themeSlug, 'list'] as const,
    detail: (groupId: string) =>
      ['merchant', storeSlug, 'section-groups', themeSlug, 'detail', groupId] as const,
  }),

  // ── SECTION SCHEMAS ───────────────────────────────────────────
  sectionSchemas: (storeSlug: string) => ({
    all: () => ['merchant', storeSlug, 'section-schemas'] as const,
  }),

  // ── SHIPPING ──────────────────────────────────────────────────
  shipping: {
    methods: (storeSlug: string) => ({
      all:    () => ['merchant', storeSlug, 'shipping', 'methods'] as const,
      lists:  () => ['merchant', storeSlug, 'shipping', 'methods', 'list'] as const,
      detail: (methodId: string) => ['merchant', storeSlug, 'shipping', 'methods', 'detail', methodId] as const,
    }),
    zones: (storeSlug: string) => ({
      all:    () => ['merchant', storeSlug, 'shipping', 'zones'] as const,
      lists:  () => ['merchant', storeSlug, 'shipping', 'zones', 'list'] as const,
      detail: (zoneId: string) => ['merchant', storeSlug, 'shipping', 'zones', 'detail', zoneId] as const,
    }),
    addressSettings: (storeSlug: string) => ({
      all: () => ['merchant', storeSlug, 'shipping', 'address-settings'] as const,
      detail: () => ['merchant', storeSlug, 'shipping', 'address-settings', 'detail'] as const,
    }),
  },

  // ── STRIPE CONNECT ────────────────────────────────────────────
  stripeConnect: (storeSlug: string) => ({
    all:    () => ['merchant', storeSlug, 'stripe-connect'] as const,
    status: () => ['merchant', storeSlug, 'stripe-connect', 'status'] as const,
  }),

  // ── BILLING ───────────────────────────────────────────────────
  billing: {
    all:          () => ['billing'] as const,
    plans:        () => ['billing', 'plans'] as const,
    subscription: () => ['billing', 'subscription'] as const,
    invoices:     (filters: Record<string, unknown> = {}) =>
      ['billing', 'invoices', 'list', filters] as const,
    invoice:      (invoiceId: number) =>
      ['billing', 'invoices', 'detail', invoiceId] as const,
    entitlements: (storeSlug: string) =>
      ['billing', 'entitlements', storeSlug] as const,
  },

  // ── NOTIFICATIONS ─────────────────────────────────────────────
  // Not store-scoped: a merchant user's notifications and device tokens
  // span all stores they belong to, mirroring the backend's
  // /api/v1/merchant/notifications/* routes.
  notifications: {
    all:         () => ['notifications'] as const,
    lists:       () => ['notifications', 'list'] as const,
    list:        (filters: Record<string, unknown> = {}) =>
      ['notifications', 'list', filters] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },
};

/** @deprecated Use queryKeys.merchant.me() */
export const authKeys = {
  me: queryKeys.merchant.me,
};
