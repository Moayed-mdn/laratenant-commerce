/**
 * Top products list component.
 * Displays top-selling products with links to product edit pages.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { Badge } from '@/components/ui/badge';
import { getTranslations } from 'next-intl/server';
import type { TopProductItemView } from '@/types/dashboard';

interface TopProductsListProps {
  products: TopProductItemView[];
  storeId: string;
}

/**
 * List displaying top products for the dashboard.
 */
export async function TopProductsList({ products, storeId }: TopProductsListProps) {
  const t = await getTranslations('dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('topProducts.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-muted text-sm">{t('topProducts.empty')}</p>
        ) : (
          <ul className="space-y-3">
            {products.map((product) => (
              <li key={product.id} className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={ROUTES.store(storeId).products.edit(String(product.id))}
                    className="text-sm font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  <span className="text-xs text-muted">
                    {product.totalSoldFormatted} {t('topProducts.sold')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{product.revenue}</div>
                  <Badge variant="outline" className="text-xs">
                    {t(`productStatus.${product.status}`)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
