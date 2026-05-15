#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# LaraTenant Commerce — Marketing Site
# Phase 3: Content Files (Steps 15–23)
# content/homepage/* and content/pricing/*
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKETING="$PROJECT_ROOT/src/features/marketing"
CONTENT="$MARKETING/content"

echo "→ Writing Phase 3 content files..."

# =============================================================================
# STEP 15 — content/homepage/hero.ts
# =============================================================================

cat > "$CONTENT/homepage/hero.ts" << 'EOF'
// =============================================================================
// Homepage — Hero Content
//
// Structural and non-translatable content for the hero section.
// Translatable strings (headline, subtext, cta labels) come from i18n.
// This file owns: preview alt, badge key, CTA hrefs.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const hero = getHeroContent(t)
//   <HeroSection {...hero} />
// =============================================================================

import {
  CTA_START_SELLING,
  CTA_VIEW_DEMO,
} from '@/features/marketing/constants/cta-links'
import type { HeroContent } from '@/features/marketing/types'

export function getHeroContent(
  t: (key: string) => string,
): HeroContent {
  return {
    badge: t('home.hero.badge'),
    headline: t('home.hero.headline'),
    subtext: t('home.hero.subtext'),
    primaryCta: {
      label: t('home.hero.primaryCta'),
      href: CTA_START_SELLING.href,
    },
    secondaryCta: {
      label: t('home.hero.secondaryCta'),
      href: CTA_VIEW_DEMO.href,
    },
    previewAlt: t('home.hero.previewAlt'),
  }
}
EOF

echo "✓ content/homepage/hero.ts"

# =============================================================================
# STEP 16 — content/homepage/features.ts
# =============================================================================

cat > "$CONTENT/homepage/features.ts" << 'EOF'
// =============================================================================
// Homepage — Feature Grid Content
//
// Feature items for the FeatureGridSection.
// Icons are emoji — swap for icon component keys when design system matures.
// Translatable strings come from i18n via page-level wiring.
// Structural data (id, icon) lives here.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const features = getFeatureItems(t)
//   <FeatureGridSection
//     heading={t('home.features.heading')}
//     subtitle={t('home.features.subtitle')}
//     items={features}
//   />
// =============================================================================

import type { FeatureItem } from '@/features/marketing/types'

const FEATURE_IDS = [
  'multi-store',
  'orders',
  'products',
  'analytics',
  'localization',
  'permissions',
  'performance',
  'api',
] as const

const FEATURE_ICONS: Record<(typeof FEATURE_IDS)[number], string> = {
  'multi-store':   '🏪',
  'orders':        '📦',
  'products':      '🗂️',
  'analytics':     '📊',
  'localization':  '🌐',
  'permissions':   '🔐',
  'performance':   '⚡',
  'api':           '🔌',
}

export function getFeatureItems(
  t: (key: string) => string,
): FeatureItem[] {
  return FEATURE_IDS.map((id) => ({
    id,
    icon: FEATURE_ICONS[id],
    title: t(`home.features.items.${id}.title`),
    description: t(`home.features.items.${id}.description`),
  }))
}
EOF

echo "✓ content/homepage/features.ts"

# =============================================================================
# STEP 17 — content/homepage/showcase.ts
# =============================================================================

cat > "$CONTENT/homepage/showcase.ts" << 'EOF'
// =============================================================================
// Homepage — Dashboard Showcase Content
//
// Content for the DashboardShowcaseSection split layout.
// Translatable strings come from i18n via page-level wiring.
// previewSrc is undefined until a real screenshot asset is provided.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const showcase = getShowcaseContent(t)
//   <DashboardShowcaseSection {...showcase} />
// =============================================================================

import { CTA_START_SELLING } from '@/features/marketing/constants/cta-links'
import type { ShowcaseContent } from '@/features/marketing/types'

export function getShowcaseContent(
  t: (key: string) => string,
): ShowcaseContent {
  return {
    heading: t('home.showcase.heading'),
    subtext: t('home.showcase.subtext'),
    cta: {
      label: t('home.showcase.cta'),
      href: CTA_START_SELLING.href,
    },
    previewAlt: t('home.showcase.previewAlt'),
    // previewSrc: '/images/dashboard-screenshot.png',
    // Uncomment and set when real asset is available.
    // DashboardPreview renders coded mockup when undefined.
  }
}
EOF

echo "✓ content/homepage/showcase.ts"

# =============================================================================
# STEP 18 — content/homepage/testimonials.ts
# =============================================================================

