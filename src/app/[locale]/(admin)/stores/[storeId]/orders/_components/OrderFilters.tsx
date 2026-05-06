/**
 * Order filters component.
 */

'use client';
// Reason: manages nuqs state for filters

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { makeLabelByValue, renderSelectValue, type SelectOption } from '@/lib/selectOptions';

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string | null) => void;
  paymentStatus: string;
  onPaymentStatusChange: (value: string | null) => void;
}

export default function OrderFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
}: OrderFiltersProps) {
  const t = useTranslations('orders');

  const statusOptions = [
    { value: 'all', label: t('filters.allStatuses') },
    { value: 'pending', label: t('status.pending') },
    { value: 'processing', label: t('status.processing') },
    { value: 'shipped', label: t('status.shipped') },
    { value: 'delivered', label: t('status.delivered') },
    { value: 'cancelled', label: t('status.cancelled') },
    { value: 'refunded', label: t('status.refunded') },
  ] as const satisfies readonly SelectOption<string>[];

  const paymentStatusOptions = [
    { value: 'all', label: t('filters.allPaymentStatuses') },
    { value: 'pending', label: t('paymentStatus.pending') },
    { value: 'paid', label: t('paymentStatus.paid') },
    { value: 'failed', label: t('paymentStatus.failed') },
    { value: 'refunded', label: t('paymentStatus.refunded') },
    { value: 'partially_refunded', label: t('paymentStatus.partially_refunded') },
  ] as const satisfies readonly SelectOption<string>[];

  const statusLabelByValue = makeLabelByValue(statusOptions);
  const paymentStatusLabelByValue = makeLabelByValue(paymentStatusOptions);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="search">{t('filters.search')}</Label>
        <Input
          id="search"
          placeholder={t('filters.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">{t('filters.status')}</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger id="status">
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

      <div className="space-y-2">
        <Label htmlFor="paymentStatus">{t('filters.paymentStatus')}</Label>
        <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
          <SelectTrigger id="paymentStatus">
            <SelectValue>
              {renderSelectValue(paymentStatusLabelByValue, t('filters.paymentStatus'))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {paymentStatusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
