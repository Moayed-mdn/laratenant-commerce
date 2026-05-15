import { headers } from 'next/headers';
import { MarketingHome } from '@/features/marketing/components/MarketingHome';
import { DashboardHome } from '@/features/dashboard/components/DashboardHome';
import { StorefrontHome } from '@/features/storefront/components/StorefrontHome';
import { AppType } from '@/lib/tenant/types';

export default async function RootPage() {
  const headerList = await headers();
  const appType = (headerList.get('x-app-type') as AppType) || 'marketing';
  
  // Render the appropriate home component based on application type
  switch (appType) {
    case 'dashboard':
      return <DashboardHome />;
    case 'storefront':
      return <StorefrontHome />;
    case 'marketing':
    default:
      return <MarketingHome />;
  }
}
