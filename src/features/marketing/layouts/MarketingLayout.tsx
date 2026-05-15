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
}

export default function MarketingLayout({
  children,
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
        <MarketingNavbar />

        <main
          id="main-content"
          className="flex-1"
          role="main"
        >
          {children}
        </main>

        <MarketingFooter />
      </div>
    </>
  )
}
