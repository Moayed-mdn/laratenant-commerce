'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Props {
  search:            string;
  onSearchChange:    (v: string) => void;
  isActive:          'all' | 'true' | 'false';
  onIsActiveChange:  (v: 'all' | 'true' | 'false') => void;
}

export default function TagFilters({
  search, onSearchChange, isActive, onIsActiveChange,
}: Props) {
  const t = useTranslations('tags');

  const statusLabel: Record<'all' | 'true' | 'false', string> = {
    all:   t('filters.allStatuses'),
    true:  t('status.active'),
    false: t('status.inactive'),
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        className="w-[220px]"
        placeholder={t('filters.typePlaceholder')}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        value={isActive}
        onValueChange={(v) => onIsActiveChange(v as 'all' | 'true' | 'false')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>{statusLabel[isActive]}</SelectValue>
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
