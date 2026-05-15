'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import type { TagListItemView } from '@/types/tag';
import type { PaginationMeta } from '@/types/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TagStatusBadge } from './TagStatusBadge';

interface Props {
  tags:            TagListItemView[];
  pagination:      PaginationMeta | undefined;
  page:            number;
  onPageChange:    (page: number) => void;
  perPage:         number;
  onPerPageChange: (perPage: number) => void;
  isLoading:       boolean;
  storeId:         string;
}

export default function TagsTable({
  tags, pagination, page, onPageChange,
  perPage, onPerPageChange, isLoading, storeId,
}: Props) {
  const t = useTranslations('tags');

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('table.empty')}</p>
      </div>
    );
  }

  const perPageOptions = ['10', '15', '25', '50'] as const;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.type')}</TableHead>
              <TableHead>{t('table.color')}</TableHead>
              <TableHead>{t('table.translations')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.created')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {tag.type ?? '—'}
                </TableCell>
                <TableCell>
                  {tag.color ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 rounded-full border"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-mono text-muted-foreground">
                        {tag.color}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {tag.translationsCount}
                </TableCell>
                <TableCell>
                  <TagStatusBadge isActive={tag.isActive} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {tag.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={ROUTES.store(storeId).tags.edit(String(tag.id))}
                    className="inline-flex shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-clip-padding h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground"
                  >
                    {t('table.edit')}
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
            {pagination.from ?? 0} – {pagination.to ?? 0} {t('table.of')} {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(perPage)}
              onValueChange={(v) => onPerPageChange(Number(v))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue>{perPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {perPageOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
                {t('table.previous')}
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {t('table.page', { current: page, total: pagination.total_pages })}
              </span>
              <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= pagination.total_pages}>
                {t('table.next')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
