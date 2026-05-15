# Marketing SEO Standards 

## Purpose 

Marketing pages exist to: 
- acquire merchants 
- rank in search engines 
- support paid campaigns 
- maximize conversion 
- maintain strong performance scores 

SEO is a first-class architectural concern, not a post-build enhancement. 

--- 

# Metadata Standards 

## Every Marketing Page Must Define 

- title 
- description 
- canonical URL 
- OpenGraph metadata 
- Twitter metadata 
- locale alternates where applicable 

Use Next.js App Router metadata APIs only. 

Do not manually inject `<head>` tags inside components. 

--- 

# Title Rules 

## Structure 

Preferred format: 

```text 
<Page Value Proposition> | LaraTenant Commerce 
``` 

Examples: 

```text 
Start Your Online Store Today | LaraTenant Commerce 
Multi-Tenant Ecommerce Platform | LaraTenant Commerce 
AI-Powered Store Management | LaraTenant Commerce 
``` 

## Rules 

* keep under ~60 characters when possible 
* avoid keyword stuffing 
* prioritize readability and CTR 
* titles should describe outcome/value 

--- 

# Description Rules 

## Structure 

Descriptions should: 

* explain product value clearly 
* include primary keywords naturally 
* remain human-readable 
* stay under ~160 characters 

Example: 

```text 
Launch and manage your ecommerce business with a scalable multi-tenant commerce platform built for modern brands. 
``` 

## Avoid 

* generic marketing fluff 
* repeated keywords 
* excessive punctuation 
* fake urgency 

Bad: 

```text 
BEST ecommerce platform!!! #1 online store builder!!! 
``` 

--- 

# Canonical URLs 

## Rules 

* every marketing page must define canonical URL 
* canonical must include locale-aware path 
* avoid duplicate indexing between locales 

Examples: 

```text 
/en 
/ar 
/en/pricing 
/ar/pricing 
``` 

--- 

# Locale SEO 

## Rules 

* all public marketing routes are locale-aware 
* alternate locale URLs should be declared 
* translations must preserve semantic meaning, not literal word-for-word conversion 

## Avoid 

* mixed-language metadata 
* untranslated metadata 
* duplicate English metadata in Arabic pages 

--- 

# OpenGraph Standards 

## Required Fields 

* title 
* description 
* url 
* siteName 
* images 
* locale 
* type 

## OG Images 

Preferred: 

* branded 
* simple 
* high contrast 
* readable at small sizes 

Avoid: 

* busy screenshots 
* excessive text 
* tiny typography 

--- 

# Twitter Metadata 

Use summary_large_image cards. 

Include: 

* title 
* description 
* preview image 

--- 

# Structured Data 

## Preferred Types 

Use JSON-LD where appropriate: 

* SoftwareApplication 
* Organization 
* FAQPage 
* BreadcrumbList 
* Product (only when relevant) 

## Rules 

* inject structured data server-side 
* keep schema synchronized with visible page content 
* never inject fake reviews/ratings 

--- 

# Heading Hierarchy 

## Rules 

* exactly one H1 per page 
* sections should use semantic heading order 
* do not skip heading levels unnecessarily 

Preferred: 

```text 
H1 
  H2 
    H3 
``` 

--- 

# Content SEO Rules 

## Marketing Copy Should 

* prioritize clarity over keyword density 
* explain real product value 
* use meaningful headings 
* include searchable merchant terminology 

## Avoid 

* AI-generated filler text 
* repetitive paragraphs 
* meaningless buzzwords 
* fake statistics 

--- 

# Image SEO 

## Rules 

* every meaningful image requires alt text 
* alt text should describe actual content 
* decorative images should use empty alt 

## Performance 

* prefer next/image 
* avoid oversized assets 
* use responsive image sizes 
* lazy-load below-the-fold media 

--- 

# Performance Requirements 

Marketing pages must optimize for: 

* LCP 
* CLS 
* TBT 
* mobile performance 

## Rules 

* avoid unnecessary client components 
* avoid heavy animation libraries globally 
* avoid massive image payloads 
* avoid rendering hidden sections 

--- 

# Rendering Strategy 

## Preferred 

* Server Components by default 
* static rendering where possible 
* streaming only where beneficial 

## Avoid 

* client-rendering entire landing pages 
* unnecessary hydration 
* fetching marketing content client-side 

--- 

# URL Structure 

## Preferred 

```text 
/{locale} 
/{locale}/pricing 
/{locale}/features 
/{locale}/about 
/{locale}/contact 
``` 

## Avoid 

* deeply nested marketing URLs 
* inconsistent slug naming 
* mixed casing 

--- 

# Internal Linking 

## Rules 

* important marketing pages should interlink 
* CTA sections should route users intentionally 
* avoid orphan pages 

--- 

# AI Content Guardrails 

## Never Generate 

* fake customer counts 
* fake reviews 
* fake funding claims 
* fake integrations 
* fake performance metrics 

## Prefer 

* realistic positioning 
* feature clarity 
* product-specific messaging 
* merchant-focused outcomes 

--- 

# Technical SEO Rules 

## Required 

* sitemap generation 
* robots configuration 
* canonical metadata 
* locale alternates 
* semantic HTML 

## Avoid 

* duplicate metadata 
* client-only metadata generation 
* inaccessible navigation 
