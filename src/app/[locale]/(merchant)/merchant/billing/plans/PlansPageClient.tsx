/**
 * Plans Page Client Component
 * Plan selection with billing cycle toggle
 */

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePlans } from '@/hooks/billing/usePlans';
import { useSubscription } from '@/hooks/billing/useSubscription';
import { useUpgradeSubscription } from '@/hooks/billing/useUpgradeSubscription';
import { PlanCard, PlanComparisonTable } from '@/components/billing';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DowngradeConfirmDialog } from '@/components/billing/DowngradeConfirmDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { BillingCycle } from '@/types/billing/plan';
import { useToast } from '@/hooks/use-toast';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { startTrial, moveToCurrentPlanVersion } from '@/lib/api/billing';
import { Info, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

/**
 * Format a feature for display in the legacy plan card.
 * Returns a human-readable label and value.
 */
function formatFeature(feature: any, t: any): { label: string; value: string } {
  // Map feature keys to translation keys
  const featureKeyMap: Record<string, string> = {
    'stores.max': 'features.stores',
    'products.max': 'features.products',
    'users.max': 'features.teamMembers',
    'custom_domain.enabled': 'features.customDomain',
    'api.access': 'features.apiAccess',
    'webhooks.enabled': 'features.webhooks',
    'support.priority': 'features.prioritySupport',
    'analytics.advanced': 'features.advancedAnalytics',
  };
  
  const translationKey = featureKeyMap[feature.feature_key];
  const label = translationKey ? t(translationKey) : feature.feature_key;
  
  // Format the value based on type
  let value: string;
  
  if (feature.value_type === 'boolean') {
    value = feature.boolean_value ? t('features.enabled') : t('features.disabled');
  } else if (feature.value_type === 'unlimited') {
    value = t('features.unlimited');
  } else if (feature.value_type === 'limit' && feature.limit_value !== null) {
    value = t('features.upTo', { count: feature.limit_value });
  } else {
    value = t('features.notSpecified');
  }
  
  return { label, value };
}

/**
 * Get localized plan name or description
 */
function getLocalizedText(obj: { en?: string; ar?: string } | string | null | undefined, locale: string, fallback: string = ''): string {
  if (!obj) return fallback;
  if (typeof obj === 'string') return obj;
  return obj[locale as keyof typeof obj] || obj.en || fallback;
}

export function PlansPageClient() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { toast } = useToast();
  const t = useTranslations('billing.plans');
  const tBilling = useTranslations('billing');
  const tErrors = useTranslations('billing.errors');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Downgrade confirmation dialog state
  const [downgradeDialog, setDowngradeDialog] = useState<{
    open: boolean;
    currentPlan: string;
    targetPlan: string;
    targetPlanCode: string;
    billingCycle: BillingCycle;
    periodEndDate?: string;
  }>({
    open: false,
    currentPlan: '',
    targetPlan: '',
    targetPlanCode: '',
    billingCycle: 'annual',
  });

  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscriptionData, refetch: refetchSubscription } = useSubscription();
  const upgradeMutation = useUpgradeSubscription();
  
  // Extract subscription from response
  const subscription = subscriptionData?.subscription;
  const planIsCurrentOffering = subscriptionData?.plan_is_current_offering;
  
  // Get active store from bootstrap
  const activeStore = useBootstrapStore((state) => state.activeStore);

  const handlePlanSelect = async (planCode: string, cycle: BillingCycle) => {
    console.log('[PlansPageClient] handlePlanSelect called', {
      planCode,
      cycle,
      hasPlans: !!plans,
      hasSubscription: !!subscription,
      hasActiveStore: !!activeStore,
    });
    
    if (!plans || !subscription) {
      console.error('[PlansPageClient] Missing plans or subscription', {
        plans: !!plans,
        subscription: !!subscription,
      });
      return;
    }

    // Validate active store exists
    if (!activeStore) {
      console.error('[PlansPageClient] No active store found');
      toast({
        title: tErrors('noActiveStore').split('.')[0],
        description: tErrors('noActiveStore'),
        variant: 'destructive',
      });
      return;
    }

    console.log('[PlansPageClient] Starting plan selection process', {
      storeId: activeStore.id,
      storeName: activeStore.name,
    });

    try {
      setIsProcessing(true);

      const selectedPlan = plans.find((p) => p.code === planCode);
      const currentPlan = plans.find((p) => p.id === subscription.plan?.id);

      console.log('[PlansPageClient] Plan lookup', {
        selectedPlan: selectedPlan ? { id: selectedPlan.id, code: selectedPlan.code } : null,
        currentPlan: currentPlan ? { id: currentPlan.id, code: currentPlan.code } : null,
        subscriptionPlanId: subscription.plan?.id,
        availablePlanIds: plans.map(p => p.id),
      });

      if (!selectedPlan) {
        console.error('[PlansPageClient] Selected plan not found!', { planCode });
        toast({
          title: tErrors('planNotFound').split(':')[0],
          description: tErrors('planNotFound'),
          variant: 'destructive',
        });
        return;
      }
      
      // If current plan not found in available plans (archived/superseded),
      // treat as upgrade (safer than blocking the action)
      if (!currentPlan) {
        console.warn('[PlansPageClient] Current plan not in available plans list', {
          subscriptionPlanId: subscription.plan?.id,
          availablePlanIds: plans.map(p => p.id),
        });
      }

      // Get store ID from active store
      const storeId = activeStore.id;

      // Check if this is a trial subscription without Stripe subscription
      const isTrialWithoutStripe = subscription.status === 'trialing' && !subscription.provider_subscription_id;

      if (isTrialWithoutStripe) {
        // For trial users, create a checkout session for the selected plan
        try {
          // Find the price for the selected plan and billing cycle
          const selectedPlan = plans.find((p) => p.code === planCode);
          if (!selectedPlan) {
            throw new Error(tErrors('planNotFound'));
          }

          const price = selectedPlan.prices.find((p) => p.billing_cycle === cycle);
          if (!price) {
            throw new Error(tErrors('priceNotFound'));
          }

          const payload = {
            plan_price_id: price.id,
            // Note: Stripe will append ?session_id={CHECKOUT_SESSION_ID} automatically if not present
            // Backend validation rejects the {CHECKOUT_SESSION_ID} placeholder, so we omit it
            // and let Stripe handle appending the session ID
            success_url: `${window.location.origin}/merchant/billing/checkout-success`,
            cancel_url: `${window.location.origin}/merchant/billing/plans`,
          };
          
          console.log('Starting checkout with payload:', payload);
          console.log('Selected plan:', selectedPlan);
          console.log('Selected price:', price);
          
          const { url } = await startTrial(payload);
          
          toast({
            title: t('redirectingToCheckout'),
            description: t('settingUpSubscription'),
          });
          
          // Redirect to Stripe Checkout
          if (url) {
            window.location.href = url;
          }
          return;
        } catch (error) {
          // Enhanced error logging for better debugging
          console.error('Checkout creation failed:', {
            error,
            message: error instanceof Error ? error.message : String(error),
            status: (error as any)?.status,
            code: (error as any)?.code,
            errors: (error as any)?.errors,
            stack: error instanceof Error ? error.stack : undefined,
          });
          
          // Extract meaningful error message
          let errorMessage = tErrors('checkoutFailed');
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
            title: tErrors('error'),
            description: errorMessage,
            variant: 'destructive',
          });
          return;
        }
      }

      // Determine if upgrade or downgrade based on sort_order
      // If currentPlan not found (archived/superseded), treat as upgrade for safety
      const isUpgrade = !currentPlan || selectedPlan.sort_order > currentPlan.sort_order;

      console.log('[PlansPageClient] Plan comparison', {
        isUpgrade,
        selectedSortOrder: selectedPlan.sort_order,
        currentSortOrder: currentPlan?.sort_order,
        hasCurrentPlan: !!currentPlan,
      });

      if (isUpgrade) {
        // Handle upgrade - immediate action
        await upgradeMutation.mutateAsync({
          plan_code: planCode,
          billing_cycle: cycle,
          store_id: storeId,
          prorate: true,
        });

        toast({
          title: t('planUpgraded'),
          description: t('upgradedTo', { plan: getLocalizedText(selectedPlan.name, locale, selectedPlan.code) }),
        });
        
        router.push('/merchant/billing');
        router.refresh();
      } else {
        // Handle downgrade - show confirmation dialog first
        // Note: If currentPlan is null, we won't reach here (treated as upgrade above)
        setDowngradeDialog({
          open: true,
          currentPlan: getLocalizedText(currentPlan!.name, locale, currentPlan!.code),
          targetPlan: getLocalizedText(selectedPlan.name, locale, selectedPlan.code),
          targetPlanCode: planCode,
          billingCycle: cycle,
          periodEndDate: subscription.current_period_ends_at || undefined,
        });
      }
    } catch (error) {
      console.error('Plan change failed:', error);
      
      // Extract meaningful error message
      let errorMessage = tErrors('planChangeFailed');
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
        title: tErrors('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDowngradeSuccess = async () => {
    // Refetch subscription to get updated data with pending plan
    await refetchSubscription();
    
    toast({
      title: t('downgradeScheduled'),
      description: t('downgradeMessage', { plan: downgradeDialog.targetPlan }),
    });
    
    // Navigate to billing page to show the pending downgrade info
    router.push('/merchant/billing');
  };

  if (plansLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t('loadingPlans')}</p>
        </div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t('noPlans')}</p>
        </div>
      </div>
    );
  }

  // Sort plans by sort_order
  const sortedPlans = [...plans].sort((a, b) => a.sort_order - b.sort_order);

  // Check if user is on trial without Stripe subscription
  const isTrialWithoutStripe = subscription?.status === 'trialing' && !subscription?.provider_subscription_id;

  // Check if current plan is in the public plans list
  const currentPlanInPublicList = subscription ? sortedPlans.find(p => p.id === subscription.plan?.id) : null;
  const currentPlanIsLegacy = subscription && !currentPlanInPublicList;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/${locale}/merchant/billing`)}
          aria-label={tBilling('backToBilling') || 'Back to billing'}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {isTrialWithoutStripe 
              ? t('trialSubtitle')
              : t('subtitle')}
          </p>
        </div>
      </div>

      {/* Legacy Plan Card - Show if user is on a plan not in public list */}
      {currentPlanIsLegacy && subscription.plan && (
        <div className="border-2 border-warning rounded-lg p-6 bg-warning-bg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold">
                  {getLocalizedText(subscription.plan.name, locale, subscription.plan.code)}
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warning/20 text-warning">
                  {t('yourCurrentPlan')}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-muted-bg text-muted-foreground">
                  {t('legacy')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {t('legacyDescription')}
              </p>
            </div>
          </div>

          {/* Show current plan features if available */}
          {subscription.plan.features && subscription.plan.features.length > 0 && (
            <div className="mt-4 pt-4 border-t border-warning/30">
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                {t('yourCurrentFeatures')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subscription.plan.features.map((feature) => {
                  const { label, value } = formatFeature(feature, t);
                  return (
                    <div key={feature.id} className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-success flex-shrink-0 mt-0.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      <div className="text-sm">
                        <span className="font-medium">
                          {label}:
                        </span>{' '}
                        <span className="text-muted-foreground">
                          {value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show pricing info if available */}
          {subscription.plan.prices && subscription.plan.prices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-warning/30">
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                {t('yourCurrentPricing')}
              </h4>
              <div className="flex gap-4 flex-wrap">
                {subscription.plan.prices
                  .filter((price) => price.is_active)
                  .map((price) => (
                    <div key={price.id} className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {price.currency === 'USD' ? '$' : price.currency}
                        {(price.amount_cents / 100).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {price.billing_cycle}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Available Prompt - Show if plan has been superseded */}
      {currentPlanIsLegacy && subscription.plan?.superseded_by_plan_id && (() => {
        // Find the new plan version in the public plans list
        const newPlanVersion = sortedPlans.find(p => p.id === subscription.plan?.superseded_by_plan_id);
        
        if (!newPlanVersion) {
          return null; // New plan not found in public plans
        }

        const handleViewNewPlan = () => {
          // Scroll to the new plan card in the grid
          const planCard = document.getElementById(`plan-card-${newPlanVersion.id}`);
          if (planCard) {
            planCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a highlight effect
            planCard.classList.add('ring-4', 'ring-primary', 'ring-offset-2');
            setTimeout(() => {
              planCard.classList.remove('ring-4', 'ring-primary', 'ring-offset-2');
            }, 3000);
          }
        };

        const handleUpgradeToCurrentVersion = async () => {
          try {
            setIsProcessing(true);
            
            // Use the dedicated move-to-current-version endpoint
            // This bypasses tier checking for same-tier plan version updates
            await moveToCurrentPlanVersion();
            
            toast({
              title: t('planUpdated'),
              description: t('movedToPlan', { plan: getLocalizedText(newPlanVersion.name, locale, newPlanVersion.code) }),
            });
            
            // Refetch subscription data
            await refetchSubscription();
            
            // Redirect to billing page
            router.push('/merchant/billing');
            router.refresh();
          } catch (error) {
            console.error('Move to current version failed:', error);
            
            let errorMessage = tErrors('planUpdateFailed');
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
              title: tErrors('error'),
              description: errorMessage,
              variant: 'destructive',
            });
          } finally {
            setIsProcessing(false);
          }
        };

        return (
          <Alert className="border-primary bg-primary/5">
            <Sparkles className="h-5 w-5 text-primary" />
            <AlertTitle className="flex items-center gap-2 text-lg font-semibold">
              {t('newVersionAvailable')}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  {t('newVersionDescription', { plan: getLocalizedText(newPlanVersion.name, locale, newPlanVersion.code) })}
                </p>
                
                {/* Show key differences if available */}
                {newPlanVersion.features && subscription.plan.features && (
                  <div className="text-sm">
                    <p className="font-medium mb-2 text-foreground">{t('whatsNewInVersion')}</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {newPlanVersion.features.slice(0, 3).map((feature) => {
                        const { label, value } = formatFeature(feature, t);
                        return (
                          <li key={feature.id} className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{label}: {value}</span>
                          </li>
                        );
                      })}
                      {newPlanVersion.features.length > 3 && (
                        <li className="text-xs italic">{t('andMoreFeatures')}</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleViewNewPlan}
                    variant="default"
                    size="sm"
                    className="gap-2"
                  >
                    <Info className="h-4 w-4" />
                    {t('viewNewPlan')}
                  </Button>
                  <Button
                    onClick={handleUpgradeToCurrentVersion}
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('upgradeNow')}
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        );
      })()}

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-4 rounded-lg border p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            {t('monthly')}
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            {t('annual')}
            <span className="ms-1 text-xs">{t('savePercentage')}</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
        {sortedPlans.map((plan, index) => (
          <div key={plan.id} id={`plan-card-${plan.id}`} className="transition-all duration-300">
            <PlanCard
              plan={plan}
              billingCycle={billingCycle}
              // Only highlight if: not trial AND plan is in public list AND matches subscription
              isCurrent={!isTrialWithoutStripe && !currentPlanIsLegacy && subscription?.plan?.id === plan.id}
              isPopular={index === 1} // Middle plan is popular
              onSelect={handlePlanSelect}
              disabled={isProcessing}
            />
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <PlanComparisonTable plans={sortedPlans} />

      {/* Downgrade Confirmation Dialog */}
      <DowngradeConfirmDialog
        open={downgradeDialog.open}
        onOpenChange={(open) => setDowngradeDialog({ ...downgradeDialog, open })}
        currentPlan={downgradeDialog.currentPlan}
        targetPlan={downgradeDialog.targetPlan}
        targetPlanCode={downgradeDialog.targetPlanCode}
        billingCycle={downgradeDialog.billingCycle}
        periodEndDate={downgradeDialog.periodEndDate}
        onSuccess={handleDowngradeSuccess}
      />
    </div>
  );
}
