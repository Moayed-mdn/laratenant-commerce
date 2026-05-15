#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# LaraTenant Commerce — Marketing Site Foundation
# Phase 1: Types, Constants, SEO Utilities, Layout Primitives
# Steps 1–6
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKETING="$PROJECT_ROOT/src/features/marketing"
APP_MARKETING="$PROJECT_ROOT/src/app/[locale]/(marketing)"

echo "→ Creating directory structure..."

mkdir -p "$MARKETING/types"
mkdir -p "$MARKETING/constants"
mkdir -p "$MARKETING/lib"
mkdir -p "$MARKETING/layouts"
mkdir -p "$MARKETING/components"
mkdir -p "$MARKETING/sections"
mkdir -p "$MARKETING/content/homepage"
mkdir -p "$MARKETING/content/pricing"
mkdir -p "$MARKETING/content/features"
mkdir -p "$MARKETING/content/enterprise"
mkdir -p "$MARKETING/content/templates"
mkdir -p "$MARKETING/content/blog"
mkdir -p "$MARKETING/content/docs"
mkdir -p "$MARKETING/hooks"
mkdir -p "$APP_MARKETING/pricing"
mkdir -p "$APP_MARKETING/features"
mkdir -p "$APP_MARKETING/enterprise"
mkdir -p "$APP_MARKETING/templates"
mkdir -p "$APP_MARKETING/blog"
mkdir -p "$APP_MARKETING/docs"

echo "→ Directory structure created."

# =============================================================================
# STEP 1 — types/index.ts
# =============================================================================

cat > "$MARKETING/types/index.ts" << 'EOF'
// =============================================================================
// Marketing — Shared Type Definitions
//
// All marketing content, section props, and SEO config reference these types.
// Sections consume these types as props.
// Content files export values that conform to these types.
// CMS resolvers will return these same types when integrated.
// =============================================================================

// -----------------------------------------------------------------------------
// Navigation
// -----------------------------------------------------------------------------

export interface NavLink {
  label: string
  href: string
  external?: boolean
}

export interface NavGroup {
  label: string
  links: NavLink[]
}

export interface CTALink {
  label: string
  href: string
}

// -----------------------------------------------------------------------------
// SEO
// -----------------------------------------------------------------------------

export interface MarketingPageMeta {
  locale: string
  title: string
  description: string
  /** Path segment after locale prefix. Empty string for homepage. */
  path: string
  ogImage?: string
}

// -----------------------------------------------------------------------------
// Hero
// -----------------------------------------------------------------------------

export interface HeroContent {
  badge?: string
  headline: string
  subtext: string
  primaryCta: CTALink
  secondaryCta?: CTALink
  previewAlt: string
}

// -----------------------------------------------------------------------------
// Logo Cloud
// -----------------------------------------------------------------------------

export interface LogoItem {
  name: string
  /** Path relative to /public */
  src: string
  width: number
  height: number
}

// -----------------------------------------------------------------------------
// Features
// -----------------------------------------------------------------------------

export interface FeatureItem {
  id: string
  icon: string
  title: string
  description: string
}

// -----------------------------------------------------------------------------
// Showcase / Split Section
// -----------------------------------------------------------------------------

export interface ShowcaseContent {
  heading: string
  subtext: string
  cta?: CTALink
  previewAlt: string
  /** Path relative to /public — optional until real asset exists */
  previewSrc?: string
}

// -----------------------------------------------------------------------------
// Testimonials
// -----------------------------------------------------------------------------

export interface TestimonialItem {
  id: string
  quote: string
  authorName: string
  authorRole: string
  authorCompany?: string
  /** Path relative to /public — optional */
  avatarSrc?: string
}

// -----------------------------------------------------------------------------
// Pricing
// -----------------------------------------------------------------------------

export interface PricingFeature {
  label: string
  included: boolean
}

export type PricingInterval = 'monthly' | 'annual'

export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number | null
  annualPrice: number | null
  /** null = contact sales */
  currency: string
  highlighted: boolean
  ctaLabel: string
  ctaHref: string
  features: PricingFeature[]
}

// -----------------------------------------------------------------------------
// FAQ
// -----------------------------------------------------------------------------

export interface FAQItem {
  id: string
  question: string
  answer: string
}

// -----------------------------------------------------------------------------
// CTA Section
// -----------------------------------------------------------------------------

export interface CTAContent {
  title: string
  description: string
  primaryCta: CTALink
  secondaryCta?: CTALink
}

// -----------------------------------------------------------------------------
// Section Heading
// -----------------------------------------------------------------------------

export type HeadingAlign = 'left' | 'center'
export type HeadingLevel = 'h1' | 'h2' | 'h3'
EOF

echo "✓ types/index.ts"

