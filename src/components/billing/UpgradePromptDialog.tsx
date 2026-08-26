/**
 * Upgrade Prompt Dialog (Client Component)
 * Modal shown when user hits quota limit
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType: 'stores' | 'products' | 'custom';
  current?: number;
  limit?: number;
  message?: string;
}

export function UpgradePromptDialog({
  open,
  onOpenChange,
  limitType,
  current,
  limit,
  message,
}: UpgradePromptDialogProps) {
  const t = useTranslations('billing.upgradePrompt');
  const tUsage = useTranslations('billing.usage');

  const getDefaultMessage = () => {
    if (limitType === 'stores') {
      return limit === 1
        ? t('storesMessageSingular', { limit: limit ?? 0 })
        : t('storesMessage', { limit: limit ?? 0 });
    }
    if (limitType === 'products') {
      return t('productsMessage', { limit: limit?.toLocaleString() ?? '0' });
    }
    return message || t('customMessage');
  };

  const getLimitLabel = () => {
    if (limitType === 'stores') return tUsage('stores');
    if (limitType === 'products') return tUsage('products');
    return t('limitLabel');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-bg">
            <AlertCircle className="h-6 w-6 text-warning" />
          </div>
          <DialogTitle className="text-center">{t('title')}</DialogTitle>
          <DialogDescription className="text-center">{getDefaultMessage()}</DialogDescription>
        </DialogHeader>

        {current !== undefined && limit !== undefined && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{getLimitLabel()}</span>
              <span className="text-sm font-medium tabular-nums">
                {current} / {limit}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-warning transition-all"
                style={{ width: `${Math.min((current / limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('maybeLater')}
          </Button>
          <Link href="/merchant/billing/plans">
            <Button variant="default">
              <TrendingUp className="me-2 h-4 w-4" />
              {t('viewPlans')}
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
