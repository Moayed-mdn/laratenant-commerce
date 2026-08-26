'use client';

/**
 * Dialog containing the form to create a new merchant user.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCreateUser } from '@/hooks/users/useCreateUser';
import { CreateMerchantUserSchema, type CreateMerchantUserValues } from '@/schemas/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCan } from '@/stores/bootstrapStore';

interface Props {
  storeSlug: string;
}

export default function CreateUserDialog({ storeSlug }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('users');
  const canManageUsers = useCan('canManageUsers');
  
  const createMutation = useCreateUser(storeSlug, {
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const form = useForm<CreateMerchantUserValues>({
    resolver: zodResolver(CreateMerchantUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'staff',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (values: CreateMerchantUserValues) => {
    try {
      await createMutation.mutateAsync(values);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!canManageUsers) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-2 h-4 w-4" />
        {t('create')}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{t('form.createTitle')}</DialogTitle>
            <DialogDescription>{t('form.createDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('form.name')}</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('form.namePlaceholder')}
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">{t('form.email')}</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">{t('form.role')}</Label>
              <Select
                onValueChange={(value) => setValue('role', value as 'store_admin' | 'staff')}
                defaultValue="staff"
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t('form.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="store_admin">{t('roles.store_admin')}</SelectItem>
                  <SelectItem value="staff">{t('roles.staff')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">{t('form.password')}</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div className="grid gap-2">
              <Label htmlFor="password_confirmation">{t('form.confirmPassword')}</Label>
              <Input
                id="password_confirmation"
                type="password"
                {...register('password_confirmation')}
                autoComplete="new-password"
              />
              {errors.password_confirmation && (
                <p className="text-xs text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('form.creating') : t('form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
