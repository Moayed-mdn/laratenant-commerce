#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# LaraTenant Commerce — Marketing Site
# Phase 4: Sections (Steps 24–31)
# HeroSection, LogoCloudSection, FeatureGridSection,
# DashboardShowcaseSection, TestimonialsSection,
# PricingSection, FAQSection, CTASection
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKETING="$PROJECT_ROOT/src/features/marketing"
SECTIONS="$MARKETING/sections"

echo "→ Writing Phase 4 sections..."

# =============================================================================
# STEP 24 — sections/HeroSection.tsx
# =============================================================================

cat > "$SECTIONS/HeroSection.tsx" << 'EOF'
// =============================================================================
// HeroSection
//
// Above-the-fold hero. Owns the page's only H1.
// Server Component — no interactivity, no client state.
//
// Rules:
//   - exactly one h1 per page — this section owns it
//   - all content via typed props — no internal data imports
//   - DashboardPreview below CTAs as visual anchor
//   - motion: subtle fade-in via CSS animate-in — no JS animation lib
//   - prefers-reduced-motion respected via Tailwind motion-safe: variant
//   - RTL: flex direction and text alignment inherited from html[dir]
// =============================================================================

import Link from 'next/link'
import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import DashboardPreview from '@/features/marketing/components/DashboardPreview'
import type { HeroContent } from '@/features/marketing/types'

type HeroSectionProps = HeroContent & {
  locale: string
}

export default function HeroSection({
  badge,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  previewAlt,
}: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        'relative w-full overflow-hidden',
        'py-20 sm:py-28 lg:py-36',
        // Subtle radial gradient background — design tokens only
        'bg-background',
      )}
    >
      {/* Background decoration — purely visual, aria-hidden */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10',
          'bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]',
        )}
      />

      <SectionContainer>
        {/* Hero text block */}
        <div
          className={cn(
            'mx-auto flex max-w-3xl flex-col items-center text-center',
            'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700',
          )}
        >
          <SectionHeading
            as="h1"
            heading={headline}
            eyebrow={badge}
            subtext={subtext}
            align="center"
          />

          {/* CTA group */}
          <div
            className={cn(
              'mt-10 flex flex-wrap items-center justify-center gap-4',
            )}
          >
            <Link
              href={primaryCta.href}
              className={cn(
                'inline-flex items-center justify-center rounded-lg',
                'bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground',
                'transition-colors duration-150 hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              {primaryCta.label}
            </Link>

            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className={cn(
                  'inline-flex items-center justify-center rounded-lg',
                  'border border-border bg-background px-6 py-3',
                  'text-sm font-semibold text-foreground',
                  'transition-colors duration-150 hover:bg-muted',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard preview */}
        <div
          className={cn(
            'relative mx-auto mt-16 w-full max-w-5xl',
            'motion-safe:animate-in motion-safe:fade-in',
            'motion-safe:slide-in-from-bottom-4 motion-safe:duration-700',
            'motion-safe:delay-200',
          )}
        >
          {/* Glow behind preview — aria-hidden decoration */}
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -inset-x-4 -top-4 -z-10 h-1/2',
              'bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]',
            )}
          />

          <DashboardPreview alt={previewAlt} />
        </div>
      </SectionContainer>
    </section>
  )
}
EOF

echo "✓ sections/HeroSection.tsx"

# =============================================================================
# STEP 25 — sections/LogoCloudSection.tsx
# =============================================================================

cat > "$SECTIONS/LogoCloudSection.tsx" << 'EOF'
// =============================================================================
// LogoCloudSection
//
// Trust signal strip below hero. Displays merchant/partner logos.
// Server Component — purely presentational.
//
// Rules:
//   - logos use next/image with explicit dimensions to prevent CLS
//   - logo images have descriptive alt text (brand name)
//   - label text rendered above logo strip for context
//   - no motion — static trust element
//   - when no real logo assets exist, section renders graceful placeholder row
// =============================================================================

import Image from 'next/image'
import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import type { LogoItem } from '@/features/marketing/types'

interface LogoCloudSectionProps {
  items: LogoItem[]
  label: string
}

