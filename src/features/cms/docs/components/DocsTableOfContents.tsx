'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { TocHeading } from '../utils/toc';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface DocsTableOfContentsProps {
  headings: TocHeading[];
  title?: string;
}

export function DocsTableOfContents({ headings, title }: DocsTableOfContentsProps) {
  const t = useTranslations('marketing.sections.docs');
  const resolvedTitle = title ?? t('onThisPage');
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      // Find the first entry that is intersecting
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        setActiveId(visibleEntry.target.id);
      }
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: '-100px 0% -80% 0%',
      threshold: 0,
    });

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.current?.observe(element);
      }
    });

    return () => observer.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      
      // Update URL hash without jumping
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };

  return (
    <nav className="space-y-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">
        {resolvedTitle}
      </h4>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              'transition-colors duration-200',
              heading.level === 3 && 'ml-4'
            )}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={cn(
                'block py-1 px-2 rounded-md hover:bg-muted/50 transition-all',
                activeId === heading.id
                  ? 'text-primary font-medium bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={activeId === heading.id ? 'location' : undefined}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
