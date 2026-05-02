'use client';

/**
 * Login form component with validation and submission handling.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

import { useLogin } from '@/hooks/auth/useLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/config/routes';
import type { ApiError } from '@/types/api';

export function LoginForm() {
  const t = useTranslations('login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  // Build schema with translated error messages
  const LoginSchema = z.object({
    email: z.string().email({ message: t('errors.invalidEmail') }),
    password: z.string().min(8, { message: t('errors.passwordTooShort') }),
  });

  type LoginFormData = z.infer<typeof LoginSchema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const { mutate, isPending } = useLogin({
    onSuccess: (storeId) => {
      if (!storeId) {
        toast.error(t('errors.noStoreAssigned'));
      } else {
        toast.success(t('success.loggedIn'));
        router.push(ROUTES.store(storeId).dashboard());
      }
    },
    onError: (error: ApiError) => {
      // Handle field-level errors from API
      if (error.errors && typeof error.errors === 'object') {
        if (error.errors.email?.[0]) {
          setError('email', { message: error.errors.email[0] });
        }
        if (error.errors.password?.[0]) {
          setError('password', { message: error.errors.password[0] });
        }
      }

      // Always show toast for general error
      toast.error(error.message || t('errors.genericError'));
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await mutate(data);
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
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
