import { headers } from 'next/headers';
import { DashboardShell } from '@/features/dashboard/shell/DashboardShell';
import { TenantInitializer } from '@/features/dashboard/shell/TenantInitializer';
import { WorkspaceSidebarNav } from '@/features/merchant/components/WorkspaceSidebarNav';
import { WorkspaceStoreSwitcher } from '@/features/merchant/components/WorkspaceStoreSwitcher';
import { BillingBanners } from './BillingBanners';

// Force all merchant routes to be dynamic - they require authentication and user-specific data
export const dynamic = 'force-dynamic';

interface MerchantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Merchant Workspace Layout.
 * Provides the application shell for all /merchant/* routes.
 * Reuses the DashboardShell wired with workspace-specific navigation and store switcher.
 */
export default async function MerchantLayout({ children, params }: MerchantLayoutProps) {
  await params;
  const headerList = await headers();
  const tenantSlug = headerList.get('x-tenant-slug');

  return (
    <>
      <TenantInitializer tenantSlug={tenantSlug} />
      <DashboardShell 
        nav={<WorkspaceSidebarNav />} 
        switcher={<WorkspaceStoreSwitcher />}
      >
        <BillingBanners />
        {children}
      </DashboardShell>
    </>
  );
}
