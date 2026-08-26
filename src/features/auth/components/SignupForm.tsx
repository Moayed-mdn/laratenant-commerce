'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ApiError } from '@/types/api';
import { logger } from '@/lib/logger';
import { postAuthChannelMessage } from '@/lib/auth/channel';
import { resolvePostBootstrapPath } from '@/lib/auth/bootstrap-routing';

function getPasswordStrength(password: string): {
  level: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
} {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 4) {
    return { level: 'strong', score };
  }
  if (score === 3) {
    return { level: 'good', score };
  }
  if (score === 2) {
    return { level: 'fair', score };
  }

  return { level: 'weak', score };
}

export function SignupForm() {
  const t = useTranslations('signup');
  const router = useRouter();
  const queryClient = useQueryClient();
  const registerUser = useBootstrapStore((state) => state.register);
  const [showPassword, setShowPassword] = useState(false);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const SignupSchema = useMemo(() => z.object({
    name: z.string().min(2, { message: t('errors.nameTooShort') }),
    email: z.string().email({ message: t('errors.invalidEmail') }),
    password: z.string().min(8, { message: t('errors.passwordTooShort') }),
    password_confirmation: z.string(),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('errors.passwordsDoNotMatch'),
    path: ['password_confirmation'],
  }), [t]);

  type SignupFormData = z.infer<typeof SignupSchema>;

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
  });
  const passwordValue = useWatch({ control, name: 'password' }) ?? '';
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = handleSubmit(async (data) => {
    logger.debug('Submitting signup form');
    setFormError(null);
    setIsRequestPending(true);

    try {
      const bootstrap = await registerUser(data);
      queryClient.setQueryData(queryKeys.merchant.me(), bootstrap);
      postAuthChannelMessage('login');

      toast.success(t('success.registered'));
      router.push(bootstrap ? resolvePostBootstrapPath(bootstrap) : '/onboarding');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          if (field === 'name' || field === 'email' || field === 'password' || field === 'password_confirmation') {
            setError(field, { message: messages[0] });
          }
        });
      }

      if (apiError.errors?.email?.[0]) {
        setFormError(apiError.errors.email[0]);
      } else if (apiError.status === 403) {
        setFormError(apiError.message || 'Account verification is required before dashboard access can continue.');
      } else if (Object.keys(apiError.errors ?? {}).length === 0) {
        setFormError(apiError.message || 'Unable to create your account right now. Please try again.');
      }

      toast.error(apiError.message || t('errors.genericError'));
    } finally {
      setIsRequestPending(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      {formError ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-testid="signup-form-error"
          aria-live="polite"
        >
          {formError}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="name">{t('nameLabel')}</Label>
        <Input
          id="name"
          placeholder={t('namePlaceholder')}
          data-testid="signup-name"
          disabled={isRequestPending || isSubmitting}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          data-testid="signup-email"
          disabled={isRequestPending || isSubmitting}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('passwordLabel')}</Label>
        <div className="relative">
          <Input
            id="password"            
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder')}
            data-testid="signup-password"
            disabled={isRequestPending || isSubmitting}
            {...register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-e-0 px-3 top-0 h-full hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isRequestPending || isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        {passwordValue ? (
          <div className="space-y-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('passwordStrength.label')}</span>
              <span className="font-medium">{t(`passwordStrength.levels.${passwordStrength.level}`)}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full ${
                    index < passwordStrength.score ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Use 8+ characters with upper/lowercase letters, numbers, and symbols for a stronger password.
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password_confirmation">{t('passwordConfirmationLabel')}</Label>
        <Input
          id="password_confirmation"
          type="password"
          placeholder={t('passwordConfirmationPlaceholder')}
          data-testid="signup-password-confirmation"
          disabled={isRequestPending || isSubmitting}
          {...register('password_confirmation')}
        />
        {errors.password_confirmation && (
          <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        data-testid="signup-submit"
        disabled={isRequestPending || isSubmitting}
      >
        {isRequestPending ? t('signingUp') : t('submitButton')}
      </Button>
    </form>
  );
}
