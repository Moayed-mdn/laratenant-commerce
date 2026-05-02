/**
 * Order filters component.
 */

'use client';
// Reason: manages nuqs state for filters

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
            <SelectItem value="pending">{t('status.pending')}</SelectItem>
            <SelectItem value="confirmed">{t('status.confirmed')}</SelectItem>
            <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
            <SelectItem value="refunded">{t('status.refunded')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentStatus">{t('filters.paymentStatus')}</Label>
        <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
          <SelectTrigger id="paymentStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allPaymentStatuses')}</SelectItem>
            <SelectItem value="pending">{t('paymentStatus.pending')}</SelectItem>
            <SelectItem value="paid">{t('paymentStatus.paid')}</SelectItem>
            <SelectItem value="failed">{t('paymentStatus.failed')}</SelectItem>
            <SelectItem value="refunded">{t('paymentStatus.refunded')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
