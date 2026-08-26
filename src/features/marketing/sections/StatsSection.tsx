import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import type { StatItem } from '@/features/marketing/types'

interface StatsSectionProps {
  items: StatItem[]
  className?: string
}

export default function StatsSection({
  items,
  className,
}: StatsSectionProps) {
  const t = useTranslations('marketing.sections.stats')
  return (
    <section
      aria-label={t('a11yLabel')}
      className={cn('w-full py-10 sm:py-14', className)}
    >
      <SectionContainer>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className={cn(
                'flex h-full flex-col gap-3 rounded-2xl border border-border',
                'bg-card/80 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md',
              )}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                {item.value}
              </p>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">{item.label}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </SectionContainer>
    </section>
  )
}
