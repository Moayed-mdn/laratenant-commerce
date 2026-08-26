'use client';

import { useState } from 'react';
import type { Store } from '@/types/store';
import type { ApiError } from '@/types/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useTranslations } from 'next-intl';
import { useUpdateStore } from './useUpdateStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoreRouteParam } from '@/lib/stores/route-param';

const schema = z.object({
  name: z.string().min(3, 'Store name must be at least 3 characters.'),
});

type StoreSettingsFormData = z.infer<typeof schema>;

interface StoreSettingsFormProps {
  store: Store;
}

/**
 * Store Settings Form.
 * Allows editing basic store metadata like name.
 */
export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const t = useTranslations('settings.store');
  const [showSaved, setShowSaved] = useState(false);
  const updateStoreMutation = useUpdateStore(getStoreRouteParam(store));

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: store.name,
    },
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateStoreMutation.mutateAsync(data);
      reset({ name: data.name });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors?.name?.[0]) {
        setError('name', { message: apiError.errors.name[0] });
      }
    }
  });

  const isPending = updateStoreMutation.isPending;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="store-name">{t('name')}</Label>
            <Input
              id="store-name"
              {...register('name')}
              placeholder={t('namePlaceholder')}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('nameHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-slug">{t('slug')}</Label>
            <Input
              id="store-slug"
              value={store.slug}
              disabled
              className="bg-muted opacity-70"
            />
            <p className="text-xs text-muted-foreground">
              {t('slugHint')}
            </p>
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                {t('slugChangeQuestion')}
              </summary>
              <p className="mt-2 text-xs text-muted-foreground">
                {t('slugChangeAnswer')}
              </p>
            </details>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <div>
              {showSaved ? (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('saved')}
                </span>
              ) : null}
            </div>
            <Button 
              type="submit" 
              disabled={!isValid || !isDirty || isPending}
              className={cn(showSaved && 'bg-success hover:bg-success/90')}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
