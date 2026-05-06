'use client';

/**
 * Users table with pagination.
 * Client component for interactive pagination controls.
 */

import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/config/routes';
import type { UserListItemView } from '@/types/user';
import type { PaginationMeta } from '@/types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserRoleBadge } from './UserRoleBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Props {
  users: UserListItemView[];
  pagination: PaginationMeta | undefined;
  page: number;
  onPageChange: (page: number) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  isLoading: boolean;
  storeId: string;
}

export default function UsersTable({
  users,
  pagination,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  isLoading,
  storeId,
}: Props) {
  const t = useTranslations('users');

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (users.length === 0) {
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
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.role')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.created')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? t('status.active') : t('status.inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.createdAtRelative}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={ROUTES.store(storeId).users.detail(String(user.id))}
                    className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground"
                  >
                    {t('table.view')}
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
