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
