'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmailVerificationSuccessPage() {
  const t = useTranslations('verifyEmail');
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <CardTitle>{t('successTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{t('successDescription')}</p>
          <Button onClick={() => router.push('/login')} className="w-full">
            {t('backToLogin')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
