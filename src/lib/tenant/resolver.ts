import { AppType, TenantContext } from './types';

/**
 * Configuration for tenant resolution.
 * In a real SaaS, these would come from environment variables.
 */
export const TENANT_CONFIG = {
  baseDomain: process.env.NEXT_PUBLIC_BASE_DOMAIN || 'laratenant.com',
  dashboardSubdomain: 'app',
  marketingSubdomain: 'www', // Optional: www.laratenant.com
};

/**
 * Resolves the application type and tenant context from a hostname.
 * 
 * Logic:
 * - laratenant.com or www.laratenant.com -> marketing
 * - app.laratenant.com -> dashboard
 * - {slug}.laratenant.com -> storefront
 * - anyotherdomain.com -> storefront (custom domain)
 */
export function resolveTenant(hostname: string): TenantContext {
  // 1. Handle development/localhost
  if (
    hostname === 'localhost' || 
    hostname.includes('127.0.0.1') || 
    hostname.endsWith('.localhost')
  ) {
    // For local dev, we default to marketing unless specified
    // In the future, we could use port mapping or specific localhost subdomains
    return {
      appType: 'marketing',
      tenantSlug: null,
      isCustomDomain: false,
    };
  }

  const { baseDomain, dashboardSubdomain, marketingSubdomain } = TENANT_CONFIG;

  // 2. Marketing App
  if (hostname === baseDomain || hostname === `${marketingSubdomain}.${baseDomain}`) {
    return {
      appType: 'marketing',
      tenantSlug: null,
      isCustomDomain: false,
    };
  }

  // 3. Dashboard App
  if (hostname === `${dashboardSubdomain}.${baseDomain}`) {
    return {
      appType: 'dashboard',
      tenantSlug: null,
      isCustomDomain: false,
    };
  }

  // 4. Storefront App (Subdomain)
  if (hostname.endsWith(`.${baseDomain}`)) {
    const tenantSlug = hostname.replace(`.${baseDomain}`, '');
    return {
      appType: 'storefront',
      tenantSlug,
      isCustomDomain: false,
    };
  }

  // 5. Storefront App (Custom Domain)
  return {
    appType: 'storefront',
    tenantSlug: hostname, // Hostname is the unique identifier for custom domains
    isCustomDomain: true,
  };
}

/**
 * Helper to check if a request is for a specific application type.
 */
export function isAppType(hostname: string, type: AppType): boolean {
  const context = resolveTenant(hostname);
  return context.appType === type;
}