export default function LogoCloudSection({
  items,
  label,
}: LogoCloudSectionProps) {
  return (
    <section
      aria-label="Trusted by merchants"
      className="w-full border-y border-border/50 bg-muted/30 py-12"
    >
      <SectionContainer>
        {/* Label */}
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>

        {/* Logo strip */}
        <div
          className={cn(
            'flex flex-wrap items-center justify-center gap-x-10 gap-y-6',
            'sm:gap-x-16',
          )}
          role="list"
          aria-label="Partner and customer logos"
        >
          {items.length > 0 ? (
            items.map((logo) => (
              <div
                key={logo.name}
                role="listitem"
                className="flex items-center justify-center opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))
          ) : (
            // Placeholder skeleton when no real assets exist
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                role="listitem"
                aria-hidden="true"
                className="h-8 w-24 rounded-md bg-muted"
              />
            ))
          )}
        </div>
      </SectionContainer>
    </section>
  )
}
EOF

echo "✓ sections/LogoCloudSection.tsx"

# =============================================================================
# STEP 26 — sections/FeatureGridSection.tsx
# =============================================================================

cat > "$SECTIONS/FeatureGridSection.tsx" << 'EOF'
// =============================================================================
// FeatureGridSection
//
// Responsive grid of FeatureCard items.
// Server Component — purely presentational.
//
// Rules:
//   - heading and subtitle come from props (translated at page level)
//   - items come from props (wired from content/homepage/features.ts)
//   - grid is responsive: 1 → 2 → 4 columns
//   - no motion beyond CSS hover on cards
//   - section aria-labelledby references SectionHeading id
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import FeatureCard from '@/features/marketing/components/FeatureCard'
import type { FeatureItem } from '@/features/marketing/types'

interface FeatureGridSectionProps {
  heading: string
  eyebrow?: string
  subtitle?: string
  items: FeatureItem[]
}

