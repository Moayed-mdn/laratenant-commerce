/**
 * Entitlement Usage Card
 * Displays quota usage and feature entitlements
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Store, Package, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { StoreEntitlement } from '@/types/billing/entitlement';

interface EntitlementUsageCardProps {
  entitlement: StoreEntitlement;
  currentStores?: number;
  currentProducts?: number;
}

export function EntitlementUsageCard({
  entitlement,
  currentStores = 0,
  currentProducts = 0,
}: EntitlementUsageCardProps) {
  const t = useTranslations('billing.usage');
  
  // Safety check: ensure features exist
  if (!entitlement || !entitlement.features) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('noData')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Extract limits from features (null = unlimited)
  const storesMax = entitlement.features['stores.max'] as number | null;
  const productsMax = entitlement.features['products.max'] as number | null;

  const storePercentage = storesMax !== null ? (currentStores / storesMax) * 100 : 0;
  const productPercentage = productsMax !== null ? (currentProducts / productsMax) * 100 : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  // Extract boolean features
  const booleanFeatures = Object.entries(entitlement.features)
    .filter(([key, value]) => typeof value === 'boolean' && !key.includes('.max'))
    .map(([key, value]) => ({ key, enabled: value as boolean }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Store Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('stores')}</span>
            </div>
            <span className="text-sm tabular-nums">
              {currentStores} / {storesMax !== null ? storesMax : '∞'}
            </span>
          </div>
          {storesMax !== null ? (
            <>
              <Progress value={storePercentage} className="h-2" />
              {storePercentage >= 90 && (
                <p className="text-xs text-warning">
                  {t('approachingLimit')}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('unlimitedStores')}
            </p>
          )}
        </div>

        {/* Product Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('products')}</span>
            </div>
            <span className="text-sm tabular-nums">
              {currentProducts} / {productsMax !== null ? productsMax : '∞'}
            </span>
          </div>
          {productsMax !== null ? (
            <Progress value={productPercentage} className="h-2" />
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('unlimitedProducts')}
            </p>
          )}
        </div>

        {/* Features */}
        {booleanFeatures.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">{t('features')}</div>
            <div className="space-y-2">
              {booleanFeatures.map(({ key, enabled }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                  {enabled ? (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      {t('enabled')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <X className="h-3 w-3" />
                      {t('disabled')}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
