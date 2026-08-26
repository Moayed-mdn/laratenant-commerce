'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useProvisioningStatus } from '@/hooks/auth/useProvisioningStatus';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { isBootstrapStoreReady } from '@/lib/auth/bootstrap-routing';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SetupCompleteStep } from './SetupCompleteStep';
import { logUXEvent } from '@/lib/ux-events';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  WifiOff,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Maps backend current_step values to human-readable lifecycle labels.
 * Steps are shown as a progressive checklist during provisioning.
 */

export function ProvisioningStep() {
  const queryClient = useQueryClient();
  const completedRefreshRef = useRef(false);
  const hasLoggedMount = useRef(false);
  const t = useTranslations('setup.provisioning');

  const provisioning = useBootstrapStore((state) => state.provisioning);
  const bootstrap = useBootstrapStore((state) => state.bootstrap);

  const {
    refetch,
    isError,
    error,
    softTimedOut,
    hardTimedOut,
    isOnline,
  } = useProvisioningStatus();

  const storeName = bootstrap?.active_store?.name ?? bootstrap?.stores?.[0]?.name ?? null;

  const status = provisioning?.status ?? 'pending';
  const progress = provisioning?.progress ?? 0;
  const message = provisioning?.message ?? null;
  const currentStep = provisioning?.current_step ?? null;

  const lifecycleSteps = [
    { key: 'initializing_store',        label: t('creatingStore') },
    { key: 'provisioning_workspace',    label: t('settingUpWorkspace') },
    { key: 'applying_configuration',    label: t('applyingSettings') },
    { key: 'finalizing_setup',          label: t('almostDone') },
  ] as const;

  function resolveLifecycleIndex(currentStep: string | null): number {
    if (!currentStep) return 0;
    const idx = lifecycleSteps.findIndex((s) => s.key === currentStep);
    return idx >= 0 ? idx : 0;
  }

  const lifecycleIndex = resolveLifecycleIndex(currentStep);

  const heading = useMemo(() => {
    if (status === 'completed') return t('storeReady');
    if (status === 'failed') return t('weHitSnag');
    if (storeName) return t('settingUpName', { storeName });
    return t('settingUp');
  }, [status, storeName, t]);

  const subheading = useMemo(() => {
    if (!isOnline) return t('offlineMessage');
    if (isError) return error?.message ?? t('checkError');
    if (status === 'failed') return message || t('setupStopped');
    if (hardTimedOut) return t('takingLonger');
    if (softTimedOut) return t('stillSettingUp');
    if (status === 'completed') return t('everythingReady');
    return message ?? t('settingUp');
  }, [error?.message, hardTimedOut, isError, isOnline, message, softTimedOut, status, t]);

  // Log provisioning mount once
  useEffect(() => {
    if (hasLoggedMount.current) return;
    if (status === 'pending' || status === 'running') {
      hasLoggedMount.current = true;
      logUXEvent('provisioning:mount');
    }
  }, [status]);

  // Log provisioning complete once and trigger bootstrap refresh
  useEffect(() => {
    if (status === 'completed' && !completedRefreshRef.current) {
      logUXEvent('provisioning:complete', { duration: provisioning?.progress ?? undefined });
    }
    if (status !== 'completed') {
      completedRefreshRef.current = false;
      return;
    }
    if (bootstrap?.active_store && isBootstrapStoreReady(bootstrap.active_store)) {
      completedRefreshRef.current = false;
      return;
    }
    if (completedRefreshRef.current) return;
    completedRefreshRef.current = true;
    void queryClient.invalidateQueries({ queryKey: queryKeys.merchant.me() });
  }, [queryClient, bootstrap?.active_store, status]);

  // Show the completion handoff screen when provisioning is done
  if (status === 'completed' && bootstrap?.active_store && isBootstrapStoreReady(bootstrap.active_store)) {
    return <SetupCompleteStep />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="mx-auto w-full max-w-lg space-y-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <span className="h-px w-6 bg-primary" />
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <span className="h-px w-6 bg-primary" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            <span>3</span>
            <span className="hidden sm:inline">{t('stepIndicator')}</span>
          </span>
        </div>

        {/* Status icon */}
        <div className="flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            {status === 'completed' ? (
              <CheckCircle2 className="h-14 w-14 text-success" />
            ) : status === 'failed' || isError ? (
              <AlertCircle className="h-14 w-14 text-destructive" />
            ) : hardTimedOut ? (
              <Clock3 className="h-14 w-14 text-warning" />
            ) : !isOnline ? (
              <WifiOff className="h-14 w-14 text-warning" />
            ) : (
              <>
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <Loader2 className="h-14 w-14 animate-spin text-primary" />
              </>
            )}
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">{heading}</h1>
          <p className="text-muted-foreground">{subheading}</p>
        </div>

        {/* Progress bar */}
        {status !== 'completed' && status !== 'failed' && !isError ? (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-xs text-muted-foreground">{t('percentComplete', { progress })}</p>
          </div>
        ) : null}

        {/* Lifecycle checklist */}
        {status !== 'failed' && !isError ? (
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <ul className="space-y-3">
              {lifecycleSteps.map((step, idx) => {
                const isDone = status === 'completed' || idx < lifecycleIndex;
                const isActive = idx === lifecycleIndex && status !== 'completed';
                return (
                  <li key={step.key} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <span
                      className={
                        isDone
                          ? 'text-sm font-medium text-foreground'
                          : isActive
                            ? 'text-sm font-medium text-foreground'
                            : 'text-sm text-muted-foreground'
                      }
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t('checkAgain')}
          </Button>
        </div>

        {/* Recovery help — shown only when something needs attention */}
        {(softTimedOut || hardTimedOut || status === 'failed' || isError) ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-left">
            <h3 className="font-semibold text-foreground">{t('needHelpTitle')}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>{t('helpCheckAgain')}</li>
              <li>{t('helpProcessing')}</li>
              <li>{t('helpAutoOpen')}</li>
              <li>{t('helpContact')}</li>
            </ul>
          </div>
        ) : null}

      </div>
    </div>
  );
}
