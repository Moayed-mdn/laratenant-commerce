/**
 * Downgrade Confirm Dialog (Client Component)
 * Confirmation dialog for plan downgrade
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
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { useDowngradeSubscription } from '@/hooks/billing/useDowngradeSubscription';
import { useState } from 'react';
import type { BillingCycle } from '@/types/billing/plan';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface DowngradeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  targetPlan: string;
  targetPlanCode: string;
  billingCycle: BillingCycle;
  periodEndDate?: string;
  onSuccess?: () => void;
}

export function DowngradeConfirmDialog({
  open,
  onOpenChange,
  currentPlan,
  targetPlan,
  targetPlanCode,
  billingCycle,
  periodEndDate,
  onSuccess,
}: DowngradeConfirmDialogProps) {
  const downgradeMutation = useDowngradeSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('billing.downgrade');
  const tErrors = useTranslations('billing.errors');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  
  // Get active store from bootstrap
  const activeStore = useBootstrapStore((state) => state.activeStore);

  const handleDowngrade = async () => {
    // Validate active store exists
    if (!activeStore) {
      toast({
        title: tCommon('error'),
        description: tErrors('noActiveStore'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const storeId = activeStore.id;
      
      await downgradeMutation.mutateAsync({
        plan_code: targetPlanCode,
        billing_cycle: billingCycle,
        store_id: storeId,
        apply_immediately: false,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Downgrade failed:', error);
      
      // Extract meaningful error message
      let errorMessage = t('failedMessage');
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as { message?: string; errors?: Record<string, string[]> };
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.errors && Object.keys(apiError.errors).length > 0) {
          errorMessage = Object.values(apiError.errors).flat().join(', ');
        }
      }
      
      toast({
        title: t('failed'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-bg">
            <TrendingDown className="h-6 w-6 text-warning" />
          </div>
          <DialogTitle className="text-center">{t('confirmTitle')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('confirmDescription', { 
              currentPlan, 
              targetPlan,
              date: periodEndDate ? formatDate(periodEndDate) : ''
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-warning/30 bg-warning-bg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-warning">
                  {t('whatHappens')}
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-warning">
                  <li>{t('reducedLimits')}</li>
                  <li>{t('fewerFeatures')}</li>
                  <li>{t('lowerPriority')}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              <strong>{t('noteTitle')}</strong> {t('noteMessage', { 
                date: periodEndDate ? formatDate(periodEndDate) : ''
              })}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            {t('cancel')}
          </Button>
          <Button
            variant="default"
            onClick={handleDowngrade}
            disabled={isProcessing || downgradeMutation.isPending}
          >
            {isProcessing || downgradeMutation.isPending
              ? t('processing')
              : t('confirmButton', { plan: targetPlan })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