# =============================================================================
# STEP 2 — constants/nav-links.ts
# =============================================================================

cat > "$MARKETING/constants/nav-links.ts" << 'EOF'
// =============================================================================
// Marketing — Navigation Link Definitions
//
// Consumed by MarketingNavbar and MarketingFooter.
// Links are locale-agnostic path segments.
// Locale prefix is applied at render time via navigation.ts helpers.
// =============================================================================

import type { NavLink, NavGroup } from '@/features/marketing/types'

// -----------------------------------------------------------------------------
// Primary Navbar Links
// -----------------------------------------------------------------------------

export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: 'nav.features', href: '/features' },
  { label: 'nav.pricing', href: '/pricing' },
  { label: 'nav.enterprise', href: '/enterprise' },
  { label: 'nav.templates', href: '/templates' },
  { label: 'nav.blog', href: '/blog' },
  { label: 'nav.docs', href: '/docs' },
]

// -----------------------------------------------------------------------------
// Footer Link Groups
// -----------------------------------------------------------------------------

export const FOOTER_NAV_GROUPS: NavGroup[] = [
  {
    label: 'footer.groups.product',
    links: [
      { label: 'footer.links.features', href: '/features' },
      { label: 'footer.links.pricing', href: '/pricing' },
      { label: 'footer.links.templates', href: '/templates' },
      { label: 'footer.links.enterprise', href: '/enterprise' },
    ],
  },
  {
    label: 'footer.groups.resources',
    links: [
      { label: 'footer.links.docs', href: '/docs' },
      { label: 'footer.links.blog', href: '/blog' },
    ],
  },
  {
    label: 'footer.groups.company',
    links: [
      { label: 'footer.links.about', href: '/about' },
      { label: 'footer.links.contact', href: '/contact' },
    ],
  },
]
EOF

echo "✓ constants/nav-links.ts"

# =============================================================================
# STEP 3 — constants/cta-links.ts
# =============================================================================

cat > "$MARKETING/constants/cta-links.ts" << 'EOF'
// =============================================================================
// Marketing — Shared CTA Link Definitions
//
// Consumed by HeroSection, CTASection, MarketingNavbar, PricingCard, etc.
// Auth routes reference the admin app locale-aware paths.
// =============================================================================

import type { CTALink } from '@/features/marketing/types'

export const CTA_START_SELLING: CTALink = {
  label: 'cta.startSelling',
  href: '/register',
}

export const CTA_VIEW_DEMO: CTALink = {
  label: 'cta.viewDemo',
  href: '/demo',
}

export const CTA_EXPLORE_FEATURES: CTALink = {
  label: 'cta.exploreFeatures',
  href: '/features',
}

export const CTA_VIEW_PRICING: CTALink = {
  label: 'cta.viewPricing',
  href: '/pricing',
}

export const CTA_CONTACT_SALES: CTALink = {
  label: 'cta.contactSales',
  href: '/contact',
}

export const CTA_LOGIN: CTALink = {
  label: 'cta.login',
  href: '/login',
}

export const CTA_GET_STARTED: CTALink = {
  label: 'cta.getStarted',
  href: '/register',
}
EOF

echo "✓ constants/cta-links.ts"

# =============================================================================
# STEP 4 — lib/seo.ts
# =============================================================================

cat > "$MARKETING/lib/seo.ts" << 'EOF'
// =============================================================================
// Marketing — Centralized SEO Utilities
//
// All marketing page.tsx files call these utilities for metadata generation.
// Sections never call these — SEO is a page/route concern only.
//
// CMS integration: replace static strings with CMS-resolved values at the
// call site. The utility signatures do not change.
// =============================================================================

import type { Metadata } from 'next'
import type { FAQItem, MarketingPageMeta } from '@/features/marketing/types'

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const SITE_NAME = 'LaraTenant Commerce'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://laratenant.com'
const DEFAULT_OG_IMAGE = '/og/default.png'

const SUPPORTED_LOCALES = ['en', 'ar'] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

// -----------------------------------------------------------------------------
// Internal Helpers
// -----------------------------------------------------------------------------

function buildCanonicalUrl(locale: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const localePath = cleanPath === '/' ? '' : cleanPath
  return `${SITE_URL}/${locale}${localePath}`
}

function buildLocaleAlternates(
  path: string,
): Record<string, string> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const localePath = cleanPath === '/' ? '' : cleanPath

  return SUPPORTED_LOCALES.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = `${SITE_URL}/${locale}${localePath}`
    return acc
  }, {})
}

function formatTitle(title: string): string {
  return `${title} | ${SITE_NAME}`
}

