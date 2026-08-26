/**
 * Plan Card (Client Component for click handling)
 * Individual subscription plan display card
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Plan, BillingCycle } from '@/types/billing/plan';

/**
 * Get localized text from a translation object
 */
function getLocalizedText(obj: { en?: string; ar?: string } | string | null | undefined, locale: string, fallback: string = ''): string {
  if (!obj) return fallback;
  if (typeof obj === 'string') return obj;
  return obj[locale as keyof typeof obj] || obj.en || fallback;
}

/**
 * Get localized feature label
 */
function getFeatureLabel(featureKey: string, locale: string): string {
  // Map of feature keys to translation keys
  const featureTranslations: Record<string, { ar: string; en: string }> = {
    'stores.max': { en: 'Stores', ar: 'المتاجر' },
    'products.max': { en: 'Products', ar: 'المنتجات' },
    'users.max': { en: 'Team Members', ar: 'أعضاء الفريق' },
    'custom_domain.enabled': { en: 'Custom Domain', ar: 'نطاق مخصص' },
    'api.access': { en: 'API Access', ar: 'الوصول إلى API' },
    'webhooks.enabled': { en: 'Webhooks', ar: 'Webhooks' },
    'support.priority': { en: 'Priority Support', ar: 'دعم ذو أولوية' },
    'analytics.advanced': { en: 'Advanced Analytics', ar: 'تحليلات متقدمة' },
  };
  
  const translation = featureTranslations[featureKey];
  if (translation) {
    return locale === 'ar' ? translation.ar : translation.en;
  }
  
  // Fallback: format the key nicely
  return featureKey.replace(/_/g, ' ').replace(/\./g, ' - ');
}

interface PlanCardProps {
  plan: Plan;
  billingCycle: BillingCycle;
  isCurrent?: boolean;
  isPopular?: boolean;
  onSelect?: (planCode: string, billingCycle: BillingCycle) => void;
  disabled?: boolean;
}

export function PlanCard({
  plan,
  billingCycle,
  isCurrent = false,
  isPopular = false,
  onSelect,
  disabled = false,
}: PlanCardProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('billing.plans');
  const price = plan.prices.find((p) => p.billing_cycle === billingCycle);

  if (!price) {
    return null;
  }

  const formatPrice = (amountCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountCents / 100);
  };

  const handleSelect = () => {
    console.log('[PlanCard] handleSelect called', {
      planCode: plan.code,
      billingCycle,
      isCurrent,
      disabled,
      hasOnSelect: !!onSelect,
    });
    
    if (onSelect && !isCurrent && !disabled) {
      console.log('[PlanCard] Calling onSelect');
      onSelect(plan.code, billingCycle);
    } else {
      console.log('[PlanCard] Not calling onSelect', {
        onSelect: !!onSelect,
        isCurrent,
        disabled,
      });
    }
  };

  // Sort features by display order (if available) or alphabetically
  const sortedFeatures = [...plan.features].sort((a, b) => a.id - b.id);

  return (
    <div className={isPopular ? 'relative pt-4' : ''}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <Badge variant="default" className="whitespace-nowrap">
            {t('popular')}
          </Badge>
        </div>
      )}
      <Card className={`relative h-full ${isPopular ? 'border-primary shadow-lg' : ''}`}>

      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-2xl uppercase tracking-wide">
            {getLocalizedText(plan.name, locale, plan.code)}
          </CardTitle>
          {plan.description && <CardDescription>{getLocalizedText(plan.description, locale)}</CardDescription>}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{formatPrice(price.amount_cents)}</span>
          <span className="text-muted-foreground">
            {billingCycle === 'annual' ? t('perYear') : t('perMonth')}
          </span>
        </div>

        {billingCycle === 'annual' && (
          <div className="text-sm text-muted-foreground">
            {formatPrice(price.amount_cents / 12)}{t('perMonth')} {t('billedAnnually')}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features List */}
        <ul className="space-y-3" role="list">
          {sortedFeatures.map((feature) => {
            const displayValue =
              feature.value_type === 'limit' || feature.value_type === 'quota'
                ? feature.limit_value
                : feature.boolean_value
                  ? t('included')
                  : null;

            return (
              <li key={feature.id} className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-success" />
                <div>
                  <div className="text-sm font-medium">
                    {getFeatureLabel(feature.feature_key, locale)}
                  </div>
                  {displayValue && (
                    <div className="text-xs text-muted-foreground">
                      {typeof displayValue === 'number'
                        ? t('upTo', { count: displayValue.toLocaleString() })
                        : displayValue}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Action Button */}
        <Button
          className="w-full"
          variant={isPopular ? 'default' : 'outline'}
          onClick={handleSelect}
          disabled={isCurrent || disabled}
        >
          {isCurrent ? t('currentPlan') : t('selectPlan', { plan: getLocalizedText(plan.name, locale, plan.code) })}
        </Button>
      </CardContent>
    </Card>
    </div>
  );
}
