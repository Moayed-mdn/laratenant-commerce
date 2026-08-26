import { getLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { buildMetadataFromSeo } from '@/lib/seo/cms-seo';
import { cmsService } from '@/services/cms/cms.service';
import { CmsContent } from '@/components/cms/CmsContent';
import { JsonLd } from '@/components/cms/JsonLd';
import { formatDate } from '@/lib/utils/date';
import { Separator } from '@/components/ui/separator';
import { processContentHeadings } from '@/features/cms/docs/utils/toc';
import { DocsTableOfContents } from '@/features/cms/docs/components/DocsTableOfContents';

interface DocsPageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const slugPath = slug.join('/');
  
  try {
    const page = await cmsService.getDocsPage(slugPath);
    return buildMetadataFromSeo(page.seo, locale);
  } catch (error) {
    const t = await getTranslations({ locale, namespace: 'marketing.sections.docs' });
    return {
      title: t('notFound'),
    };
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug, locale } = await params;
  const slugPath = slug.join('/');
  const t = await getTranslations({ locale, namespace: 'marketing.sections.docs' });

  try {
    const page = await cmsService.getDocsPage(slugPath);
    const { content, headings } = processContentHeadings(page.content || '');

    return (
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0 max-w-4xl">
          {page.seo?.structured_data && (
            <JsonLd data={page.seo.structured_data} />
          )}
          
          <header className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{page.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{t('lastUpdated', { date: formatDate(page.updated_at, 'MMM d, yyyy', locale as 'en' | 'ar') })}</span>
            </div>
          </header>
          
          <Separator className="mb-10" />
          
          {/* Mobile TOC - shown only on small screens */}
          {headings.length > 0 && (
            <div className="lg:hidden mb-10 p-4 bg-muted/30 rounded-xl border border-border/50">
              <DocsTableOfContents headings={headings} title={t('tableOfContents')} />
            </div>
          )}
          
          <div className="min-h-[50vh]">
            <CmsContent content={content} />
          </div>
        </div>

        {/* Desktop TOC - sticky sidebar */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <DocsTableOfContents headings={headings} />
            </div>
          </aside>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
}