// -----------------------------------------------------------------------------
// buildPageMetadata
//
// Primary utility for all marketing pages.
// Call from generateMetadata() in each marketing page.tsx.
//
// Usage:
//   export async function generateMetadata({ params }) {
//     const { locale } = await params
//     const t = await getTranslations({ locale, namespace: 'marketing' })
//     return buildPageMetadata({
//       locale,
//       title: t('meta.home.title'),
//       description: t('meta.home.description'),
//       path: '',
//     })
//   }
// -----------------------------------------------------------------------------

export function buildPageMetadata(config: MarketingPageMeta): Metadata {
  const { locale, title, description, path, ogImage } = config

  const canonicalUrl = buildCanonicalUrl(locale, path)
  const ogImageUrl = ogImage ?? DEFAULT_OG_IMAGE
  const formattedTitle = formatTitle(title)
  const alternates = buildLocaleAlternates(path)

  return {
    title: formattedTitle,
    description,

    alternates: {
      canonical: canonicalUrl,
      languages: alternates,
    },

    openGraph: {
      title: formattedTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description,
      images: [ogImageUrl],
    },
  }
}

// -----------------------------------------------------------------------------
// buildFAQJsonLd
//
// Generates FAQPage structured data for server-side injection.
//
// Usage in a Server Component:
//   <script
//     type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
//   />
// -----------------------------------------------------------------------------

export function buildFAQJsonLd(items: FAQItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return JSON.stringify(schema)
}

// -----------------------------------------------------------------------------
// buildOrgJsonLd
//
// Generates Organization structured data.
// Inject once in marketing layout.
// -----------------------------------------------------------------------------

export function buildOrgJsonLd(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  }

  return JSON.stringify(schema)
}

// -----------------------------------------------------------------------------
// buildSoftwareJsonLd
//
// Generates SoftwareApplication structured data.
// Inject on homepage.
// -----------------------------------------------------------------------------

export function buildSoftwareJsonLd(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return JSON.stringify(schema)
}
EOF

echo "✓ lib/seo.ts"

# =============================================================================
# STEP 5 — layouts/SectionContainer.tsx
# =============================================================================

cat > "$MARKETING/layouts/SectionContainer.tsx" << 'EOF'
// =============================================================================
// SectionContainer
//
// Layout primitive that enforces consistent horizontal padding and max-width
// across all marketing sections.
//
// Rules:
//   - max-w-[1280px] boundary
//   - consistent horizontal padding (responsive)
//   - no visual styling beyond layout constraints
//   - accepts className for one-off section overrides
//   - renders a <div> by default; accepts `as` for semantic override
// =============================================================================

import { type ComponentPropsWithoutRef, type ElementType } from 'react'
import { cn } from '@/lib/utils'

interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  as?: ElementType
}

export default function SectionContainer({
  children,
  className,
  as: Tag = 'div',
}: SectionContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
EOF

echo "✓ layouts/SectionContainer.tsx"

# =============================================================================
# STEP 5b — layouts/CenteredLayout.tsx
# =============================================================================

cat > "$MARKETING/layouts/CenteredLayout.tsx" << 'EOF'
// =============================================================================
// CenteredLayout
//
// Centers content horizontally and optionally vertically.
// Used for CTA sections, hero inner content, and confirmation-style sections.
//
// Rules:
//   - wraps SectionContainer
//   - text-center by default
//   - max-w-prose or custom maxWidth for content column
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from './SectionContainer'

interface CenteredLayoutProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export default function CenteredLayout({
  children,
  className,
  innerClassName,
}: CenteredLayoutProps) {
  return (
    <SectionContainer className={className}>
      <div className={cn('mx-auto max-w-3xl text-center', innerClassName)}>
        {children}
      </div>
    </SectionContainer>
  )
}
EOF

echo "✓ layouts/CenteredLayout.tsx"

# =============================================================================
# STEP 5c — layouts/SplitLayout.tsx
# =============================================================================

cat > "$MARKETING/layouts/SplitLayout.tsx" << 'EOF'
// =============================================================================
// SplitLayout
//
// Two-column layout for showcase sections (copy left, visual right).
// Collapses to single column on mobile.
// Respects RTL direction.
//
// Rules:
//   - left column: text content
//   - right column: visual / image / preview
//   - gap is consistent and not arbitrary
//   - rtl: columns reverse via flex-row-reverse on RTL locales
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from './SectionContainer'

interface SplitLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  className?: string
  /** Reverses column order — use for alternating showcase sections */
  reverse?: boolean
}

export default function SplitLayout({
  left,
  right,
  className,
  reverse = false,
}: SplitLayoutProps) {
  return (
    <SectionContainer>
      <div
        className={cn(
          'flex flex-col items-center gap-12 lg:flex-row lg:gap-16',
          reverse && 'lg:flex-row-reverse',
          className,
        )}
      >
        <div className="flex-1 space-y-6">{left}</div>
        <div className="flex-1">{right}</div>
      </div>
    </SectionContainer>
  )
}
EOF

