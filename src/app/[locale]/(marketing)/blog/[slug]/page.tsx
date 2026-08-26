import { getLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { buildMetadataFromSeo } from '@/lib/seo/cms-seo';
import { cmsService } from '@/services/cms/cms.service';
import { CmsContent } from '@/components/cms/CmsContent';
import { JsonLd } from '@/components/cms/JsonLd';
import SectionContainer from '@/features/marketing/layouts/SectionContainer';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/date';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  try {
    const post = await cmsService.getBlogPost(slug);
    return buildMetadataFromSeo(post.seo, locale);
  } catch (error) {
    const t = await getTranslations({ locale, namespace: 'marketing.sections.blog' });
    return {
      title: t('post.notFound'),
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketing.sections.blog' });

  try {
    const post = await cmsService.getBlogPost(slug);

    return (
      <article className="pb-20">
        {post.seo?.structured_data && (
          <JsonLd data={post.seo.structured_data} />
        )}
        <header className="bg-muted/30 py-16 md:py-24">
          <SectionContainer>
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center items-center gap-4 mb-6">
                <Badge variant="outline" className="px-3 py-1">
                  {post.category.name}
                </Badge>
                {post.published_at && (
                  <time className="text-sm text-muted-foreground" dateTime={post.published_at}>
                    {formatDate(post.published_at, 'MMM d, yyyy', locale as 'en' | 'ar')}
                  </time>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-3">
                {post.author.avatar && (
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image src={post.author.avatar} alt={post.author.name} fill />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">{t('post.author')}</p>
                </div>
              </div>
            </div>
          </SectionContainer>
        </header>

        {post.featured_image && (
          <SectionContainer className="-mt-12 md:-mt-16 mb-16">
            <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </SectionContainer>
        )}

        <SectionContainer>
          <div className="max-w-3xl mx-auto">
            <CmsContent content={post.content || ''} />
          </div>
        </SectionContainer>
      </article>
    );
  } catch (error) {
    notFound();
  }
}
