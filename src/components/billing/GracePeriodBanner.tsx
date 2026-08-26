/**
 * Grace Period Banner (Client Component for dismiss)
 * Urgent warning during payment failure grace period
 */

'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface GracePeriodBannerProps {
  gracePeriodEndsAt: string;
  onUpdatePayment: () => void;
}

export function GracePeriodBanner({
  gracePeriodEndsAt,
  onUpdatePayment,
}: GracePeriodBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations('billing.gracePeriodBanner');
  const locale = useLocale();

  if (isDismissed) {
    return null;
  }

  const daysRemaining = Math.ceil(
    (new Date(gracePeriodEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-danger" />
        <span className="text-sm text-danger">
          <strong>{t('label')}</strong> {t('message', {
            days: daysRemaining,
            date: formatDate(gracePeriodEndsAt),
          })}
        </span>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="default" onClick={onUpdatePayment}>
          {t('updatePayment')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsDismissed(true)}
          aria-label={t('dismiss')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
