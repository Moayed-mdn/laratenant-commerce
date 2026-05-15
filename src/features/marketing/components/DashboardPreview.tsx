// =============================================================================
// DashboardPreview
//
// Browser-chrome mockup shell that renders a structured placeholder
// representing the admin dashboard UI.
//
// Rules:
//   - Server Component — no client state, no browser APIs
//   - structured placeholder until real screenshot asset exists
//   - swap interior for next/image with zero structural change
//   - alt text required via prop for accessibility
//   - dimensions are explicit to prevent CLS
//   - no hardcoded colors — design tokens only
// =============================================================================

import { cn } from '@/lib/utils'

interface DashboardPreviewProps {
  alt: string
  className?: string
}

export default function DashboardPreview({
  alt,
  className,
}: DashboardPreviewProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-border',
        'bg-card shadow-2xl',
        className,
      )}
    >
      {/* Browser chrome bar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
        {/* Traffic lights */}
        <span className="h-3 w-3 rounded-full bg-red-400/60" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
        <span className="h-3 w-3 rounded-full bg-green-400/60" />

        {/* Fake URL bar */}
        <div className="mx-auto flex h-6 w-full max-w-xs items-center rounded-md border border-border bg-background px-3">
          <span className="truncate text-xs text-muted-foreground">
            app.laratenant.com/dashboard
          </span>
        </div>
      </div>

      {/* Dashboard interior placeholder */}
      <div className="flex h-[420px] bg-background">
        {/* Sidebar */}
        <aside className="flex w-16 flex-col gap-3 border-e border-border bg-muted/40 p-3 sm:w-48">
          <div className="h-8 rounded-md bg-muted" />
          <div className="mt-2 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-7 rounded-md bg-muted"
                style={{ opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Stat cards row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
              >
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-6 w-20 rounded bg-muted" />
                <div className="h-2 w-12 rounded bg-muted/60" />
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="flex-1 rounded-lg border border-border bg-card p-4">
            <div className="mb-3 h-4 w-32 rounded bg-muted" />
            <div className="flex h-full max-h-40 items-end gap-2 pb-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-primary/20"
                  style={{
                    height: `${30 + Math.round(Math.sin(i * 0.7 + 1) * 25 + 40)}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Table placeholder */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 h-4 w-24 rounded bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="h-3 flex-1 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted/60" />
                  <div className="h-5 w-14 rounded-full bg-primary/15" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