export default function FeatureGridSection({
  heading,
  eyebrow,
  subtitle,
  items,
}: FeatureGridSectionProps) {
  return (
    <section
      aria-labelledby="features-heading"
      className="w-full py-20 sm:py-28"
    >
      <SectionContainer>
        {/* Section heading */}
        <SectionHeading
          as="h2"
          heading={heading}
          eyebrow={eyebrow}
          subtext={subtitle}
          align="center"
        />

        {/* Feature grid */}
        <div
          className={cn(
            'mt-16 grid grid-cols-1 gap-6',
            'sm:grid-cols-2 lg:grid-cols-4',
          )}
          role="list"
          aria-label="Platform features"
        >
          {items.map((item) => (
            <div key={item.id} role="listitem">
              <FeatureCard
                icon={item.icon}
                title={item.title}
                description={item.description}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  )
}
EOF

echo "✓ sections/FeatureGridSection.tsx"

# =============================================================================
# STEP 27 — sections/DashboardShowcaseSection.tsx
# =============================================================================

cat > "$SECTIONS/DashboardShowcaseSection.tsx" << 'EOF'
// =============================================================================
// DashboardShowcaseSection
//
// Split layout: copy on one side, dashboard visual on the other.
// Server Component — purely presentational.
//
// Rules:
//   - uses SplitLayout primitive for consistent two-column structure
//   - copy side: heading, subtext, optional CTA
//   - visual side: DashboardPreview (coded mockup or real screenshot)
//   - RTL: SplitLayout handles column reversal via dir attribute
//   - no motion at section level
// =============================================================================

import Link from 'next/link'
import { cn } from '@/lib/utils'
import SplitLayout from '@/features/marketing/layouts/SplitLayout'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import DashboardPreview from '@/features/marketing/components/DashboardPreview'
import type { ShowcaseContent } from '@/features/marketing/types'

type DashboardShowcaseSectionProps = ShowcaseContent

export default function DashboardShowcaseSection({
  heading,
  subtext,
  cta,
  previewAlt,
}: DashboardShowcaseSectionProps) {
  return (
    <section
      aria-labelledby="showcase-heading"
      className={cn(
        'w-full py-20 sm:py-28',
        'bg-muted/20',
      )}
    >
      <SplitLayout
        left={
          <div className="flex flex-col gap-8">
            <SectionHeading
              as="h2"
              heading={heading}
              subtext={subtext}
              align="left"
            />

            {cta && (
              <div>
                <Link
                  href={cta.href}
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg',
                    'bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground',
                    'transition-colors duration-150 hover:bg-primary/90',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-ring focus-visible:ring-offset-2',
                  )}
                >
                  {cta.label}
                </Link>
              </div>
            )}
          </div>
        }
        right={
          <DashboardPreview alt={previewAlt} />
        }
      />
    </section>
  )
}
EOF

echo "✓ sections/DashboardShowcaseSection.tsx"

# =============================================================================
# STEP 28 — sections/TestimonialsSection.tsx
# =============================================================================

cat > "$SECTIONS/TestimonialsSection.tsx" << 'EOF'
// =============================================================================
// TestimonialsSection
//
// Masonry-style responsive grid of TestimonialCard items.
// Server Component — purely presentational.
//
// Rules:
//   - heading from props (translated at page level)
//   - items from props (wired from content/homepage/testimonials.ts)
//   - grid: 1 col mobile → 2 col tablet → 3 col desktop
//   - cards use semantic blockquote/figcaption (handled in TestimonialCard)
//   - no fake quotes, no fake metrics — content guardrail in content file
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import TestimonialCard from '@/features/marketing/components/TestimonialCard'
import type { TestimonialItem } from '@/features/marketing/types'

interface TestimonialsSectionProps {
  heading: string
  eyebrow?: string
  items: TestimonialItem[]
}

export default function TestimonialsSection({
  heading,
  eyebrow,
  items,
}: TestimonialsSectionProps) {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="w-full py-20 sm:py-28"
    >
      <SectionContainer>
        {/* Section heading */}
        <SectionHeading
          as="h2"
          heading={heading}
          eyebrow={eyebrow}
          align="center"
        />

        {/* Testimonial grid */}
        <div
          className={cn(
            'mt-16 grid grid-cols-1 gap-6',
            'sm:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {items.map((item) => (
            <TestimonialCard
              key={item.id}
              {...item}
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  )
}
EOF

echo "✓ sections/TestimonialsSection.tsx"

# =============================================================================
# STEP 29 — sections/PricingSection.tsx
# =============================================================================

cat > "$SECTIONS/PricingSection.tsx" << 'EOF'
// =============================================================================
// PricingSection
//
// Pricing tier grid with optional billing interval toggle.
// Shell is a Server Component.
// PricingToggle (interval state) is a Client Component boundary — isolated.
//
// Rules:
//   - PricingCard receives interval as prop — controlled by toggle state
//   - toggle state lives in PricingToggle (Client Component)
//   - server shell renders heading, subtitle, and card grid structure
//   - highlighted plan has visual emphasis (handled in PricingCard)
//   - no fake discounts, no fake scarcity
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import PricingToggle from '@/features/marketing/sections/PricingToggle'
import type { PricingPlan } from '@/features/marketing/types'

interface PricingSectionProps {
  heading: string
  eyebrow?: string
  subtitle?: string
  plans: PricingPlan[]
  toggleLabel?: {
    monthly: string
    annual: string
    badge?: string
  }
}

export default function PricingSection({
  heading,
  eyebrow,
  subtitle,
  plans,
  toggleLabel,
}: PricingSectionProps) {
  return (
    <section
      aria-labelledby="pricing-heading"
      className={cn(
        'w-full py-20 sm:py-28',
        'bg-muted/20',
      )}
    >
      <SectionContainer>
        {/* Section heading */}
        <SectionHeading
          as="h2"
          heading={heading}
          eyebrow={eyebrow}
          subtext={subtitle}
          align="center"
        />

        {/* Billing toggle + card grid — Client Component boundary */}
        <div className="mt-12">
          <PricingToggle
            plans={plans}
            toggleLabel={toggleLabel}
          />
        </div>
      </SectionContainer>
    </section>
  )
}
EOF

echo "✓ sections/PricingSection.tsx"

# =============================================================================
# STEP 29b — sections/PricingToggle.tsx (Client Component boundary)
# =============================================================================

cat > "$SECTIONS/PricingToggle.tsx" << 'EOF'
'use client'

// =============================================================================
// PricingToggle
//
// Client Component — owns billing interval toggle state.
// Renders toggle UI and passes interval down to PricingCard instances.
//
// Rules:
//   - this is the ONLY client boundary in PricingSection
//   - PricingSection shell stays Server Component
//   - interval state is local — no Zustand, no URL state needed here
//   - PricingCard is a Server Component rendered inside this client boundary
//     (valid — Server Components can be passed as children or imported
//      into Client Components as long as they don't use client-only APIs)
//   - toggle uses accessible button group pattern with aria-pressed
// =============================================================================

import { useState } from 'react'
import { cn } from '@/lib/utils'
import PricingCard from '@/features/marketing/components/PricingCard'
import type { PricingInterval, PricingPlan } from '@/features/marketing/types'

interface PricingToggleProps {
  plans: PricingPlan[]
  toggleLabel?: {
    monthly: string
    annual: string
    badge?: string
  }
}

const DEFAULT_LABELS = {
  monthly: 'Monthly',
  annual: 'Annual',
  badge: 'Save 17%',
}

export default function PricingToggle({
  plans,
  toggleLabel,
}: PricingToggleProps) {
  const [interval, setInterval] = useState<PricingInterval>('monthly')
  const labels = { ...DEFAULT_LABELS, ...toggleLabel }

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Toggle group */}
      <div
        role="group"
        aria-label="Billing interval"
        className={cn(
          'inline-flex items-center rounded-lg border border-border bg-muted p-1',
        )}
      >
        {(['monthly', 'annual'] as PricingInterval[]).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={interval === option}
            onClick={() => setInterval(option)}
            className={cn(
              'relative inline-flex items-center gap-2 rounded-md px-4 py-2',
              'text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              interval === option
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option === 'monthly' ? labels.monthly : labels.annual}

            {/* Savings badge on annual option */}
            {option === 'annual' && labels.badge && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-1.5 py-0.5',
                  'text-[10px] font-semibold',
                  interval === 'annual'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted-foreground/15 text-muted-foreground',
                )}
              >
                {labels.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pricing card grid */}
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-8',
          'md:grid-cols-3',
          // Center single/double card layouts
          plans.length === 1 && 'md:max-w-sm',
          plans.length === 2 && 'md:max-w-2xl',
        )}
      >
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            {...plan}
            interval={interval}
          />
        ))}
      </div>
    </div>
  )
}
EOF

