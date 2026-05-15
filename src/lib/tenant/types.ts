export type AppType = 'marketing' | 'dashboard' | 'storefront';

export interface TenantContext {
  appType: AppType;
  tenantSlug: string | null;
  isCustomDomain: boolean;
}
