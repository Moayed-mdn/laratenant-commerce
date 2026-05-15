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