echo "✓ layouts/SplitLayout.tsx"

# =============================================================================
# STEP 6 — layouts/MarketingLayout.tsx
# =============================================================================

cat > "$MARKETING/layouts/MarketingLayout.tsx" << 'EOF'
// =============================================================================
// MarketingLayout
//
// Shared page shell for all marketing routes.
// Renders MarketingNavbar, semantic <main>, and MarketingFooter.
//
// Consumed by app/[locale]/(marketing)/layout.tsx.
// Does not own metadata — that lives in each page.tsx.
// Does not own data — it is a pure structural wrapper.
// =============================================================================

import MarketingNavbar from '@/features/marketing/components/MarketingNavbar'
import MarketingFooter from '@/features/marketing/components/MarketingFooter'
import { buildOrgJsonLd } from '@/features/marketing/lib/seo'

interface MarketingLayoutProps {
  children: React.ReactNode
  locale: string
}

export default function MarketingLayout({
  children,
  locale,
}: MarketingLayoutProps) {
  return (
    <>
      {/* Organization structured data — injected once per marketing page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildOrgJsonLd() }}
      />

      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className={[
          'sr-only focus:not-sr-only',
          'focus:fixed focus:left-4 focus:top-4 focus:z-50',
          'focus:rounded-md focus:bg-background focus:px-4 focus:py-2',
          'focus:text-sm focus:font-medium focus:shadow-md focus:outline-none',
          'focus:ring-2 focus:ring-ring',
        ].join(' ')}
      >
        Skip to content
      </a>

      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MarketingNavbar locale={locale} />

        <main
          id="main-content"
          className="flex-1"
          role="main"
        >
          {children}
        </main>

        <MarketingFooter locale={locale} />
      </div>
    </>
  )
}
EOF

echo "✓ layouts/MarketingLayout.tsx"

# =============================================================================
# Content README stubs for future CMS / MDX systems
# =============================================================================

cat > "$MARKETING/content/blog/README.md" << 'EOF'
# Blog Content

Reserved for future CMS or MDX blog integration.

When a blog system is added:
- MDX files live here, or
- A CMS resolver is added to features/marketing/lib/cms/blog.ts

The route at app/[locale]/(marketing)/blog/ is already reserved.
EOF

cat > "$MARKETING/content/docs/README.md" << 'EOF'
# Docs Content

Reserved for future CMS or MDX documentation integration.

When a docs system is added:
- MDX files live here, or
- A CMS resolver is added to features/marketing/lib/cms/docs.ts

The route at app/[locale]/(marketing)/docs/ is already reserved.
EOF

cat > "$MARKETING/hooks/README.md" << 'EOF'
# Marketing Hooks

Reserved for interactive marketing component hooks.

Candidates when needed:
- usePricingToggle    — monthly/annual billing toggle state
- useScrollReveal     — viewport intersection for subtle reveal (CSS-first preferred)
EOF

echo "✓ Content README stubs"

# =============================================================================
# Done
# =============================================================================

echo ""
echo "============================================="
echo " Phase 1 Complete — Foundation"
echo "============================================="
echo ""
echo " Created:"
echo "   src/features/marketing/types/index.ts"
echo "   src/features/marketing/constants/nav-links.ts"
echo "   src/features/marketing/constants/cta-links.ts"
echo "   src/features/marketing/lib/seo.ts"
echo "   src/features/marketing/layouts/SectionContainer.tsx"
echo "   src/features/marketing/layouts/CenteredLayout.tsx"
echo "   src/features/marketing/layouts/SplitLayout.tsx"
echo "   src/features/marketing/layouts/MarketingLayout.tsx"
echo "   src/features/marketing/content/blog/README.md"
echo "   src/features/marketing/content/docs/README.md"
echo "   src/features/marketing/hooks/README.md"
echo ""
echo " Route slots reserved:"
echo "   src/app/[locale]/(marketing)/pricing/"
echo "   src/app/[locale]/(marketing)/features/"
echo "   src/app/[locale]/(marketing)/enterprise/"
echo "   src/app/[locale]/(marketing)/templates/"
echo "   src/app/[locale]/(marketing)/blog/"
echo "   src/app/[locale]/(marketing)/docs/"
echo ""
echo " Next: Phase 2 — Shared Components (Steps 7–14)"
echo "   SectionHeading, GradientBadge, DashboardPreview,"
echo "   FeatureCard, TestimonialCard, PricingCard,"
echo "   MarketingNavbar, MarketingFooter"
echo "============================================="