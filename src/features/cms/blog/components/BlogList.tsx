import { useTranslations } from 'next-intl';
import { BlogPost } from '@/types/cms';
import { BlogCard } from './BlogCard';

interface BlogListProps {
  posts: BlogPost[];
  locale: string;
}

export function BlogList({ posts, locale }: BlogListProps) {
  const t = useTranslations('marketing.sections.blog');

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-medium">{t('list.empty.title')}</h3>
        <p className="text-muted-foreground">{t('list.empty.description')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}
