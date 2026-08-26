'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { verifyEmail } from '@/lib/api/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
    hash: string;
  }>;
}

export default function VerifyEmailPage({ params }: PageProps) {
  const t = useTranslations('verifyEmail');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Unwrap params using use()
  const { id, hash } = use(params);

  useEffect(() => {
    const expires = searchParams.get('expires');
    const signature = searchParams.get('signature');

    if (!id || !hash || !expires || !signature) {
      setStatus('error');
      setErrorMessage(t('errors.invalidLink'));
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail({ id, hash, expires, signature });
        setStatus('success');
        setTimeout(() => {
          router.push('/email-verification-success');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || t('errors.verificationFailed'));
      }
    };

    verify();
  }, [id, hash, searchParams, router, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>{t('loading')}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-success" />
              <p className="text-lg font-medium">{t('success')}</p>
              <p className="text-sm text-muted-foreground">{t('redirecting')}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-medium">{t('error')}</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button onClick={() => router.push('/login')} className="mt-4">
                {t('backToLogin')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
