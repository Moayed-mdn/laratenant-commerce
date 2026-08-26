import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { FooterSectionProps, NavigationItem } from '@/types/runtime';

function renderFooterLinks(items: NavigationItem[]): React.ReactNode {
  return items.map((item) => (
    <li key={item.id}>
      {item.external ? (
        <a
          href={item.path}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {item.label}
        </a>
      ) : (
        <Link
          href={item.path}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {item.label}
        </Link>
      )}
    </li>
  ));
}

export default function FooterSection({ menu, storeName, copyrightYear, showSocial }: FooterSectionProps) {
  const t = useTranslations('storefront.footer');
  const year = copyrightYear ?? new Date().getFullYear();
  const name = storeName ?? t('defaultStoreName');
  const items = menu ?? [];

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {t('copyright', { year, name })}
            </p>
          </div>
          {items.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3">{t('navigation')}</h4>
              <ul className="space-y-2">
                {renderFooterLinks(items)}
              </ul>
            </div>
          )}
          {showSocial && (
            <div>
              <h4 className="font-medium text-sm mb-3">{t('followUs')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('socialComingSoon')}
              </p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
