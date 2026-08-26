import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { BootstrapProvider } from '@/components/providers/BootstrapProvider';
import { Toaster } from '@/components/ui/sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost')
  );
}

function resolveMetadataBaseHost(headerList: Headers): URL {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSiteUrl) {
    return new URL(envSiteUrl);
  }

  const forwardedHost = headerList.get('x-forwarded-host');
  const host = forwardedHost ?? headerList.get('host');
  if (host) {
    const hostname = host.split(':')[0]?.toLowerCase() ?? '';
    const protocol = headerList.get('x-forwarded-proto') ?? (isLocalHostname(hostname) ? 'http' : 'https');
    return new URL(`${protocol}://${host}`);
  }

  const fallbackHost =
    process.env.NODE_ENV === 'development'
      ? `${process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'localhost'}:3000`
      : 'localhost:3000';
  const fallbackHostname = fallbackHost.split(':')[0]?.toLowerCase() ?? '';
  const fallbackProtocol = isLocalHostname(fallbackHostname) ? 'http' : 'https';

  return new URL(`${fallbackProtocol}://${fallbackHost}`);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const [headerList, { locale }] = await Promise.all([headers(), params]);
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    metadataBase: resolveMetadataBaseHost(headerList),
    title: t('siteTitle'),
    description: t('siteDescription'),
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  
  // next-intl v4.x does not require setRequestLocale - removed per v4 requirements

  // Get messages for the current locale
  const messages = await getMessages();

  // Determine direction based on locale
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <NuqsAdapter>
          <QueryProvider>
            <NextIntlClientProvider messages={messages}>
              <BootstrapProvider>
                {children}
              </BootstrapProvider>
              <Toaster />
            </NextIntlClientProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
