'use client';

import { useEffect, useState } from 'react';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { WorkspaceEmptyState } from '@/features/merchant/components/WorkspaceEmptyState';
import CreateProductForm from '@/features/dashboard/products/CreateProductForm';
import { UpgradePromptDialog } from '@/components/billing';
import { canCreateProduct } from '@/lib/billing/product-guard';
import { useTranslations } from 'next-intl';
import { AlertCircle, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { getStoreRouteParam } from '@/lib/stores/route-param';

/**
 * Merchant Workspace — Create Product Page.
 * Canonical route: /merchant/products/new
 */
export default function MerchantProductCreatePage() {
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const t = useTranslations('products');
  const [quotaCheck, setQuotaCheck] = useState<{
    allowed: boolean;
    reason?: string;
    currentCount?: number;
    limit?: number;
  } | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const storeSlug = getStoreRouteParam(activeStore);

  useEffect(() => {
    async function checkQuota() {
      if (!activeStore) return;
      
      const result = await canCreateProduct(activeStore.id);
      setQuotaCheck(result);

      if (!result.allowed) {
        setShowUpgradeDialog(true);
      }
    }

    checkQuota();
  }, [activeStore]);

  if (!activeStore) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
        </div>
        <WorkspaceEmptyState />
      </div>
    );
  }

  if (!quotaCheck) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">{t('quotaLimit.checking')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quotaCheck.allowed) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle>{t('quotaLimit.title')}</CardTitle>
                <CardDescription>
                  {t('quotaLimit.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('quotaLimit.currentUsage')}</p>
                  <p className="text-2xl font-bold">
                    {quotaCheck.currentCount || 0} / {quotaCheck.limit || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('quotaLimit.productsCreated')}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('quotaLimit.upgradeHint')}
            </p>

            <div className="flex gap-2">
              <Button asChild>
                <Link href={ROUTES.merchant.billing.plans()}>{t('quotaLimit.viewPlans')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={ROUTES.merchant.products.list()}>{t('quotaLimit.backToProducts')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <UpgradePromptDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          limitType="products"
          current={quotaCheck.currentCount || 0}
          limit={quotaCheck.limit || 0}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateProductForm storeSlug={storeSlug} />
    </div>
  );
}