cat > "$CONTENT/homepage/testimonials.ts" << 'EOF'
// =============================================================================
// Homepage — Testimonials Content
//
// Testimonial items for TestimonialsSection.
//
// Rules:
//   - no fake companies, no fake metrics, no fabricated names
//   - content uses placeholder-safe representative merchant roles
//   - replace with real testimonials before production launch
//   - avatarSrc is undefined — initials fallback renders automatically
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const testimonials = getTestimonials(t)
//   <TestimonialsSection
//     heading={t('home.testimonials.heading')}
//     items={testimonials}
//   />
// =============================================================================

import type { TestimonialItem } from '@/features/marketing/types'

const TESTIMONIAL_IDS = [
  'merchant-a',
  'merchant-b',
  'merchant-c',
  'merchant-d',
  'merchant-e',
  'merchant-f',
] as const

export function getTestimonials(
  t: (key: string) => string,
): TestimonialItem[] {
  return TESTIMONIAL_IDS.map((id) => ({
    id,
    quote: t(`home.testimonials.items.${id}.quote`),
    authorName: t(`home.testimonials.items.${id}.authorName`),
    authorRole: t(`home.testimonials.items.${id}.authorRole`),
    authorCompany: t(`home.testimonials.items.${id}.authorCompany`),
    // avatarSrc: undefined — initials fallback active
  }))
}
EOF

echo "✓ content/homepage/testimonials.ts"

# =============================================================================
# STEP 19 — content/homepage/logos.ts
# =============================================================================

cat > "$CONTENT/homepage/logos.ts" << 'EOF'
// =============================================================================
// Homepage — Logo Cloud Content
//
// Logo items for LogoCloudSection.
//
// Rules:
//   - only real brand assets when available
//   - placeholder entries use name only — no fake brand imagery
//   - src paths are relative to /public
//   - width/height prevent CLS — match actual asset dimensions
//   - replace placeholder entries before production launch
//
// Page wiring pattern:
//   const logos = getLogoItems()
//   <LogoCloudSection
//     items={logos}
//     label={t('home.logos.label')}
//   />
// =============================================================================

import type { LogoItem } from '@/features/marketing/types'

export function getLogoItems(): LogoItem[] {
  // Replace with real partner/customer logo assets before launch.
  // Placeholder entries intentionally have generic names.
  return [
    { name: 'Brand One',   src: '/logos/brand-one.svg',   width: 120, height: 32 },
    { name: 'Brand Two',   src: '/logos/brand-two.svg',   width: 100, height: 32 },
    { name: 'Brand Three', src: '/logos/brand-three.svg', width: 130, height: 32 },
    { name: 'Brand Four',  src: '/logos/brand-four.svg',  width: 110, height: 32 },
    { name: 'Brand Five',  src: '/logos/brand-five.svg',  width: 120, height: 32 },
  ]
}
EOF

echo "✓ content/homepage/logos.ts"

# =============================================================================
# STEP 20 — content/homepage/faqs.ts
# =============================================================================

cat > "$CONTENT/homepage/faqs.ts" << 'EOF'
// =============================================================================
// Homepage — FAQ Content
//
// FAQ items for the homepage FAQSection.
// Translatable strings come from i18n via page-level wiring.
// IDs are stable — used as accordion keys and JSON-LD entity identifiers.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const faqs = getHomepageFAQs(t)
//   <FAQSection
//     heading={t('home.faq.heading')}
//     items={faqs}
//   />
//   <script
//     type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
//   />
// =============================================================================

import type { FAQItem } from '@/features/marketing/types'

const FAQ_IDS = [
  'what-is-laratenant',
  'multi-store-support',
  'localization-support',
  'how-to-get-started',
  'enterprise-options',
  'data-security',
] as const

export function getHomepageFAQs(
  t: (key: string) => string,
): FAQItem[] {
  return FAQ_IDS.map((id) => ({
    id,
    question: t(`home.faq.items.${id}.question`),
    answer: t(`home.faq.items.${id}.answer`),
  }))
}
EOF

echo "✓ content/homepage/faqs.ts"

# =============================================================================
# STEP 21 — content/homepage/cta.ts
# =============================================================================

cat > "$CONTENT/homepage/cta.ts" << 'EOF'
// =============================================================================
// Homepage — Final CTA Content
//
// Content for the closing CTASection.
// Translatable strings come from i18n via page-level wiring.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const cta = getHomepageCTA(t)
//   <CTASection {...cta} />
// =============================================================================

import {
  CTA_START_SELLING,
  CTA_VIEW_DEMO,
} from '@/features/marketing/constants/cta-links'
import type { CTAContent } from '@/features/marketing/types'

export function getHomepageCTA(
  t: (key: string) => string,
): CTAContent {
  return {
    title: t('home.cta.title'),
    description: t('home.cta.description'),
    primaryCta: {
      label: t('home.cta.primaryCta'),
      href: CTA_START_SELLING.href,
    },
    secondaryCta: {
      label: t('home.cta.secondaryCta'),
      href: CTA_VIEW_DEMO.href,
    },
  }
}
EOF

