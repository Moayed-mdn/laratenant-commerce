import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/cms';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/date';

interface BlogCardProps {
  post: BlogPost;
  locale: string;
}

export function BlogCard({ post, locale }: BlogCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/${locale}/blog/${post.slug}`} className="relative h-48 w-full block">
        <Image
          src={post.featured_image || '/placeholder-blog.jpg'}
          alt={post.title}
          fill
          className="object-cover"
        />
      </Link>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary">{post.category.name}</Badge>
          {post.published_at && (
            <span className="text-xs text-muted-foreground">{formatDate(post.published_at, 'MMM d, yyyy', locale as 'en' | 'ar')}</span>
          )}
        </div>
        <Link href={`/${locale}/blog/${post.slug}`} className="hover:text-primary transition-colors">
          <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="p-4 mt-auto pt-0">
        <div className="flex items-center gap-2">
          {post.author.avatar && (
            <div className="relative h-6 w-6 rounded-full overflow-hidden">
              <Image src={post.author.avatar} alt={post.author.name} fill />
            </div>
          )}
          <span className="text-xs font-medium">{post.author.name}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
