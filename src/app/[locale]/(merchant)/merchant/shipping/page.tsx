'use client';

import { useBootstrapStore } from '@/stores/bootstrapStore';
import { WorkspaceEmptyState } from '@/features/merchant/components/WorkspaceEmptyState';
import { MerchantPageHeader } from '@/features/merchant/components/MerchantPageHeader';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShippingMethodsList } from '@/features/merchant/shipping/ShippingMethodsList';
import { ShippingZonesList } from '@/features/merchant/shipping/ShippingZonesList';
import { AddressSettingsForm } from '@/features/merchant/shipping/AddressSettingsForm';
import { Truck } from 'lucide-react';
import { getStoreRouteParam } from '@/lib/stores/route-param';

/**
 * Merchant Workspace Shipping Page.
 * Displays the shipping settings for the currently active store.
 */
export default function MerchantShippingPage() {
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const t = useTranslations('shipping');

  if (!activeStore) {
    return (
      <div className="flex flex-col gap-6">
        <MerchantPageHeader
          title={t('title')}
          description={t('subtitle')}
        />
        <WorkspaceEmptyState icon={Truck} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MerchantPageHeader
        title={t('title')}
        description={t('subtitle')}
      />
      
      <Tabs defaultValue="methods" className="space-y-6">
        <TabsList>
          <TabsTrigger value="methods">{t('tabs.methods')}</TabsTrigger>
          <TabsTrigger value="zones">{t('tabs.zones')}</TabsTrigger>
          <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4">
          <ShippingMethodsList storeSlug={getStoreRouteParam(activeStore)} />
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <ShippingZonesList storeSlug={getStoreRouteParam(activeStore)} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AddressSettingsForm storeSlug={getStoreRouteParam(activeStore)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
