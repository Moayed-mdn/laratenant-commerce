'use client';

/**
 * User filters component.
 * Client component for search and filter controls.
 */

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Props {
  search: string;
  role: string;
  status: string;
}

export default function UserFilters({ search, role, status }: Props) {
  const t = useTranslations('users');

  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={search}
          readOnly
          placeholder={t('filters.searchPlaceholder')}
          aria-label={t('filters.search')}
          className="pl-9"
        />
      </div>
      <Select value={role}>
        <SelectTrigger className="w-[150px]" aria-label={t('filters.role')}>
          <SelectValue placeholder={t('filters.role')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allRoles')}</SelectItem>
          <SelectItem value="store_admin">{t('roles.store_admin')}</SelectItem>
          <SelectItem value="staff">{t('roles.staff')}</SelectItem>
          <SelectItem value="super_admin">{t('roles.super_admin')}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status}>
        <SelectTrigger className="w-[150px]" aria-label={t('filters.status')}>
          <SelectValue placeholder={t('filters.status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
          <SelectItem value="verified">{t('status.verified')}</SelectItem>
          <SelectItem value="unverified">{t('status.unverified')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
