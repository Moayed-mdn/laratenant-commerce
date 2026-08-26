/**
 * Trial Banner (Client Component for dismiss)
 * Countdown banner during free trial period
 */

'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TrialBannerProps {
  trialEndsAt: string;
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations('billing.trialBanner');
  const locale = useLocale();

  if (isDismissed) {
    return null;
  }

  const daysRemaining = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const getVariant = () => {
    if (daysRemaining <= 3) return 'destructive';
    if (daysRemaining <= 7) return 'warning';
    return 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const variant = getVariant();

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border px-4 py-3',
        variant === 'destructive' && 'border-danger/30 bg-danger-bg',
        variant === 'warning' && 'border-warning/30 bg-warning-bg',
        variant === 'default' && 'border-info/30 bg-info-bg'
      )}
    >
      <div className="flex items-center gap-3">
        <Clock
          className={cn(
            'h-4 w-4',
            variant === 'destructive' && 'text-danger',
            variant === 'warning' && 'text-warning',
            variant === 'default' && 'text-info'
          )}
        />
        <span
          className={cn(
            'text-sm',
            variant === 'destructive' && 'text-danger',
            variant === 'warning' && 'text-warning',
            variant === 'default' && 'text-info'
          )}
        >
          <strong>
            {t('daysRemaining', { days: daysRemaining })}
          </strong>{' '}
          {t('trialEndsMessage', { date: formatDate(trialEndsAt) })}
        </span>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link href="/merchant/billing/plans">
          <Button size="sm" variant="default">
            {t('choosePlan')}
          </Button>
        </Link>
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
