# Marketing Component Architecture 

## Purpose 

Marketing pages must remain: 
- composable 
- reusable 
- SEO-friendly 
- performant 
- visually consistent 

Avoid creating one-off landing page structures with duplicated sections and styling. 

--- 

# Folder Structure 

Preferred structure: 

```text 
src/features/marketing/ 
├── components/ 
├── sections/ 
├── layouts/ 
├── data/ 
├── constants/ 
├── hooks/ 
└── types/ 
``` 

--- 

# Responsibility Boundaries 

## sections/ 

Large reusable marketing blocks. 

Examples: 

```text 
HeroSection 
FeatureGridSection 
TestimonialsSection 
PricingSection 
FAQSection 
CTASection 
LogoCloudSection 
``` 

Sections compose pages. 

--- 

# components/ 

Smaller reusable UI pieces. 

Examples: 

```text 
SectionHeading 
FeatureCard 
PricingCard 
TestimonialCard 
GradientBadge 
DashboardPreview 
``` 

Components should remain presentation-focused. 

--- 

# layouts/ 

Shared page structures. 

Examples: 

```text 
MarketingLayout 
SectionContainer 
SplitLayout 
CenteredLayout 
``` 

--- 

# data/ 

Static marketing content. 

Examples: 

```text 
features.ts 
pricing.ts 
faqs.ts 
testimonials.ts 
``` 

Avoid hardcoding large content arrays inside components. 

--- 

# constants/ 

Shared marketing constants. 

Examples: 

```text 
cta-links.ts 
social-links.ts 
brand-messages.ts 
``` 

--- 

# Component Philosophy 

## Preferred 

* small composable components 
* reusable sections 
* prop-driven configuration 
* server-rendered by default 

## Avoid 

* giant monolithic landing pages 
* deeply nested JSX 
* duplicated layouts 
* inline hardcoded content everywhere 

--- 

# Section Standards 

Every major section should support: 

* localized content 
* responsive layout 
* dark mode 
* semantic HTML 
* spacing consistency 

--- 

# Section Container Rules 

Use shared container/layout primitives. 

Avoid: 

```tsx 
<div className="max-w-[1172px] px-[17px]"> 
``` 

Prefer centralized container patterns. 

--- 

# Marketing Page Composition 

Preferred page composition: 

```tsx 
<MarketingLayout> 
  <HeroSection /> 
  <LogoCloudSection /> 
  <FeatureGridSection /> 
  <DashboardShowcaseSection /> 
  <TestimonialsSection /> 
  <PricingSection /> 
  <FAQSection /> 
  <CTASection /> 
</MarketingLayout> 
``` 

--- 

# Server vs Client Components 

## Preferred 

Marketing components should be Server Components by default. 

Use Client Components only for: 

* sliders/carousels 
* interactive pricing toggles 
* animations requiring browser APIs 
* highly interactive demos 

--- 

# Animation Rules 

## Preferred 

* subtle motion 
* fade/slide transitions 
* viewport-triggered reveals 
* lightweight animations 

## Avoid 

* excessive parallax 
* constant motion 
* distracting hover systems 
* heavy animation dependencies everywhere 

--- 

# Responsive Rules 

All marketing sections must support: 

* mobile 
* tablet 
* desktop 
* RTL layouts 

## Mobile Priority 

Design mobile-first. 

Avoid desktop-only compositions that collapse poorly. 

--- 

# Accessibility Rules 

Marketing pages must: 

* use semantic headings 
* preserve contrast ratios 
* support keyboard navigation 
* avoid inaccessible motion 
* use meaningful button labels 

--- 

# Content Separation 

## Rules 

* content should live outside JSX where practical 
* avoid embedding huge strings inside components 
* avoid mixing layout and business messaging 

--- 

# Reusability Rules 

Before creating a new section: 

1. check existing sections 
2. check existing layouts 
3. check shared marketing components 

Avoid near-duplicate sections with slightly different styling. 

--- 

# Screenshot & Visual Components 

## Rules 

* use shared showcase components 
* standardize browser/mockup frames 
* optimize screenshots 
* avoid inconsistent shadow/border systems 

--- 

# CTA Architecture 

CTA sections should be reusable and configurable. 

Preferred: 

```tsx 
<CTASection 
  title="" 
  description="" 
  primaryAction="" 
  secondaryAction="" 
/> 
``` 

Avoid hardcoded CTA blocks per page. 

--- 

# SEO & Rendering Rules 

## Rules 

* avoid client-rendering entire pages 
* keep metadata at route level 
* use semantic HTML 
* support static rendering where possible 

--- 

# Performance Rules 

## Avoid 

* shipping large animation libraries globally 
* massive unoptimized images 
* unnecessary hydration 
* oversized component trees 

## Prefer 

* code splitting 
* next/image 
* lightweight motion 
* shared section primitives 

--- 

# AI Guardrails 

## Never Generate 

* duplicated marketing sections 
* inconsistent spacing systems 
* multiple competing hero sections 
* random gradients/colors 
* deeply nested component trees 
* giant single-file landing pages 

## Prefer 

* reusable architecture 
* composable sections 
* consistent layouts 
* centralized content 
* scalable design systems 
