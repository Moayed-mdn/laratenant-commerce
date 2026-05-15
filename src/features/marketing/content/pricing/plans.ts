// =============================================================================
// Pricing — Plans Content
//
// Pricing plan definitions for PricingSection.
// Prices are numeric for display logic (interval toggle).
// Translatable labels (plan name, description, feature labels, cta)
// come from i18n via page-level wiring.
//
// Rules:
//   - no fake discounts or fake scarcity
//   - prices are honest placeholders — update before launch
//   - null price = contact sales tier
//   - feature list is ordered: included first, then excluded
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const plans = getPricingPlans(t)
//   <PricingSection
//     heading={t('pricing.heading')}
//     subtitle={t('pricing.subtitle')}
//     plans={plans}
//   />
// =============================================================================

import type { PricingPlan } from '@/features/marketing/types'

export function getPricingPlans(
  t: (key: string) => string,
): PricingPlan[] {
  return [
    {
      id: 'starter',
      name: t('pricing.plans.starter.name'),
      description: t('pricing.plans.starter.description'),
      monthlyPrice: 29,
      annualPrice: 290,
      currency: '$',
      highlighted: false,
      ctaLabel: t('pricing.plans.starter.cta'),
      ctaHref: '/register?plan=starter',
      features: [
        { label: t('pricing.features.stores1'),       included: true  },
        { label: t('pricing.features.products500'),   included: true  },
        { label: t('pricing.features.orders1k'),      included: true  },
        { label: t('pricing.features.analytics'),     included: true  },
        { label: t('pricing.features.localization'),  included: false },
        { label: t('pricing.features.multiCurrency'), included: false },
        { label: t('pricing.features.apiAccess'),     included: false },
        { label: t('pricing.features.prioritySupport'),included: false},
      ],
    },
    {
      id: 'growth',
      name: t('pricing.plans.growth.name'),
      description: t('pricing.plans.growth.description'),
      monthlyPrice: 79,
      annualPrice: 790,
      currency: '$',
      highlighted: true,
      ctaLabel: t('pricing.plans.growth.cta'),
      ctaHref: '/register?plan=growth',
      features: [
        { label: t('pricing.features.stores5'),        included: true  },
        { label: t('pricing.features.productsUnlimited'), included: true },
        { label: t('pricing.features.orders10k'),      included: true  },
        { label: t('pricing.features.analytics'),      included: true  },
        { label: t('pricing.features.localization'),   included: true  },
        { label: t('pricing.features.multiCurrency'),  included: true  },
        { label: t('pricing.features.apiAccess'),      included: true  },
        { label: t('pricing.features.prioritySupport'),included: false },
      ],
    },
    {
      id: 'enterprise',
      name: t('pricing.plans.enterprise.name'),
      description: t('pricing.plans.enterprise.description'),
      monthlyPrice: null,
      annualPrice: null,
      currency: '$',
      highlighted: false,
      ctaLabel: t('pricing.plans.enterprise.cta'),
      ctaHref: '/contact',
      features: [
        { label: t('pricing.features.storesUnlimited'),   included: true },
        { label: t('pricing.features.productsUnlimited'), included: true },
        { label: t('pricing.features.ordersUnlimited'),   included: true },
        { label: t('pricing.features.analytics'),         included: true },
        { label: t('pricing.features.localization'),      included: true },
        { label: t('pricing.features.multiCurrency'),     included: true },
        { label: t('pricing.features.apiAccess'),         included: true },
        { label: t('pricing.features.prioritySupport'),   included: true },
      ],
    },
  ]
}
