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
  marketing: {
    home: () => '/' as const,
    pricing: () => '/pricing' as const,
    features: () => '/features' as const,
  },
  dashboard: {
    home: () => '/dashboard' as const,
  },
  auth: {
    login:  () => '/login' as const,
    logout: () => '/logout' as const,
    signup: () => '/signup' as const,
  },
  account: {
    profile: () => '/account/profile' as const,
  },
  /**
   * Canonical merchant setup route.
   * All onboarding steps are rendered inside /setup as an internal state machine.
   */
  setup: () => '/setup' as const,
  /**
   * PLATFORM ADMIN ROUTES.
   * For super admin / platform-level operations.
   */
  platform: {
    dashboard: () => '/platform/dashboard' as const,
    billing: {
      subscriptions: {
        list: () => '/platform/billing/subscriptions' as const,
        detail: (id: number) => `/platform/billing/subscriptions/${id}` as const,
      },
    },
  },
  /**
   * CANONICAL MERCHANT WORKSPACE ROUTES.
   *
   * IMPORTANT RULE:
   * Merchant-facing UI MUST link to /merchant/* routes ONLY.
   */
  merchant: {
    dashboard:  () => '/merchant/dashboard' as const,
    orders: {
      list: () => '/merchant/orders' as const,
      detail: (orderId: string) => `/merchant/orders/${orderId}` as const,
    },
    products: {
      list: () => '/merchant/products' as const,
      new:  () => '/merchant/products/new' as const,
      edit: (productId: string) => `/merchant/products/${productId}/edit` as const,
    },
    categories: {
      list: () => '/merchant/categories' as const,
      new:  () => '/merchant/categories/new' as const,
      edit: (categoryId: string) => `/merchant/categories/${categoryId}/edit` as const,
    },
    brands: {
      list: () => '/merchant/brands' as const,
      new:  () => '/merchant/brands/new' as const,
      edit: (brandId: string) => `/merchant/brands/${brandId}/edit` as const,
    },
    tags: {
      list: () => '/merchant/tags' as const,
      new:  () => '/merchant/tags/new' as const,
      edit: (tagId: string) => `/merchant/tags/${tagId}/edit` as const,
    },
    templates: {
      list:   () => '/merchant/templates' as const,
      create: () => '/merchant/templates/create' as const,
      edit:   (templateId: string) => `/merchant/templates/${templateId}/edit` as const,
    },
    theme: {
      overview: () => '/merchant/theme' as const,
      assets: {
        list: () => '/merchant/theme/assets' as const,
      },
      settings: (themeIdentifier: string) => `/merchant/themes/${themeIdentifier}/settings` as const,
      systemTemplates: {
          list: (themeIdentifier: string) => `/merchant/themes/${themeIdentifier}/system-templates`,
          edit: (themeIdentifier: string, templateId: string) =>
            `/merchant/themes/${themeIdentifier}/system-templates/${templateId}`,
        },
        sectionGroups: {
          list: (themeIdentifier: string) => `/merchant/themes/${themeIdentifier}/section-groups`,
          edit: (themeIdentifier: string, groupId: string) =>
            `/merchant/themes/${themeIdentifier}/section-groups/${groupId}`,
        },
        // Backward compatibility aliases
        sectionGroupManager: (themeIdentifier: string) => `/merchant/themes/${themeIdentifier}/section-groups`,
        sectionGroupEditor: (themeIdentifier: string, groupId: string) =>
          `/merchant/themes/${themeIdentifier}/section-groups/${groupId}`,
    },
    navigation: {
      list: () => '/merchant/navigation' as const,
      edit: (menuId: string) => `/merchant/navigation/${menuId}` as const,
    },
    customers: {
      list: () => '/merchant/customers' as const,
      detail: (customerId: string) => `/merchant/customers/${customerId}` as const,
    },
    cmsPages:   () => '/merchant/cms/pages' as const,
    stores: {
      list:     () => '/merchant/stores' as const,
      create:   () => '/merchant/stores/create' as const,
      settings: (storeSlug: string) => `/merchant/stores/${storeSlug}/settings` as const,
    },
    billing: {
      dashboard: () => '/merchant/billing' as const,
      plans:     () => '/merchant/billing/plans' as const,
      invoices: {
        list:   () => '/merchant/billing/invoices' as const,
        detail: (invoiceId: string) => `/merchant/billing/invoices/${invoiceId}` as const,
      },
      trial: {
        start:  () => '/merchant/billing/trial/start' as const,
      },
    },
    settings:   () => '/merchant/settings' as const,
    shipping:   () => '/merchant/shipping' as const,
    /**
     * Stripe Connect return-trip pages. These exact paths (no locale prefix,
     * no store slug segment) are hardcoded on the backend as the Stripe
     * AccountLink refresh_url/return_url — see
     * app/Actions/Store/OnboardMerchantToStripeAction.php on laratenant-backend.
     * Do not rename without updating STRIPE_CONNECT_RETURN_BASE_URL usage there.
     * Store context on return is resolved from bootstrapStore, not the URL.
     */
    stripeConnect: {
      onboard: () => '/merchant/settings/payments/stripe/onboard' as const,
      success: () => '/merchant/settings/payments/stripe/success' as const,
    },
  },
} as const;

