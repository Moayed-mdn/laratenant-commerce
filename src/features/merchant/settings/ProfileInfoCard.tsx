'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useTranslations } from 'next-intl';
import { useUpdateProfile } from '@/hooks/profile/useUpdateProfile';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiError } from '@/types/api';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().optional().nullable(),
});

type ProfileInfoFormData = z.infer<typeof schema>;

/**
 * Profile Information Card.
 * Allows editing basic user information (name, email, phone).
 */
export function ProfileInfoCard() {
  const t = useTranslations('settings');
  const [showSaved, setShowSaved] = useState(false);
  const user = useBootstrapStore((state) => state.user);
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileInfoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: null,
    },
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateProfileMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
      });
      reset(data);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors) {
        if (apiError.errors.name?.[0]) {
          setError('name', { message: apiError.errors.name[0] });
        }
        if (apiError.errors.email?.[0]) {
          setError('email', { message: apiError.errors.email[0] });
        }
        if (apiError.errors.phone?.[0]) {
          setError('phone', { message: apiError.errors.phone[0] });
        }
      }
    }
  });

  const isPending = updateProfileMutation.isPending;
  const isEmailVerified = user?.is_email_verified || user?.email_verified_at;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>{t('profile.info.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('profile.info.subtitle')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name">{t('profile.info.name')}</Label>
            <Input
              id="profile-name"
              {...register('name')}
              placeholder={t('profile.info.namePlaceholder')}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="profile-email">{t('profile.info.email')}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="profile-email"
                  type="email"
                  {...register('email')}
                  placeholder={t('profile.info.emailPlaceholder')}
                  disabled={isPending}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              {isEmailVerified ? (
                <Badge variant="default" className="self-start">
                  <CheckCircle2 className="me-1 h-3 w-3" />
                  {t('profile.info.emailVerified')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="self-start">
                  <AlertCircle className="me-1 h-3 w-3" />
                  {t('profile.info.emailNotVerified')}
                </Badge>
              )}
            </div>
            {!isEmailVerified && (
              <p className="text-xs text-muted-foreground">
                {t('profile.info.emailVerificationPrompt')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('profile.info.emailChangeNote')}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="profile-phone">{t('profile.info.phoneOptional')}</Label>
            <Input
              id="profile-phone"
              type="tel"
              {...register('phone')}
              placeholder={t('profile.info.phonePlaceholder')}
              disabled={isPending}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('profile.info.phoneNote')}
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <div>
              {showSaved ? (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('profile.info.saved')}
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
                  {t('profile.info.saving')}
                </>
              ) : (
                t('profile.info.save')
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
