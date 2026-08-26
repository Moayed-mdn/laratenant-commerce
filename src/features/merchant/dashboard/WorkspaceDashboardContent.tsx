'use client';

import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useRecentOrders } from '@/hooks/dashboard/useRecentOrders';
import { useTopProducts } from '@/hooks/dashboard/useTopProducts';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceDashboardContentProps {
  storeSlug: string;
}

export function WorkspaceDashboardContent({ storeSlug }: WorkspaceDashboardContentProps) {
  const t = useTranslations('dashboard');
  
  const { data: stats, isLoading: statsLoading, error: statsError, isError: isStatsError } = useDashboardStats(storeSlug);
  const { data: orders, isLoading: ordersLoading, error: ordersError, isError: isOrdersError } = useRecentOrders(storeSlug);
  const { data: products, isLoading: productsLoading, error: productsError, isError: isProductsError } = useTopProducts(storeSlug);

  const isLoading = statsLoading || ordersLoading || productsLoading;
  const hasError = (isStatsError || isOrdersError || isProductsError) && !isLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only show error if not loading and at least one query has an error
  if (hasError) {
    return (
      <div className="rounded-md bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{t('error')}</p>
      </div>
    );
  }

  // Ensure stats is defined before rendering
  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title={t('stats.revenue')} 
          value={stats.totalRevenue} 
          change={stats.revenueChangeFormatted} 
          isUp={stats.isRevenueUp} 
          icon={<DollarSign className="h-4 w-4" />} 
        />
        <StatCard 
          title={t('stats.orders')} 
          value={stats.totalOrders} 
          change={stats.ordersChangeFormatted} 
          isUp={stats.isOrdersUp} 
          icon={<ShoppingCart className="h-4 w-4" />} 
        />
        <StatCard 
          title={t('stats.customers')} 
          value={stats.totalCustomers} 
          change={stats.customersChangeFormatted} 
          isUp={stats.isCustomersUp} 
          icon={<Users className="h-4 w-4" />} 
        />
        <StatCard 
          title={t('stats.products')} 
          value={stats.totalProducts} 
          change={stats.productsChangeFormatted} 
          isUp={stats.isProductsUp} 
          icon={<Package className="h-4 w-4" />} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recentOrders.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!orders || orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('recentOrders.empty')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('recentOrders.order')}</TableHead>
                    <TableHead>{t('recentOrders.status')}</TableHead>
                    <TableHead className="text-right">{t('recentOrders.total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={ROUTES.merchant.orders.detail(String(order.id))}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{order.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>{t('topProducts.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!products || products.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('topProducts.empty')}</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-4">
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{product.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{product.revenue}</p>
                      <p className="text-xs text-muted-foreground">{product.totalSoldFormatted} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isUp, icon }: { 
  title: string; 
  value: string; 
  change: string; 
  isUp: boolean; 
  icon: React.ReactNode 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-md bg-muted p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-1">
          {isUp ? (
            <TrendingUp className="h-3 w-3 text-success" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span className={cn("text-xs font-medium", isUp ? "text-success" : "text-destructive")}>
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