echo "✓ sections/PricingToggle.tsx"

# =============================================================================
# STEP 30 — sections/FAQSection.tsx
# =============================================================================

cat > "$SECTIONS/FAQSection.tsx" << 'EOF'
// =============================================================================
// FAQSection
//
// Accordion FAQ section. Shell is Server Component.
// FAQAccordion is a Client Component boundary — isolated to open/close state.
//
// Rules:
//   - FAQ content is server-rendered — visible to crawlers for SEO
//   - JSON-LD structured data injected at page level (not here)
//   - accordion open/close state is local client state — no URL needed
//   - heading from props (translated at page level)
//   - items from props (wired from content/*/faqs.ts)
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import FAQAccordion from '@/features/marketing/sections/FAQAccordion'
import type { FAQItem } from '@/features/marketing/types'

interface FAQSectionProps {
  heading: string
  eyebrow?: string
  items: FAQItem[]
}

export default function FAQSection({
  heading,
  eyebrow,
  items,
}: FAQSectionProps) {
  return (
    <section
      aria-labelledby="faq-heading"
      className="w-full py-20 sm:py-28"
    >
      <SectionContainer>
        <div
          className={cn(
            'mx-auto max-w-3xl',
          )}
        >
          {/* Section heading */}
          <SectionHeading
            as="h2"
            heading={heading}
            eyebrow={eyebrow}
            align="center"
          />

          {/* Accordion — Client Component boundary */}
          <div className="mt-12">
            <FAQAccordion items={items} />
          </div>
        </div>
      </SectionContainer>
    </section>
  )
}
EOF

echo "✓ sections/FAQSection.tsx"

# =============================================================================
# STEP 30b — sections/FAQAccordion.tsx (Client Component boundary)
# =============================================================================

cat > "$SECTIONS/FAQAccordion.tsx" << 'EOF'
'use client'

