// RSC ONLY — do not import from client components
// Reason: uses getTranslations from next-intl/server (async RSC)

/**
 * User role badge component.
 * Displays user role with appropriate styling.
 */

import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types/user';

interface Props {
  role: UserRole;
}

const variantMap: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  store_admin: 'default',
  staff: 'secondary',
  super_admin: 'outline',
};

export default async function UserRoleBadge({ role }: Props) {
  const t = await getTranslations('users');

  return (
    <Badge variant={variantMap[role]}>
      {t(`roles.${role}`)}
    </Badge>
  );
}
