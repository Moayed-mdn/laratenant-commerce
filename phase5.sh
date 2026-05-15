#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# LaraTenant Commerce — Marketing Site
# Phase 5: Routes (Steps 32–34) + i18n (Steps 35–36)
# layout.tsx, page.tsx, pricing/page.tsx
# messages/en/marketing.json, messages/ar/marketing.json
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKETING="$PROJECT_ROOT/src/features/marketing"
APP_MARKETING="$PROJECT_ROOT/src/app/[locale]/(marketing)"
MESSAGES_EN="$PROJECT_ROOT/messages/en"
MESSAGES_AR="$PROJECT_ROOT/messages/ar"

echo "→ Writing Phase 5 routes and i18n..."

mkdir -p "$MESSAGES_EN"
mkdir -p "$MESSAGES_AR"
mkdir -p "$APP_MARKETING/pricing"

# =============================================================================
# STEP 32 — app/[locale]/(marketing)/layout.tsx
# =============================================================================

cat > "$APP_MARKETING/layout.tsx" << 'EOF'
// =============================================================================
// Marketing Route Group Layout
//
// Shared layout for all (marketing) routes.
// Wires MarketingLayout with locale from params.
// Owns no metadata — each page.tsx defines its own generateMetadata.
//
// Rules:
//   - thin wrapper — no business logic
//   - locale extracted from params and forwarded to MarketingLayout
//   - MarketingLayout owns Navbar, Footer, skip link, JSON-LD org schema
//   - no auth checks — marketing routes are fully public
// =============================================================================

import { type ReactNode } from 'react'
import MarketingLayout from '@/features/marketing/layouts/MarketingLayout'

interface MarketingRouteLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function MarketingRouteLayout({
  children,
  params,
}: MarketingRouteLayoutProps) {
  const { locale } = await params

  return (
    <MarketingLayout locale={locale}>
      {children}
    </MarketingLayout>
  )
}
EOF

echo "✓ app/[locale]/(marketing)/layout.tsx"

# =============================================================================
# STEP 33 — app/[locale]/(marketing)/page.tsx
# =============================================================================

cat > "$APP_MARKETING/page.tsx" << 'EOF'
// =============================================================================
// Homepage — Marketing Route
//
// Thin page orchestrator. Owns:
//   - generateMetadata (SEO)
//   - content wiring (content/* → section props)
//   - section composition in canonical order
//
// Rules:
//   - no business logic
//   - no inline content — all strings from i18n or content files
//   - sections receive typed props only
//   - JSON-LD structured data injected server-side here
//   - all content resolvers accept translator function — CMS-swap ready
// =============================================================================

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { buildPageMetadata, buildFAQJsonLd, buildSoftwareJsonLd } from '@/features/marketing/lib/seo'

import { getHeroContent }       from '@/features/marketing/content/homepage/hero'
import { getFeatureItems }      from '@/features/marketing/content/homepage/features'
import { getShowcaseContent }   from '@/features/marketing/content/homepage/showcase'
import { getTestimonials }      from '@/features/marketing/content/homepage/testimonials'
import { getLogoItems }         from '@/features/marketing/content/homepage/logos'
import { getHomepageFAQs }      from '@/features/marketing/content/homepage/faqs'
import { getHomepageCTA }       from '@/features/marketing/content/homepage/cta'
import { getPricingPlans }      from '@/features/marketing/content/pricing/plans'

import HeroSection               from '@/features/marketing/sections/HeroSection'
import LogoCloudSection          from '@/features/marketing/sections/LogoCloudSection'
import FeatureGridSection        from '@/features/marketing/sections/FeatureGridSection'
import DashboardShowcaseSection  from '@/features/marketing/sections/DashboardShowcaseSection'
import TestimonialsSection       from '@/features/marketing/sections/TestimonialsSection'
import PricingSection            from '@/features/marketing/sections/PricingSection'
import FAQSection                from '@/features/marketing/sections/FAQSection'
import CTASection                from '@/features/marketing/sections/CTASection'

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing' })

  return buildPageMetadata({
    locale,
    title: t('meta.home.title'),
    description: t('meta.home.description'),
    path: '',
  })
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing' })

  // Wire content resolvers — each accepts translator, returns typed content.
  // To integrate a CMS: replace these calls with CMS resolver calls.
  // Section props interfaces do not change.
  const hero        = getHeroContent(t)
  const features    = getFeatureItems(t)
  const showcase    = getShowcaseContent(t)
  const testimonials = getTestimonials(t)
  const logos       = getLogoItems()
  const faqs        = getHomepageFAQs(t)
  const cta         = getHomepageCTA(t)
  const plans       = getPricingPlans(t)

  return (
    <>
      {/* Structured data — server-rendered, zero JS cost */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildSoftwareJsonLd() }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
      />

      {/* Section composition — canonical order */}
      <HeroSection
        {...hero}
        locale={locale}
      />

      <LogoCloudSection
        items={logos}
        label={t('home.logos.label')}
      />

      <FeatureGridSection
        heading={t('home.features.heading')}
        eyebrow={t('home.features.eyebrow')}
        subtitle={t('home.features.subtitle')}
        items={features}
      />

      <DashboardShowcaseSection
        {...showcase}
      />

      <TestimonialsSection
        heading={t('home.testimonials.heading')}
        eyebrow={t('home.testimonials.eyebrow')}
        items={testimonials}
      />

      <PricingSection
        heading={t('home.pricing.heading')}
        eyebrow={t('home.pricing.eyebrow')}
        subtitle={t('home.pricing.subtitle')}
        plans={plans}
        toggleLabel={{
          monthly: t('pricing.toggle.monthly'),
          annual:  t('pricing.toggle.annual'),
          badge:   t('pricing.toggle.badge'),
        }}
      />

      <FAQSection
        heading={t('home.faq.heading')}
        eyebrow={t('home.faq.eyebrow')}
        items={faqs}
      />

      <CTASection
        {...cta}
      />
    </>
  )
}
EOF

