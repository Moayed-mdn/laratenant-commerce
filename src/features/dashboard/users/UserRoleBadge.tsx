'use client';
// Reason: used inside UsersTable client component; cannot import async RSC into client

/**
 * User role badge component.
 * Displays user role with appropriate styling.
 */

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types/user';

interface Props {
  role: UserRole | undefined;
}

const variantMap: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  store_admin: 'default',
  staff: 'secondary',
  super_admin: 'outline',
};

export function UserRoleBadge({ role }: Props) {
  const t = useTranslations('users');

  if (!role) {
    return <Badge variant="outline">{t('roles.unknown')}</Badge>;
  }

  return (
    <Badge variant={variantMap[role]}>
      {t(`roles.${role}`)}
    </Badge>
  );
}
