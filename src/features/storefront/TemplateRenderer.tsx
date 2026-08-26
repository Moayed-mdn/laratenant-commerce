import { useTranslations } from 'next-intl';
import { SectionRenderer } from './sections/SectionRenderer';
import type { RuntimeSection } from '@/types/runtime';

interface TemplateRendererProps {
  sections: RuntimeSection[];
}

export function TemplateRenderer({ sections }: TemplateRendererProps) {
  const t = useTranslations('storefront');

  if (!sections || sections.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">{t('noSections')}</p>
      </div>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
