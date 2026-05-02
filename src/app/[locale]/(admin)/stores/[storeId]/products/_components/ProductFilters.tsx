'use client';

/**
 * Product filters component.
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
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string | null) => void;
}

export default function ProductFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: Props) {
  const t = useTranslations('products');
  const dashboardT = useTranslations('dashboard');

  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          aria-label={t('filters.search')}
          className="pl-9"
        />
      </div>
      <Select
        value={status}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="w-[150px]" aria-label={t('filters.status')}>
          <SelectValue placeholder={t('filters.status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
          <SelectItem value="active">{dashboardT('productStatus.active')}</SelectItem>
          <SelectItem value="draft">{dashboardT('productStatus.draft')}</SelectItem>
          <SelectItem value="archived">{dashboardT('productStatus.archived')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
