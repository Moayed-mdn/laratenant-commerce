'use client';

/**
 * Filter controls for the categories list.
 */

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  isActive:         'all' | 'true' | 'false';
  onIsActiveChange: (value: 'all' | 'true' | 'false') => void;
}

export default function CategoryFilters({
  isActive,
  onIsActiveChange,
}: Props) {
  const t = useTranslations('categories');

  const statusLabel: Record<'all' | 'true' | 'false', string> = {
    all:   t('filters.allStatuses'),
    true:  t('status.active'),
    false: t('status.inactive'),
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={isActive}
        onValueChange={(v) =>
          onIsActiveChange(v as 'all' | 'true' | 'false')
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            {statusLabel[isActive]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
          <SelectItem value="true">{t('status.active')}</SelectItem>
          <SelectItem value="false">{t('status.inactive')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}