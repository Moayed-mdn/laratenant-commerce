'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useTranslations } from 'next-intl';
import { useUpdatePassword } from '@/hooks/profile/useUpdatePassword';
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
import { CheckCircle2, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiError } from '@/types/api';

const schema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

type PasswordFormData = z.infer<typeof schema>;

/**
 * Profile Password Card.
 * Allows changing user password.
 */
export function ProfilePasswordCard() {
  const t = useTranslations('settings');
  const [showSaved, setShowSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const updatePasswordMutation = useUpdatePassword();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updatePasswordMutation.mutateAsync(data);
      reset();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors) {
        if (apiError.errors.current_password?.[0]) {
          setError('current_password', { message: apiError.errors.current_password[0] });
        }
        if (apiError.errors.password?.[0]) {
          setError('password', { message: apiError.errors.password[0] });
        }
        if (apiError.errors.password_confirmation?.[0]) {
          setError('password_confirmation', { message: apiError.errors.password_confirmation[0] });
        }
      } else if (apiError.message) {
        setError('current_password', { message: apiError.message });
      }
    }
  });

  const isPending = updatePasswordMutation.isPending;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <CardTitle>{t('profile.password.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('profile.password.subtitle')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current-password">{t('profile.password.currentPassword')}</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('current_password')}
                placeholder={t('profile.password.currentPasswordPlaceholder')}
                disabled={isPending}
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.current_password && (
              <p className="text-sm text-destructive">{errors.current_password.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('profile.password.newPassword')}</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder={t('profile.password.newPasswordPlaceholder')}
                disabled={isPending}
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('profile.password.requirements')}
            </p>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('profile.password.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('password_confirmation')}
                placeholder={t('profile.password.confirmPasswordPlaceholder')}
                disabled={isPending}
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <div>
              {showSaved ? (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('profile.password.passwordUpdated')}
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
                  {t('profile.password.updating')}
                </>
              ) : (
                t('profile.password.updatePassword')
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
