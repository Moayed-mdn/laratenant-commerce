'use client';

/**
 * Products table with pagination.
 * Client component for interactive pagination controls.
 */

import { Link } from '@/lib/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/config/routes';
import type { ProductListItemView } from '@/types/product';
import type { PaginationMeta } from '@/types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductStatusBadge } from './ProductStatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Props {
  products: ProductListItemView[];
  pagination: PaginationMeta | undefined;
  page: number;
  onPageChange: (page: number) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  isLoading: boolean;
  storeId: string;
}

export default function ProductsTable({
  products,
  pagination,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  isLoading,
  storeId,
}: Props) {
  const t = useTranslations('products');

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('table.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.image')}</TableHead>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.price')}</TableHead>
              <TableHead>{t('table.inventory')}</TableHead>
              <TableHead>{t('table.sku')}</TableHead>
              <TableHead>{t('table.created')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.firstImage ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded">
                      <Image
                        src={product.firstImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted" />
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={ROUTES.store(storeId).products.edit(String(product.id))}
                    className="font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <ProductStatusBadge status={product.status} />
                </TableCell>
                <TableCell>
                  <span className="font-medium">{product.price}</span>
                  {product.compareAtPrice && (
                    <span className="ml-2 text-sm text-muted-foreground line-through">
                      {product.compareAtPrice}
                    </span>
                  )}
                </TableCell>
                <TableCell>{t('table.inStock', { count: product.quantity })}</TableCell>
                <TableCell className="text-muted-foreground">
                  {product.sku ?? t('table.noSku')}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {product.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={ROUTES.store(storeId).products.edit(String(product.id))}>
                    <Button variant="ghost" size="sm">
                      {t('table.edit')}
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.from ?? 0} - {pagination.to ?? 0} {t('table.of')} {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={t('table.perPage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                {t('table.previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('table.page', { current: page, total: pagination.total_pages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pagination.total_pages}
              >
                {t('table.next')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