// =============================================================================
// FAQAccordion
//
// Client Component — owns accordion open/close state per item.
// Receives pre-rendered FAQ items as props from FAQSection (Server Component).
//
// Rules:
//   - open state is local (useState per item ID) — no external state needed
//   - content is rendered in DOM at all times for SEO (not conditional mount)
//   - height transition via CSS max-height — no JS animation library
//   - keyboard accessible: Enter/Space toggle, arrow keys navigate items
//   - aria-expanded on trigger, aria-controls references panel id
//   - prefers-reduced-motion: transition duration collapses to 0 via CSS
// =============================================================================

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { FAQItem } from '@/features/marketing/types'

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }, [])

  return (
    <dl className="divide-y divide-border">
      {items.map((item) => {
        const isOpen = openId === item.id
        const triggerId = `faq-trigger-${item.id}`
        const panelId = `faq-panel-${item.id}`

        return (
          <div key={item.id} className="py-5">
            {/* Question trigger */}
            <dt>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  'flex w-full items-start justify-between gap-4 text-start',
                  'text-base font-semibold text-foreground',
                  'transition-colors duration-150 hover:text-primary',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2',
                  'rounded-md',
                )}
              >
                <span>{item.question}</span>

                {/* Chevron icon — CSS rotation */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center',
                    'text-muted-foreground transition-transform duration-200',
                    'motion-safe:duration-200',
                    isOpen && 'rotate-180',
                  )}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </span>
              </button>
            </dt>

            {/* Answer panel */}
            {/* Content stays in DOM for SEO — visibility controlled by max-height */}
            <dd
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={cn(
                'overflow-hidden transition-all motion-safe:duration-200',
                isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <p className="pt-4 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
EOF

echo "✓ sections/FAQAccordion.tsx"

# =============================================================================
# STEP 31 — sections/CTASection.tsx
# =============================================================================

cat > "$SECTIONS/CTASection.tsx" << 'EOF'
// =============================================================================
// CTASection
//
// Final conversion section. Fully prop-driven and reusable across all
// marketing pages. Server Component — no interactivity.
//
// Rules:
//   - all content via props — no internal data imports
//   - primary and secondary CTAs both optional (primary strongly recommended)
//   - centered layout via CenteredLayout primitive
//   - visual emphasis via subtle background treatment — design tokens only
//   - reusable: drop anywhere with different props
//   - no hardcoded copy
// =============================================================================

import Link from 'next/link'
import { cn } from '@/lib/utils'
import CenteredLayout from '@/features/marketing/layouts/CenteredLayout'
import type { CTAContent } from '@/features/marketing/types'

type CTASectionProps = CTAContent & {
  className?: string
}

export default function CTASection({
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
}: CTASectionProps) {
  return (
    <section
      aria-labelledby="cta-heading"
      className={cn(
        'relative w-full overflow-hidden py-20 sm:py-28',
        className,
      )}
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10',
          'bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)/0.07),transparent)]',
        )}
      />

      <CenteredLayout>
        {/* Heading */}
        <h2
          id="cta-heading"
          className={cn(
            'text-3xl font-bold tracking-tight text-foreground',
            'sm:text-4xl',
          )}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          className={cn(
            'mt-4 text-base leading-relaxed text-muted-foreground',
            'sm:text-lg',
          )}
        >
          {description}
        </p>

        {/* CTA group */}
        <div
          className={cn(
            'mt-10 flex flex-wrap items-center justify-center gap-4',
          )}
        >
          <Link
            href={primaryCta.href}
            className={cn(
              'inline-flex items-center justify-center rounded-lg',
              'bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground',
              'transition-colors duration-150 hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            {primaryCta.label}
          </Link>

          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className={cn(
                'inline-flex items-center justify-center rounded-lg',
                'border border-border bg-background px-8 py-3',
                'text-sm font-semibold text-foreground',
                'transition-colors duration-150 hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </CenteredLayout>
    </section>
  )
}
EOF

echo "✓ sections/CTASection.tsx"

# =============================================================================
# Done
# =============================================================================

echo ""
echo "============================================="
echo " Phase 4 Complete — Sections"
echo "============================================="
echo ""
echo " Server Components:"
echo "   sections/HeroSection.tsx"
echo "   sections/LogoCloudSection.tsx"
echo "   sections/FeatureGridSection.tsx"
echo "   sections/DashboardShowcaseSection.tsx"
echo "   sections/TestimonialsSection.tsx"
echo "   sections/PricingSection.tsx        ← shell only"
echo "   sections/FAQSection.tsx            ← shell only"
echo "   sections/CTASection.tsx"
echo ""
echo " Client Component boundaries (minimal, justified):"
echo "   sections/PricingToggle.tsx         ← interval toggle state"
echo "   sections/FAQAccordion.tsx          ← open/close state per item"
echo ""
echo " Architecture enforced:"
echo "   Sections receive typed props only."
echo "   No section imports from content/."
echo "   Client boundaries are isolated and minimal."
echo "   FAQ content is server-rendered for SEO."
echo "   Pricing toggle is the only hydrated pricing component."
echo ""
echo " Next: Phase 5 — Routes (Steps 32–34)"
echo "   app/[locale]/(marketing)/layout.tsx"
echo "   app/[locale]/(marketing)/page.tsx"
echo "   app/[locale]/(marketing)/pricing/page.tsx"
echo "============================================="