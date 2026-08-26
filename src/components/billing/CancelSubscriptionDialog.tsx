/**
 * Cancel Subscription Dialog (Client Component)
 * Confirmation dialog for subscription cancellation
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
import { AlertTriangle } from 'lucide-react';
import { useCancelSubscription } from '@/hooks/billing/useCancelSubscription';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodEndDate?: string;
  onSuccess?: () => void;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  periodEndDate,
  onSuccess,
}: CancelSubscriptionDialogProps) {
  const cancelMutation = useCancelSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const t = useTranslations('billing.cancelDialog');
  const locale = useLocale();

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      await cancelMutation.mutateAsync();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by React Query
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-bg">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <DialogTitle className="text-center">{t('title')}</DialogTitle>
          <DialogDescription className="text-center">
            {periodEndDate ? (
              <>
                {t('descriptionWithDate.before')}{' '}
                <strong>{formatDate(periodEndDate)}</strong>
                {t('descriptionWithDate.after')}
              </>
            ) : (
              t('descriptionNoDate')
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-warning/30 bg-warning-bg p-4">
          <p className="text-sm text-warning">
            <strong>{t('noteLabel')}</strong> {t('noteBody')}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            {t('keepSubscription')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isProcessing || cancelMutation.isPending}
          >
            {isProcessing || cancelMutation.isPending
              ? t('canceling')
              : t('cancelSubscription')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
