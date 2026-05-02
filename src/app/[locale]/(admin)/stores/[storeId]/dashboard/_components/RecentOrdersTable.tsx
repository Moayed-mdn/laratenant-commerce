/**
 * Recent orders table component.
 * Displays recent orders with links to order detail pages.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { getTranslations } from 'next-intl/server';
import type { RecentOrderItemView } from '@/types/dashboard';
import { OrderStatusBadge } from './OrderStatusBadge';

interface RecentOrdersTableProps {
  orders: RecentOrderItemView[];
  storeId: string;
}

/**
 * Table displaying recent orders for the dashboard.
 */
export async function RecentOrdersTable({ orders, storeId }: RecentOrdersTableProps) {
  const t = await getTranslations('dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentOrders.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted text-sm">{t('recentOrders.empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('recentOrders.order')}</TableHead>
                <TableHead>{t('recentOrders.customer')}</TableHead>
                <TableHead>{t('recentOrders.status')}</TableHead>
                <TableHead className="text-right">{t('recentOrders.total')}</TableHead>
                <TableHead>{t('recentOrders.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.store(storeId).orders.detail(String(order.id))}
                      className="font-medium hover:underline text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>{order.customerName}</div>
                    <div className="text-xs text-muted">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">{order.total}</TableCell>
                  <TableCell className="text-muted text-sm">
                    {order.createdAtRelative}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