echo "✓ content/homepage/cta.ts"

# =============================================================================
# STEP 22 — content/pricing/plans.ts
# =============================================================================

cat > "$CONTENT/pricing/plans.ts" << 'EOF'
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
EOF

echo "✓ content/pricing/plans.ts"

# =============================================================================
# STEP 23 — content/pricing/faqs.ts
# =============================================================================

cat > "$CONTENT/pricing/faqs.ts" << 'EOF'
// =============================================================================
// Pricing — FAQ Content
//
// FAQ items specific to the /pricing page.
// Separate from homepage FAQs — different questions, different JSON-LD scope.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const faqs = getPricingFAQs(t)
//   <FAQSection
//     heading={t('pricing.faq.heading')}
//     items={faqs}
//   />
//   <script
//     type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
//   />
// =============================================================================

import type { FAQItem } from '@/features/marketing/types'

const PRICING_FAQ_IDS = [
  'free-trial',
  'change-plan',
  'annual-discount',
  'cancel-anytime',
  'payment-methods',
  'enterprise-custom',
] as const

export function getPricingFAQs(
  t: (key: string) => string,
): FAQItem[] {
  return PRICING_FAQ_IDS.map((id) => ({
    id,
    question: t(`pricing.faq.items.${id}.question`),
    answer: t(`pricing.faq.items.${id}.answer`),
  }))
}
EOF

echo "✓ content/pricing/faqs.ts"

# =============================================================================
# STEP 23b — content/features/feature-list.ts (reserved)
# =============================================================================

cat > "$CONTENT/features/feature-list.ts" << 'EOF'
// =============================================================================
// Features Page — Feature List Content
//
// Extended feature content for the /features marketing page.
// More detailed than homepage feature grid items.
// Reserved — populate when /features page is built.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const features = getExtendedFeatures(t)
//   <FeatureGridSection heading={...} items={features} />
// =============================================================================

import type { FeatureItem } from '@/features/marketing/types'

export function getExtendedFeatures(
  _t: (key: string) => string,
): FeatureItem[] {
  // Populate when /features page is implemented.
  return []
}
EOF

echo "✓ content/features/feature-list.ts"

# =============================================================================
# STEP 23c — content/enterprise/highlights.ts (reserved)
# =============================================================================

cat > "$CONTENT/enterprise/highlights.ts" << 'EOF'
// =============================================================================
// Enterprise Page — Highlights Content
//
// Reserved for /enterprise marketing page content.
// Populate when /enterprise page is built.
// =============================================================================

export function getEnterpriseHighlights(
  _t: (key: string) => string,
): { id: string; title: string; description: string }[] {
  // Populate when /enterprise page is implemented.
  return []
}
EOF

echo "✓ content/enterprise/highlights.ts"

# =============================================================================
# STEP 23d — content/templates/template-list.ts (reserved)
# =============================================================================

cat > "$CONTENT/templates/template-list.ts" << 'EOF'
// =============================================================================
// Templates Page — Template List Content
//
// Reserved for /templates marketing page content.
// Populate when /templates page is built.
// =============================================================================

export interface TemplateItem {
  id: string
  name: string
  description: string
  previewSrc?: string
  category: string
  href: string
}

export function getTemplates(
  _t: (key: string) => string,
): TemplateItem[] {
  // Populate when /templates page is implemented.
  return []
}
EOF

echo "✓ content/templates/template-list.ts"

# =============================================================================
# Done
# =============================================================================

echo ""
echo "============================================="
echo " Phase 3 Complete — Content Files"
echo "============================================="
echo ""
echo " Homepage content:"
echo "   content/homepage/hero.ts"
echo "   content/homepage/features.ts"
echo "   content/homepage/showcase.ts"
echo "   content/homepage/testimonials.ts"
echo "   content/homepage/logos.ts"
echo "   content/homepage/faqs.ts"
echo "   content/homepage/cta.ts"
echo ""
echo " Pricing content:"
echo "   content/pricing/plans.ts"
echo "   content/pricing/faqs.ts"
echo ""
echo " Reserved content stubs:"
echo "   content/features/feature-list.ts"
echo "   content/enterprise/highlights.ts"
echo "   content/templates/template-list.ts"
echo ""
echo " Content ownership model:"
echo "   Sections receive typed props only."
echo "   Pages wire content/* to sections."
echo "   CMS replaces content/* resolvers — sections unchanged."
echo ""
echo " Next: Phase 4 — Sections (Steps 24–31)"
echo "   HeroSection, LogoCloudSection, FeatureGridSection,"
echo "   DashboardShowcaseSection, TestimonialsSection,"
echo "   PricingSection, FAQSection, CTASection"
echo "============================================="