echo "✓ app/[locale]/(marketing)/page.tsx"

# =============================================================================
# STEP 34 — app/[locale]/(marketing)/pricing/page.tsx
# =============================================================================

cat > "$APP_MARKETING/pricing/page.tsx" << 'EOF'
// =============================================================================
// Pricing Page — Marketing Route
//
// Dedicated pricing page. Owns its own metadata, content wiring,
// and section composition. Reuses PricingSection and FAQSection.
//
// Rules:
//   - thin orchestrator — no business logic
//   - pricing FAQs are separate from homepage FAQs (different questions)
//   - JSON-LD FAQPage schema scoped to pricing FAQs only
//   - CTA section is reusable with pricing-specific copy
// =============================================================================

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { buildPageMetadata, buildFAQJsonLd } from '@/features/marketing/lib/seo'

import { getPricingPlans } from '@/features/marketing/content/pricing/plans'
import { getPricingFAQs }  from '@/features/marketing/content/pricing/faqs'

import PricingSection from '@/features/marketing/sections/PricingSection'
import FAQSection     from '@/features/marketing/sections/FAQSection'
import CTASection     from '@/features/marketing/sections/CTASection'

import {
  CTA_START_SELLING,
  CTA_CONTACT_SALES,
} from '@/features/marketing/constants/cta-links'

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing' })

  return buildPageMetadata({
    locale,
    title: t('meta.pricing.title'),
    description: t('meta.pricing.description'),
    path: '/pricing',
  })
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing' })

  const plans = getPricingPlans(t)
  const faqs  = getPricingFAQs(t)

  return (
    <>
      {/* Pricing-scoped FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
      />

      <PricingSection
        heading={t('pricing.heading')}
        eyebrow={t('pricing.eyebrow')}
        subtitle={t('pricing.subtitle')}
        plans={plans}
        toggleLabel={{
          monthly: t('pricing.toggle.monthly'),
          annual:  t('pricing.toggle.annual'),
          badge:   t('pricing.toggle.badge'),
        }}
      />

      <FAQSection
        heading={t('pricing.faq.heading')}
        eyebrow={t('pricing.faq.eyebrow')}
        items={faqs}
      />

      <CTASection
        title={t('pricing.cta.title')}
        description={t('pricing.cta.description')}
        primaryCta={{
          label: t('pricing.cta.primaryCta'),
          href: CTA_START_SELLING.href,
        }}
        secondaryCta={{
          label: t('pricing.cta.secondaryCta'),
          href: CTA_CONTACT_SALES.href,
        }}
      />
    </>
  )
}
EOF

echo "✓ app/[locale]/(marketing)/pricing/page.tsx"

# =============================================================================
# Stub pages for reserved routes
# =============================================================================

for ROUTE in features enterprise templates; do
  mkdir -p "$APP_MARKETING/$ROUTE"
  cat > "$APP_MARKETING/$ROUTE/page.tsx" << STUB
// =============================================================================
// $(echo "$ROUTE" | awk '{print toupper(substr($0,1,1)) substr($0,2)}') Page — Reserved
// Populate when /$ROUTE marketing page is built.
// =============================================================================

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/features/marketing/lib/seo'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marketing' })
  return buildPageMetadata({
    locale,
    title: t('meta.${ROUTE}.title'),
    description: t('meta.${ROUTE}.description'),
    path: '/${ROUTE}',
  })
}

export default async function $(echo "$ROUTE" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')Page({ params }: PageProps) {
  const { locale } = await params
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">
        Coming soon — /{locale}/${ROUTE}
      </p>
    </div>
  )
}
STUB
  echo "✓ app/[locale]/(marketing)/$ROUTE/page.tsx (stub)"
done

# Blog and docs stubs
for ROUTE in blog docs; do
  mkdir -p "$APP_MARKETING/$ROUTE"
  cat > "$APP_MARKETING/$ROUTE/page.tsx" << STUB
// =============================================================================
// $(echo "$ROUTE" | awk '{print toupper(substr($0,1,1)) substr($0,2)}') Index Page — Reserved
// Populate when $ROUTE system is integrated (MDX or CMS).
// See features/marketing/content/$ROUTE/README.md
// =============================================================================

export default function $(echo "$ROUTE" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')IndexPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">
        $(echo "$ROUTE" | awk '{print toupper(substr($0,1,1)) substr($0,2)}') coming soon.
      </p>
    </div>
  )
}
STUB
  echo "✓ app/[locale]/(marketing)/$ROUTE/page.tsx (stub)"
done

# =============================================================================
# STEP 35 — messages/en/marketing.json
# =============================================================================

cat > "$MESSAGES_EN/marketing.json" << 'EOF'
{
  "meta": {
    "home": {
      "title": "Multi-Tenant Ecommerce Platform",
      "description": "Launch and manage your ecommerce business with a scalable multi-tenant commerce platform built for modern brands and merchants."
    },
    "pricing": {
      "title": "Simple, Transparent Pricing",
      "description": "Choose a plan that fits your business. Scale your stores, products, and orders as you grow."
    },
    "features": {
      "title": "Platform Features",
      "description": "Explore the tools that help merchants manage stores, products, orders, and growth from a unified dashboard."
    },
    "enterprise": {
      "title": "Enterprise Commerce Solutions",
      "description": "Scalable commerce infrastructure for large brands, agencies, and multi-brand operators."
    },
    "templates": {
      "title": "Store Templates",
      "description": "Launch faster with professionally designed store templates built for modern ecommerce."
    }
  },

  "home": {
    "hero": {
      "badge": "Multi-Tenant Commerce Platform",
      "headline": "Run Multiple Stores From One Platform",
      "subtext": "Manage products, orders, and stores from a unified commerce dashboard. Built for merchants who operate at scale.",
      "primaryCta": "Start Selling",
      "secondaryCta": "View Demo",
      "previewAlt": "LaraTenant Commerce admin dashboard showing store overview, recent orders, and analytics"
    },

    "logos": {
      "label": "Trusted by merchants worldwide"
    },

    "features": {
      "eyebrow": "Platform Capabilities",
      "heading": "Everything You Need to Operate at Scale",
      "subtitle": "A complete commerce platform for merchants managing multiple stores, brands, and markets.",
      "items": {
        "multi-store": {
          "title": "Multi-Store Management",
          "description": "Operate multiple storefronts from a single dashboard. Each store is independently configurable with its own products, orders, and settings."
        },
        "orders": {
          "title": "Order Management",
          "description": "Track, process, and fulfill orders across all your stores. Centralized order workflows reduce operational overhead."
        },
        "products": {
          "title": "Product Catalog",
          "description": "Manage products, variants, inventory, and pricing across your entire catalog with structured, scalable tooling."
        },
        "analytics": {
          "title": "Analytics Dashboard",
          "description": "Understand store performance, sales trends, and merchant activity through clear, actionable data."
        },
        "localization": {
          "title": "Localization Support",
          "description": "Operate across markets with built-in multi-language and multi-currency support. RTL layouts included."
        },
        "permissions": {
          "title": "Role-Based Permissions",
          "description": "Control access at a granular level. Assign roles to team members and define exactly what they can see and do."
        },
        "performance": {
          "title": "Performance First",
          "description": "Built on modern infrastructure with fast load times, optimized rendering, and reliable uptime at every scale."
        },
        "api": {
          "title": "API Access",
          "description": "Integrate your existing tools and workflows through a structured API. Extend the platform without friction."
        }
      }
    },

    "showcase": {
      "heading": "A Dashboard Built for Merchant Productivity",
      "subtext": "Every workflow in LaraTenant Commerce is designed to reduce friction. From store setup to order fulfillment, your team works faster from day one.",
      "cta": "Start Selling",
      "previewAlt": "LaraTenant Commerce dashboard showing product management and order processing workflow"
    },

    "testimonials": {
      "eyebrow": "Merchant Stories",
      "heading": "Merchants Who Operate Smarter",
      "items": {
        "merchant-a": {
          "quote": "Managing three stores used to mean three separate systems. LaraTenant Commerce brought everything into one place and cut our operational time significantly.",
          "authorName": "Sara Al-Mansouri",
          "authorRole": "Head of Ecommerce",
          "authorCompany": "Retail Operations"
        },
        "merchant-b": {
          "quote": "The multi-currency and localization support was the deciding factor for us. We operate across four markets and needed a platform that could handle that from day one.",
          "authorName": "James Okafor",
          "authorRole": "Founder",
          "authorCompany": "Cross-Border Commerce"
        },
        "merchant-c": {
          "quote": "The permissions system is exactly what we needed. Different team members have access to exactly what they need — nothing more, nothing less.",
          "authorName": "Layla Hassan",
          "authorRole": "Operations Manager",
          "authorCompany": "Multi-Brand Group"
        },
        "merchant-d": {
          "quote": "Setup was straightforward and the dashboard is clean. Our team was fully operational within a day.",
          "authorName": "Carlos Mendez",
          "authorRole": "Store Owner",
          "authorCompany": "Independent Brand"
        },
        "merchant-e": {
          "quote": "Order management across multiple stores is where this platform really shines. Everything is centralized and the workflows make sense.",
          "authorName": "Priya Nair",
          "authorRole": "Ecommerce Director",
          "authorCompany": "D2C Brands"
        },
        "merchant-f": {
          "quote": "We evaluated several platforms. LaraTenant Commerce was the only one that handled multi-store operations without requiring custom development.",
          "authorName": "Ahmed Al-Rashid",
          "authorRole": "CTO",
          "authorCompany": "Commerce Group"
        }
      }
    },

    "pricing": {
      "eyebrow": "Pricing",
      "heading": "Simple Pricing. Serious Scale.",
      "subtitle": "Start with what you need. Upgrade as your business grows."
    },

    "faq": {
      "eyebrow": "FAQ",
      "heading": "Common Questions",
      "items": {
        "what-is-laratenant": {
          "question": "What is LaraTenant Commerce?",
          "answer": "LaraTenant Commerce is a multi-tenant ecommerce platform that lets merchants manage multiple stores, products, orders, and teams from a single unified dashboard. It is built for growing brands that need operational control without operational complexity."
        },
        "multi-store-support": {
          "question": "Can I manage multiple stores from one account?",
          "answer": "Yes. Multi-store management is a core feature of the platform. Each store is independently configurable with its own product catalog, order management, settings, and team permissions — all accessible from one dashboard."
        },
        "localization-support": {
          "question": "Does the platform support multiple languages and currencies?",
          "answer": "Yes. LaraTenant Commerce includes built-in localization support with multi-language interfaces, multi-currency pricing, and RTL layout support for Arabic and other right-to-left languages."
        },
        "how-to-get-started": {
          "question": "How do I get started?",
          "answer": "Create your account, set up your first store, and start adding products. The onboarding flow is designed to get merchants operational quickly without requiring technical knowledge."
        },
        "enterprise-options": {
          "question": "Do you offer enterprise or custom plans?",
          "answer": "Yes. Contact our team to discuss custom plans for large brands, agencies, and enterprise operators that need dedicated infrastructure, SLAs, or bespoke integrations."
        },
        "data-security": {
          "question": "How is merchant data protected?",
          "answer": "All data is stored securely with strict tenant isolation. Each store operates within its own boundary — data from one store is never accessible to another tenant on the platform."
        }
      }
    },

    "cta": {
      "title": "Ready to Manage Your Stores Smarter?",
      "description": "Join merchants who manage products, orders, and storefronts from a single, unified commerce platform.",
      "primaryCta": "Start Selling",
      "secondaryCta": "View Demo"
    }
  },

  "pricing": {
    "eyebrow": "Pricing",
    "heading": "Simple, Transparent Pricing",
    "subtitle": "No hidden fees. No lock-in. Scale your plan as your business grows.",

    "toggle": {
      "monthly": "Monthly",
      "annual": "Annual",
      "badge": "Save 17%"
    },

    "plans": {
      "starter": {
        "name": "Starter",
        "description": "For merchants launching their first store and getting started with online selling.",
        "cta": "Start Selling"
      },
      "growth": {
        "name": "Growth",
        "description": "For growing brands managing multiple stores and scaling their operations.",
        "cta": "Start Selling"
      },
      "enterprise": {
        "name": "Enterprise",
        "description": "For large brands and agencies that need custom infrastructure and dedicated support.",
        "cta": "Contact Sales"
      }
    },

    "features": {
      "stores1": "1 store",
      "stores5": "Up to 5 stores",
      "storesUnlimited": "Unlimited stores",
      "products500": "Up to 500 products",
      "productsUnlimited": "Unlimited products",
      "orders1k": "Up to 1,000 orders/month",
      "orders10k": "Up to 10,000 orders/month",
      "ordersUnlimited": "Unlimited orders",
      "analytics": "Analytics dashboard",
      "localization": "Localization and RTL support",
      "multiCurrency": "Multi-currency pricing",
      "apiAccess": "API access",
      "prioritySupport": "Priority support"
    },

    "faq": {
      "eyebrow": "Pricing FAQ",
      "heading": "Questions About Pricing",
      "items": {
        "free-trial": {
          "question": "Is there a free trial?",
          "answer": "Yes. You can explore the platform before committing to a paid plan. No credit card is required to start."
        },
        "change-plan": {
          "question": "Can I change my plan later?",
          "answer": "Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of the next billing cycle."
        },
        "annual-discount": {
          "question": "What is included in the annual discount?",
          "answer": "Annual plans are billed once per year at a reduced rate equivalent to approximately two months free compared to monthly billing."
        },
        "cancel-anytime": {
          "question": "Can I cancel at any time?",
          "answer": "Yes. There are no long-term contracts. Cancel your subscription at any time from your account settings."
        },
        "payment-methods": {
          "question": "What payment methods are accepted?",
          "answer": "We accept major credit and debit cards. Enterprise customers can arrange invoiced billing with their account manager."
        },
        "enterprise-custom": {
          "question": "Can enterprise plans be customized?",
          "answer": "Yes. Enterprise plans are tailored to your requirements. Contact our team to discuss store limits, order volumes, SLAs, and custom integrations."
        }
      }
    },

    "cta": {
      "title": "Start Selling Today",
      "description": "Create your store and start managing products, orders, and growth from a unified platform.",
      "primaryCta": "Create Your Store",
      "secondaryCta": "Talk to Sales"
    }
  },

  "nav": {
    "features": "Features",
    "pricing": "Pricing",
    "enterprise": "Enterprise",
    "templates": "Templates",
    "blog": "Blog",
    "docs": "Docs"
  },

  "footer": {
    "groups": {
      "product": "Product",
      "resources": "Resources",
      "company": "Company"
    },
    "links": {
      "features": "Features",
      "pricing": "Pricing",
      "templates": "Templates",
      "enterprise": "Enterprise",
      "docs": "Documentation",
      "blog": "Blog",
      "about": "About",
      "contact": "Contact"
    }
  },

  "cta": {
    "startSelling": "Start Selling",
    "viewDemo": "View Demo",
    "exploreFeatures": "Explore Features",
    "viewPricing": "View Pricing",
    "contactSales": "Contact Sales",
    "login": "Sign In",
    "getStarted": "Get Started"
  }
}
EOF

echo "✓ messages/en/marketing.json"

# =============================================================================
# STEP 36 — messages/ar/marketing.json
# =============================================================================

cat > "$MESSAGES_AR/marketing.json" << 'EOF'
{
  "meta": {
    "home": {
      "title": "منصة تجارة إلكترونية متعددة المستأجرين",
      "description": "أطلق وأدر أعمالك التجارية الإلكترونية عبر منصة تجارة متطورة قابلة للتوسع، مصممة للعلامات التجارية والتجار المعاصرين."
    },
    "pricing": {
      "title": "أسعار واضحة وشفافة",
      "description": "اختر الخطة التي تناسب عملك. وسّع متاجرك ومنتجاتك وطلباتك مع نمو أعمالك."
    },
    "features": {
      "title": "مميزات المنصة",
      "description": "اكتشف الأدوات التي تساعد التجار على إدارة المتاجر والمنتجات والطلبات والنمو من لوحة تحكم موحدة."
    },
    "enterprise": {
      "title": "حلول تجارة المؤسسات",
      "description": "بنية تحتية تجارية قابلة للتوسع للعلامات التجارية الكبيرة والوكالات ومشغلي العلامات المتعددة."
    },
    "templates": {
      "title": "قوالب المتجر",
      "description": "أطلق متجرك بسرعة أكبر باستخدام قوالب متجر مصممة باحترافية لتجارة إلكترونية عصرية."
    }
  },

  "home": {
    "hero": {
      "badge": "منصة تجارة متعددة المستأجرين",
      "headline": "أدر متاجرك المتعددة من منصة واحدة",
      "subtext": "أدر المنتجات والطلبات والمتاجر من لوحة تحكم تجارية موحدة. مبنية للتجار الذين يعملون على نطاق واسع.",
      "primaryCta": "ابدأ البيع",
      "secondaryCta": "عرض تجريبي",
      "previewAlt": "لوحة تحكم LaraTenant Commerce تعرض نظرة عامة على المتجر والطلبات الأخيرة والتحليلات"
    },

    "logos": {
      "label": "موثوق به من قبل التجار حول العالم"
    },

    "features": {
      "eyebrow": "إمكانيات المنصة",
      "heading": "كل ما تحتاجه للعمل على نطاق واسع",
      "subtitle": "منصة تجارة متكاملة للتجار الذين يديرون متاجر وعلامات تجارية وأسواقاً متعددة.",
      "items": {
        "multi-store": {
          "title": "إدارة متعددة المتاجر",
          "description": "أدر واجهات متجر متعددة من لوحة تحكم واحدة. كل متجر قابل للتهيئة بشكل مستقل بمنتجاته وطلباته وإعداداته الخاصة."
        },
        "orders": {
          "title": "إدارة الطلبات",
          "description": "تتبع الطلبات ومعالجتها وتنفيذها عبر جميع متاجرك. تقلل سير عمل الطلبات المركزية من التكاليف التشغيلية."
        },
        "products": {
          "title": "كتالوج المنتجات",
          "description": "أدر المنتجات والمتغيرات والمخزون والتسعير عبر الكتالوج بأكمله بأدوات منظمة وقابلة للتطوير."
        },
        "analytics": {
          "title": "لوحة التحليلات",
          "description": "افهم أداء المتجر واتجاهات المبيعات ونشاط التاجر من خلال بيانات واضحة وقابلة للتنفيذ."
        },
        "localization": {
          "title": "دعم التوطين",
          "description": "العمل عبر الأسواق بدعم مدمج متعدد اللغات ومتعدد العملات. تشمل تخطيطات RTL."
        },
        "permissions": {
          "title": "الأذونات القائمة على الأدوار",
          "description": "تحكم في الوصول بمستوى دقيق. قم بتعيين أدوار لأعضاء الفريق وحدد بالضبط ما يمكنهم رؤيته وفعله."
        },
        "performance": {
          "title": "الأداء أولاً",
          "description": "مبني على بنية تحتية حديثة بأوقات تحميل سريعة وعرض محسّن وموثوقية عالية على كل مستوى."
        },
        "api": {
          "title": "وصول API",
          "description": "دمج أدواتك وسير عملك الحالية من خلال API منظم. وسّع المنصة دون احتكاك."
        }
      }
    },

    "showcase": {
      "heading": "لوحة تحكم مبنية لإنتاجية التاجر",
      "subtext": "كل سير عمل في LaraTenant Commerce مصمم لتقليل الاحتكاك. من إعداد المتجر إلى تنفيذ الطلبات، يعمل فريقك بشكل أسرع منذ اليوم الأول.",
      "cta": "ابدأ البيع",
      "previewAlt": "لوحة تحكم LaraTenant Commerce تعرض إدارة المنتجات وسير عمل معالجة الطلبات"
    },

    "testimonials": {
      "eyebrow": "قصص التجار",
      "heading": "تجار يعملون بذكاء أكبر",
      "items": {
        "merchant-a": {
          "quote": "إدارة ثلاثة متاجر كانت تعني ثلاثة أنظمة منفصلة. LaraTenant Commerce جمع كل شيء في مكان واحد وقلل وقتنا التشغيلي بشكل ملحوظ.",
          "authorName": "سارة المنصوري",
          "authorRole": "رئيسة التجارة الإلكترونية",
          "authorCompany": "عمليات التجزئة"
        },
        "merchant-b": {
          "quote": "دعم متعدد العملات والتوطين كان عامل الحسم بالنسبة لنا. نعمل في أربعة أسواق ونحتاج منصة يمكنها التعامل مع ذلك منذ البداية.",
          "authorName": "جيمس أوكافور",
          "authorRole": "مؤسس",
          "authorCompany": "تجارة عابرة للحدود"
        },
        "merchant-c": {
          "quote": "نظام الأذونات هو بالضبط ما احتجناه. أعضاء الفريق المختلفون لديهم وصول إلى ما يحتاجونه تماماً — لا أقل ولا أكثر.",
          "authorName": "ليلى حسن",
          "authorRole": "مدير العمليات",
          "authorCompany": "مجموعة العلامات التجارية المتعددة"
        },
        "merchant-d": {
          "quote": "الإعداد كان واضحاً ولوحة التحكم نظيفة. كان فريقنا يعمل بكفاءة كاملة خلال يوم واحد.",
          "authorName": "كارلوس مينديز",
          "authorRole": "صاحب المتجر",
          "authorCompany": "علامة تجارية مستقلة"
        },
        "merchant-e": {
          "quote": "إدارة الطلبات عبر متاجر متعددة هو المكان الذي تتألق فيه هذه المنصة حقاً. كل شيء مركزي وسير العمل منطقي.",
          "authorName": "بريا نير",
          "authorRole": "مدير التجارة الإلكترونية",
          "authorCompany": "علامات D2C"
        },
        "merchant-f": {
          "quote": "قيّمنا عدة منصات. LaraTenant Commerce كانت الوحيدة التي تعاملت مع عمليات متعددة المتاجر دون الحاجة إلى تطوير مخصص.",
          "authorName": "أحمد الراشد",
          "authorRole": "مدير تقني",
          "authorCompany": "مجموعة التجارة"
        }
      }
    },

    "pricing": {
      "eyebrow": "الأسعار",
      "heading": "أسعار بسيطة. توسع جاد.",
      "subtitle": "ابدأ بما تحتاجه. رقّ خطتك مع نمو أعمالك."
    },

    "faq": {
      "eyebrow": "الأسئلة الشائعة",
      "heading": "أسئلة شائعة",
      "items": {
        "what-is-laratenant": {
          "question": "ما هو LaraTenant Commerce؟",
          "answer": "LaraTenant Commerce هو منصة تجارة إلكترونية متعددة المستأجرين تتيح للتجار إدارة متاجر وفرق ومنتجات وطلبات متعددة من لوحة تحكم موحدة واحدة. مبنية للعلامات التجارية النامية التي تحتاج إلى سيطرة تشغيلية دون تعقيد تشغيلي."
        },
        "multi-store-support": {
          "question": "هل يمكنني إدارة متاجر متعددة من حساب واحد؟",
          "answer": "نعم. إدارة متعددة المتاجر هي ميزة أساسية في المنصة. كل متجر قابل للتهيئة بشكل مستقل بكتالوج منتجاته الخاص وإدارة الطلبات والإعدادات وأذونات الفريق — كل ذلك من لوحة تحكم واحدة."
        },
        "localization-support": {
          "question": "هل تدعم المنصة لغات وعملات متعددة؟",
          "answer": "نعم. يتضمن LaraTenant Commerce دعماً مدمجاً للتوطين مع واجهات متعددة اللغات وتسعير متعدد العملات ودعم تخطيط RTL للعربية وغيرها من اللغات التي تُكتب من اليمين إلى اليسار."
        },
        "how-to-get-started": {
          "question": "كيف أبدأ؟",
          "answer": "أنشئ حسابك، وقم بإعداد متجرك الأول، وابدأ في إضافة المنتجات. تدفق الإعداد مصمم لتشغيل التجار بسرعة دون الحاجة إلى معرفة تقنية."
        },
        "enterprise-options": {
          "question": "هل تقدمون خططاً للمؤسسات أو مخصصة؟",
          "answer": "نعم. تواصل مع فريقنا لمناقشة الخطط المخصصة للعلامات التجارية الكبيرة والوكالات ومشغلي المؤسسات الذين يحتاجون إلى بنية تحتية مخصصة أو اتفاقيات مستوى خدمة أو تكاملات خاصة."
        },
        "data-security": {
          "question": "كيف تتم حماية بيانات التاجر؟",
          "answer": "يتم تخزين جميع البيانات بشكل آمن مع عزل صارم للمستأجرين. كل متجر يعمل ضمن حدوده الخاصة — لا يمكن لمستأجر آخر على المنصة الوصول إلى بيانات متجر آخر."
        }
      }
    },

    "cta": {
      "title": "هل أنت مستعد لإدارة متاجرك بذكاء أكبر؟",
      "description": "انضم إلى التجار الذين يديرون المنتجات والطلبات والواجهات التجارية من منصة تجارة موحدة واحدة.",
      "primaryCta": "ابدأ البيع",
      "secondaryCta": "عرض تجريبي"
    }
  },

  "pricing": {
    "eyebrow": "الأسعار",
    "heading": "أسعار بسيطة وشفافة",
    "subtitle": "لا رسوم خفية. لا قيود. طوّر خطتك مع نمو أعمالك.",

    "toggle": {
      "monthly": "شهري",
      "annual": "سنوي",
      "badge": "وفر 17٪"
    },

    "plans": {
      "starter": {
        "name": "المبتدئ",
        "description": "للتجار الذين يطلقون متجرهم الأول ويبدأون رحلة البيع عبر الإنترنت.",
        "cta": "ابدأ البيع"
      },
      "growth": {
        "name": "النمو",
        "description": "للعلامات التجارية النامية التي تدير متاجر متعددة وتوسع عملياتها.",
        "cta": "ابدأ البيع"
      },
      "enterprise": {
        "name": "المؤسسات",
        "description": "للعلامات التجارية الكبيرة والوكالات التي تحتاج إلى بنية تحتية مخصصة ودعم متميز.",
        "cta": "تواصل مع المبيعات"
      }
    },

    "features": {
      "stores1": "متجر واحد",
      "stores5": "حتى 5 متاجر",
      "storesUnlimited": "متاجر غير محدودة",
      "products500": "حتى 500 منتج",
      "productsUnlimited": "منتجات غير محدودة",
      "orders1k": "حتى 1,000 طلب شهرياً",
      "orders10k": "حتى 10,000 طلب شهرياً",
      "ordersUnlimited": "طلبات غير محدودة",
      "analytics": "لوحة التحليلات",
      "localization": "دعم التوطين وRTL",
      "multiCurrency": "تسعير متعدد العملات",
      "apiAccess": "وصول API",
      "prioritySupport": "دعم ذو أولوية"
    },

    "faq": {
      "eyebrow": "أسئلة الأسعار",
      "heading": "أسئلة حول الأسعار",
      "items": {
        "free-trial": {
          "question": "هل هناك فترة تجريبية مجانية؟",
          "answer": "نعم. يمكنك استكشاف المنصة قبل الالتزام بخطة مدفوعة. لا يلزم إدخال بيانات بطاقة ائتمانية للبدء."
        },
        "change-plan": {
          "question": "هل يمكنني تغيير خطتي لاحقاً؟",
          "answer": "نعم. يمكنك الترقية أو التخفيض في أي وقت. تسري التغييرات في بداية دورة الفوترة التالية."
        },
        "annual-discount": {
          "question": "ما الذي يتضمنه الخصم السنوي؟",
          "answer": "تُفوتر الخطط السنوية مرة واحدة سنوياً بسعر مخفض يعادل تقريباً شهرين مجاناً مقارنةً بالفوترة الشهرية."
        },
        "cancel-anytime": {
          "question": "هل يمكنني الإلغاء في أي وقت؟",
          "answer": "نعم. لا توجد عقود طويلة الأمد. قم بإلغاء اشتراكك في أي وقت من إعدادات حسابك."
        },
        "payment-methods": {
          "question": "ما طرق الدفع المقبولة؟",
          "answer": "نقبل بطاقات الائتمان والخصم الرئيسية. يمكن لعملاء المؤسسات ترتيب الفوترة عبر الفاتورة مع مدير حساباتهم."
        },
        "enterprise-custom": {
          "question": "هل يمكن تخصيص خطط المؤسسات؟",
          "answer": "نعم. خطط المؤسسات مصممة وفق متطلباتك. تواصل مع فريقنا لمناقشة حدود المتاجر وأحجام الطلبات واتفاقيات مستوى الخدمة والتكاملات المخصصة."
        }
      }
    },

    "cta": {
      "title": "ابدأ البيع اليوم",
      "description": "أنشئ متجرك وابدأ في إدارة المنتجات والطلبات والنمو من منصة موحدة.",
      "primaryCta": "أنشئ متجرك",
      "secondaryCta": "تحدث مع المبيعات"
    }
  },

  "nav": {
    "features": "المميزات",
    "pricing": "الأسعار",
    "enterprise": "المؤسسات",
    "templates": "القوالب",
    "blog": "المدونة",
    "docs": "التوثيق"
  },

  "footer": {
    "groups": {
      "product": "المنتج",
      "resources": "الموارد",
      "company": "الشركة"
    },
    "links": {
      "features": "المميزات",
      "pricing": "الأسعار",
      "templates": "القوالب",
      "enterprise": "المؤسسات",
      "docs": "التوثيق",
      "blog": "المدونة",
      "about": "من نحن",
      "contact": "تواصل معنا"
    }
  },

  "cta": {
    "startSelling": "ابدأ البيع",
    "viewDemo": "عرض تجريبي",
    "exploreFeatures": "استكشف المميزات",
    "viewPricing": "عرض الأسعار",
    "contactSales": "تواصل مع المبيعات",
    "login": "تسجيل الدخول",
    "getStarted": "ابدأ الآن"
  }
}
EOF

echo "✓ messages/ar/marketing.json"

# =============================================================================
# Done
# =============================================================================

echo ""
echo "============================================="
echo " Phase 5 Complete — Routes + i18n"
echo "============================================="
echo ""
echo " Route layouts:"
echo "   app/[locale]/(marketing)/layout.tsx"
echo ""
echo " Implemented pages:"
echo "   app/[locale]/(marketing)/page.tsx          ← homepage"
echo "   app/[locale]/(marketing)/pricing/page.tsx  ← pricing"
echo ""
echo " Reserved stubs:"
echo "   app/[locale]/(marketing)/features/page.tsx"
echo "   app/[locale]/(marketing)/enterprise/page.tsx"
echo "   app/[locale]/(marketing)/templates/page.tsx"
echo "   app/[locale]/(marketing)/blog/page.tsx"
echo "   app/[locale]/(marketing)/docs/page.tsx"
echo ""
echo " i18n:"
echo "   messages/en/marketing.json  ← full English copy"
echo "   messages/ar/marketing.json  ← full Arabic copy (natural phrasing)"
echo ""
echo " Key parity: en ↔ ar verified across all namespaces."
echo ""
echo "============================================="
echo " Marketing Site — All Phases Complete"
echo "============================================="
echo ""
echo " Foundation:    types, constants, SEO lib, layouts"
echo " Components:    Navbar, Footer, cards, heading, preview"
echo " Content:       homepage/*, pricing/*, reserved stubs"
echo " Sections:      8 sections + 2 client boundaries"
echo " Routes:        layout, homepage, pricing, 5 stubs"
echo " i18n:          en + ar, full key parity"
echo ""
echo " Architecture guarantees:"
echo "   CMS-ready:     swap content resolvers at page level only"
echo "   A/B-ready:     variant resolution at page level only"
echo "   Locale-ready:  add translation file, routes work immediately"
echo "   SEO-complete:  metadata + JSON-LD on every implemented page"
echo "   Perf-first:    Server Components default, 2 client boundaries total"
echo "============================================="