export const API_ROUTES = {
  // ── AUTH & IDENTITY ──────────────────────────────────────────
  // Shared identity endpoints
  csrfCookie: () => '/sanctum/csrf-cookie',

  // ── MERCHANT CONTEXT ──────────────────────────────────────────
  merchant: {
    auth: {
      login:              () => '/api/v1/merchant/auth/login',
      logout:             () => '/api/v1/merchant/auth/logout',
      register:           () => '/api/v1/merchant/auth/register',
      me:                 () => '/api/v1/merchant/me',
      activeStore:        () => '/api/v1/merchant/auth/active-store',
      forgotPassword:     () => '/api/v1/merchant/auth/password/forgot',
      resetPassword:      () => '/api/v1/merchant/auth/password/reset',
      resendVerification: () => '/api/v1/merchant/auth/email/resend',
      emailStatus:        () => '/api/v1/merchant/auth/email/status',
      verifyEmail: (id: string, hash: string) =>
        `/api/v1/merchant/auth/email/verify/${id}/${hash}`,
    },
    stores: {
      list:               () => '/api/v1/merchant/stores',
      create:             () => '/api/v1/merchant/stores',
      detail: (storeSlug: string) => `/api/v1/merchant/stores/${storeSlug}`,
      update: (storeSlug: string) => `/api/v1/merchant/stores/${storeSlug}`,
      slugCheck: (slug: string) => `/api/v1/merchant/stores/slug-check?slug=${slug}`,
      provisioningStatus: (storeSlug: string) =>
        `/api/v1/merchant/stores/${storeSlug}/provisioning-status`,
    },
    notifications: {
      list:             () => '/api/v1/merchant/notifications',
      unreadCount:      () => '/api/v1/merchant/notifications/unread-count',
      markAsRead: (notificationId: string) =>
        `/api/v1/merchant/notifications/${notificationId}/read`,
      markAllAsRead:    () => '/api/v1/merchant/notifications/read-all',
      deviceTokens: {
        register:       () => '/api/v1/merchant/notifications/device-tokens',
        remove: (token: string) =>
          `/api/v1/merchant/notifications/device-tokens/${encodeURIComponent(token)}`,
      },
    },
  },

  // ── CUSTOMER CONTEXT ──────────────────────────────────────────
  customer: {
    bootstrap:            () => '/api/v1/customer/bootstrap',
    me:                   () => '/api/v1/customer/me',
    auth: {
      login:              () => '/api/v1/customer/auth/login',
      logout:             () => '/api/v1/customer/auth/logout',
      register:           () => '/api/v1/customer/auth/register',
    },
  },

  // ── PLATFORM CONTEXT ──────────────────────────────────────────
  platform: {
    dashboard:            () => '/api/v1/platform/dashboard',
    analytics:            () => '/api/v1/platform/analytics',
    stores:               () => '/api/v1/platform/stores',
    users:                () => '/api/v1/platform/users',
    billing: {
      subscriptions: {
        list: () => '/api/v1/platform/billing/subscriptions',
        detail: (id: number) => `/api/v1/platform/billing/subscriptions/${id}`,
      },
      plans: {
        list: () => '/api/v1/platform/billing/plans',
      },
    },
  },

  // ── STOREFRONT CONTEXT ────────────────────────────────────────
  storefront: {
    stores: (storeSlug: string) => ({
      products:           () => `/api/v1/storefront/stores/${storeSlug}/products`,
      cart:               () => `/api/v1/storefront/stores/${storeSlug}/cart`,
      checkout:           () => `/api/v1/storefront/stores/${storeSlug}/checkout`,
    }),
  },

  // ── PUBLIC CMS ───────────────────────────────────────────────
  public: {
    cms: {
      pages: (slug: string) => `/api/v1/public/cms/pages/${slug}`,
      blog:                 () => '/api/v1/public/cms/blog',
      blogPost: (slug: string) => `/api/v1/public/cms/blog/${slug}`,
      docs: (slugPath: string) => `/api/v1/public/cms/docs/${slugPath}`,
      docsSidebar:          () => '/api/v1/public/cms/docs/sidebar',
      sitemap: (domain: string) => `/api/v1/public/cms/seo/sitemap/${domain}`,
      robots:               () => '/api/v1/public/cms/seo/robots.txt',
    },
  },

  // ── MERCHANT OPERATIONAL (STORE-SCOPED) ───────────────────────
  // These are for the merchant dashboard operating WITHIN a store context
  store: (storeSlug: string) => ({
    dashboard: () => ({
      stats:        () => `/api/v1/merchant/stores/${storeSlug}/dashboard/stats`,
      recentOrders: () => `/api/v1/merchant/stores/${storeSlug}/dashboard/recent-orders`,
      topProducts:  () => `/api/v1/merchant/stores/${storeSlug}/dashboard/top-products`,
    }),
    products: () => ({
      list:    () => `/api/v1/merchant/stores/${storeSlug}/products`,
      detail:  (productId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/products/${productId}`,
      restore: (productId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/products/${productId}/restore`,
    }),
    orders: () => ({
      list:         () => `/api/v1/merchant/stores/${storeSlug}/orders`,
      detail:       (orderId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/orders/${orderId}`,
      updateStatus: (orderId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/orders/${orderId}/status`,
    }),
    categories: () => ({
      list:    () => `/api/v1/merchant/stores/${storeSlug}/categories`,
      detail:  (categoryId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/categories/${categoryId}`,
      create:  () => `/api/v1/merchant/stores/${storeSlug}/categories`,
      update:  (categoryId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/categories/${categoryId}`,
      delete:  (categoryId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/categories/${categoryId}`,
      restore: (categoryId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/categories/${categoryId}/restore`,
    }),
    brands: () => ({
      list:    () => `/api/v1/merchant/stores/${storeSlug}/brands`,
      detail:  (brandId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/brands/${brandId}`,
      create:  () => `/api/v1/merchant/stores/${storeSlug}/brands`,
      update:  (brandId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/brands/${brandId}`,
      delete:  (brandId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/brands/${brandId}`,
      restore: (brandId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/brands/${brandId}/restore`,
    }),
    tags: () => ({
      list:    () => `/api/v1/merchant/stores/${storeSlug}/tags`,
      detail:  (tagId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/tags/${tagId}`,
      create:  () => `/api/v1/merchant/stores/${storeSlug}/tags`,
      update:  (tagId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/tags/${tagId}`,
      delete:  (tagId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/tags/${tagId}`,
    }),
    navigation: () => ({
      list:    () => `/api/v1/merchant/stores/${storeSlug}/navigation`,
      detail:  (menuId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/navigation/${menuId}`,
      create:  () => `/api/v1/merchant/stores/${storeSlug}/navigation`,
      update:  (menuId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/navigation/${menuId}`,
      delete:  (menuId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/navigation/${menuId}`,
      items: (menuId: string) => ({
        create: () =>
          `/api/v1/merchant/stores/${storeSlug}/navigation/${menuId}/items`,
        update: (itemId: string) =>
          `/api/v1/merchant/stores/${storeSlug}/navigation/${menuId}/items/${itemId}`,
        delete: (itemId: string) =>
          `/api/v1/merchant/stores/${storeSlug}/navigation/${menuId}/items/${itemId}`,
        reorder: () =>
          `/api/v1/merchant/stores/${storeSlug}/navigation/${menuId}/items/reorder`,
      }),
    }),
    assets: () => ({
      list:   () => `/api/v1/merchant/stores/${storeSlug}/assets`,
      upload: () => `/api/v1/merchant/stores/${storeSlug}/assets`,
      update: (assetId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/assets/${assetId}`,
      delete: (assetId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/assets/${assetId}`,
    }),
    themes: () => ({
      list:   () => `/api/v1/merchant/stores/${storeSlug}/themes`,
      detail: (themeSlug: string) =>
        `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}`,
      create: () => `/api/v1/merchant/stores/${storeSlug}/themes`,
      update: (themeSlug: string) =>
        `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}`,
      delete: (themeSlug: string) =>
        `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}`,
      publish: (themeSlug: string) =>
        `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/publish`,
      duplicate: (themeSlug: string) =>
        `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/duplicate`,
      updateSettings: (themeSlug: string) =>
        `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/settings`,
      systemTemplates: {
        list: (themeSlug: string) =>
          `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/system-templates`,
        detail: (themeSlug: string, templateId: string) =>
          `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/system-templates/${templateId}`,
        update: (themeSlug: string, templateId: string) =>
          `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/system-templates/${templateId}`,
      },
      sections: (themeSlug: string) => ({
        blocks: (sectionId: string) => ({
          list: () =>
            `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/sections/${sectionId}/blocks`,
          update: (blockId: string) =>
            `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/sections/${sectionId}/blocks/${blockId}`,
        }),
        blockInstances: (sectionId: string) => ({
          list: () =>
            `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/sections/${sectionId}/block-instances`,
          create: () =>
            `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/sections/${sectionId}/block-instances`,
          detail: (blockInstanceId: string) =>
            `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/sections/${sectionId}/block-instances/${blockInstanceId}`,
          update: (blockInstanceId: string) =>
            `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/sections/${sectionId}/block-instances/${blockInstanceId}`,
          delete: (blockInstanceId: string) =>
            `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/sections/${sectionId}/block-instances/${blockInstanceId}`,
          reorder: () =>
            `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/sections/${sectionId}/block-instances/reorder`,
        }),
      }),
      sectionGroups: {
        list: (themeSlug: string) =>
          `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/section-groups`,
        detail: (themeSlug: string, groupId: string) =>
          `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/section-groups/${groupId}`,
        update: (themeSlug: string, groupId: string) =>
          `/api/v1/merchant/stores/${storeSlug}/themes/${themeSlug}/section-groups/${groupId}`,
      },
    }),
    templates: () => ({
      list:      () => `/api/v1/merchant/stores/${storeSlug}/templates`,
      detail:    (templateId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/templates/${templateId}`,
      create:    () => `/api/v1/merchant/stores/${storeSlug}/templates`,
      update:    (templateId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/templates/${templateId}`,
      delete:    (templateId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/templates/${templateId}`,
      duplicate: (templateId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/templates/${templateId}/duplicate`,
    }),
    users: () => ({
      list:   () => `/api/v1/merchant/stores/${storeSlug}/users`,
      create: () => `/api/v1/merchant/stores/${storeSlug}/users`,
      detail: (userId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/users/${userId}`,
    }),
    cmsPages: () => ({
      list:      () => `/api/v1/merchant/stores/${storeSlug}/cms/pages`,
      detail:    (pageId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/cms/pages/${pageId}`,
      create:    () => `/api/v1/merchant/stores/${storeSlug}/cms/pages`,
      update:    (pageId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/cms/pages/${pageId}`,
      delete:    (pageId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/cms/pages/${pageId}`,
      publish:   (pageId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/cms/pages/${pageId}/publish`,
      unpublish: (pageId: string) =>
        `/api/v1/merchant/stores/${storeSlug}/cms/pages/${pageId}/unpublish`,
    }),
    sectionTypes: () => `/api/v1/merchant/stores/${storeSlug}/cms/section-types`,
    sectionSchemas: () => `/api/v1/merchant/stores/${storeSlug}/section-schemas`,
    shipping: () => ({
      addressSettings: {
        get: () => `/api/v1/merchant/stores/${storeSlug}/shipping/address-settings`,
        update: () => `/api/v1/merchant/stores/${storeSlug}/shipping/address-settings`,
      },
      zones: {
        list: () => `/api/v1/merchant/stores/${storeSlug}/shipping/zones`,
        create: () => `/api/v1/merchant/stores/${storeSlug}/shipping/zones`,
        detail: (zoneId: string) => `/api/v1/merchant/stores/${storeSlug}/shipping/zones/${zoneId}`,
        update: (zoneId: string) => `/api/v1/merchant/stores/${storeSlug}/shipping/zones/${zoneId}`,
        delete: (zoneId: string) => `/api/v1/merchant/stores/${storeSlug}/shipping/zones/${zoneId}`,
        assignMethod: (zoneId: string) => `/api/v1/merchant/stores/${storeSlug}/shipping/zones/${zoneId}/methods`,
        removeMethod: (zoneId: string, methodId: string) => 
          `/api/v1/merchant/stores/${storeSlug}/shipping/zones/${zoneId}/methods/${methodId}`,
        updateMethodPrice: (zoneId: string, methodId: string) => 
          `/api/v1/merchant/stores/${storeSlug}/shipping/zones/${zoneId}/methods/${methodId}`,
      },
      methods: {
        list: () => `/api/v1/merchant/stores/${storeSlug}/shipping/methods`,
        create: () => `/api/v1/merchant/stores/${storeSlug}/shipping/methods`,
        detail: (methodId: string) => `/api/v1/merchant/stores/${storeSlug}/shipping/methods/${methodId}`,
        update: (methodId: string) => `/api/v1/merchant/stores/${storeSlug}/shipping/methods/${methodId}`,
        delete: (methodId: string) => `/api/v1/merchant/stores/${storeSlug}/shipping/methods/${methodId}`,
      },
    }),
    stripeConnect: () => ({
      status:  () => `/api/v1/merchant/stores/${storeSlug}/stripe-connect/status`,
      onboard: () => `/api/v1/merchant/stores/${storeSlug}/stripe-connect/onboard`,
      dashboardLink: () => `/api/v1/merchant/stores/${storeSlug}/stripe-connect/dashboard-link`,
    }),
  }),
} as const;
