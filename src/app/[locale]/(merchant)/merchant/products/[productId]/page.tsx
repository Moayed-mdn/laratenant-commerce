'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Merchant Workspace — Product View Page (Redirects to Edit).
 * Canonical route: /merchant/products/[productId]
 * 
 * This page redirects to the edit page since we don't have a separate view mode.
 * Pattern matches brands and tags behavior.
 */
export default function MerchantProductViewPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const t = useTranslations();
  const productId = params.productId;

  useEffect(() => {
    // Redirect to edit page
    router.replace(`/merchant/products/${productId}/edit`);
  }, [productId, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-muted-foreground">{t('redirecting')}</p>
    </div>
  );
}
