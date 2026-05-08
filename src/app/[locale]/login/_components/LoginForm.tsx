'use client';

/**
 * Login form component with validation and submission handling.
 * Uses server action for Bearer token auth with HttpOnly cookie.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo, useTransition } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ApiError } from '@/types/api';
import { logger } from '@/lib/logger';

export function LoginForm() {
  const t = useTranslations('login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const setUser = useAuthStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Build schema with translated error messages - memoized to prevent recreation
  const LoginSchema = useMemo(() => z.object({
    email: z.string().email({ message: t('errors.invalidEmail') }),
    password: z.string().min(8, { message: t('errors.passwordTooShort') }),
  }), [t]);

  type LoginFormData = z.infer<typeof LoginSchema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    logger.debug('Submitting login form');
    startTransition(async () => {
      try {
        const result = await login({ email: data.email, password: data.password });
        const user = result.user;
        setUser(user);
        toast.success(t('success.loggedIn'));

        const redirectParam = searchParams.get('redirect');
        const destination =
          redirectParam && redirectParam.startsWith(`/${locale}`)
            ? redirectParam.slice(`/${locale}`.length)
            : '/';

        router.push(destination);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.errors?.email?.[0]) {
          setError('email', { message: apiError.errors.email[0] });
        }
        if (apiError.errors?.password?.[0]) {
          setError('password', { message: apiError.errors.password[0] });
        }
        toast.error(apiError.message || t('errors.genericError'));
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          disabled={isPending || isSubmitting}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">{t('passwordLabel')}</Label>
        <div className="relative">
          <Input
            id="password"            
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('passwordPlaceholder')}
            disabled={isPending || isSubmitting}
            {...register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-e-0 px-3 top-0 h-full  hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={t('togglePassword')}
            disabled={isPending || isSubmitting}
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
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isSubmitting}
      >
        {isPending ? t('signingIn') : t('submitButton')}
      </Button>
    </form>
  );
}
