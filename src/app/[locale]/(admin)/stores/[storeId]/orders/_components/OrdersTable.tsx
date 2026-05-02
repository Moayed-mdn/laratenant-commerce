/**
 * Orders table component.
 */

'use client';
// Reason: displays interactive table with links and badges

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { OrderListItemView } from '@/types/order';
import type { PaginationMeta } from '@/types/api';
import { ROUTES } from '@/config/routes';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface OrdersTableProps {
  orders: OrderListItemView[];
  storeId: string;
  pagination?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  isLoading: boolean;
}

export default function OrdersTable({
  orders,
  storeId,
  pagination,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  isLoading,
}: OrdersTableProps) {
  const t = useTranslations('orders');

  if (isLoading) {
    return null; // Skeleton handles loading state
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">{t('table.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.order')}</TableHead>
              <TableHead>{t('table.customer')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.payment')}</TableHead>
              <TableHead>{t('table.items')}</TableHead>
              <TableHead>{t('table.total')}</TableHead>
              <TableHead>{t('table.date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={ROUTES.store(storeId).orders.detail(String(order.id))}
                    className="font-medium text-primary hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customerName}</span>
                    <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </TableCell>
                <TableCell>
                  {order.itemCount === 1
                    ? t('table.itemCount', { count: order.itemCount })
                    : t('table.itemCountPlural', { count: order.itemCount })}
                </TableCell>
                <TableCell className="font-medium">{order.total}</TableCell>
                <TableCell className="text-muted-foreground">{order.createdAtRelative}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('table.page', { current: pagination.current_page, total: pagination.last_page })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {t('table.previous')}
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pagination.last_page}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {t('table.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
