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
import { makeLabelByValue, renderSelectValue, type SelectOption } from '@/lib/selectOptions';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string | null) => void;
  status: string;
  onStatusChange: (value: string | null) => void;
}

export default function UserFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
}: Props) {
  const t = useTranslations('users');

  const roleOptions = [
    { value: 'all', label: t('filters.allRoles') },
    { value: 'store_admin', label: t('roles.store_admin') },
    { value: 'staff', label: t('roles.staff') },
  ] as const satisfies readonly SelectOption<string>[];

  const statusOptions = [
    { value: 'all', label: t('filters.allStatuses') },
    { value: 'active', label: t('status.active') },
    { value: 'inactive', label: t('status.inactive') },
  ] as const satisfies readonly SelectOption<string>[];

  const roleLabelByValue = makeLabelByValue(roleOptions);
  const statusLabelByValue = makeLabelByValue(statusOptions);

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
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[150px]" aria-label={t('filters.role')}>
          <SelectValue>
            {renderSelectValue(roleLabelByValue, t('filters.role'))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]" aria-label={t('filters.status')}>
          <SelectValue>
            {renderSelectValue(statusLabelByValue, t('filters.status'))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
