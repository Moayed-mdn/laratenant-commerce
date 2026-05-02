/**
 * User detail page content (async RSC).
 * Fetches user data and renders the detail card.
 */

import { serverFetch } from '@/lib/api/server/client';
import { API_ROUTES } from '@/config/routes';
import type { ApiResponse } from '@/types/api';
import type { UserDetail } from '@/types/user';
import { mapUserDetail } from '@/lib/mappers/users';
import { logger } from '@/lib/logger';
import { getTranslations } from 'next-intl/server';
import UserDetailCard from './UserDetailCard';

interface Props {
  storeId: string;
  userId: string;
}

export default async function UserDetailContent({ storeId, userId }: Props) {
  const t = await getTranslations('users');

  try {
    const response = await serverFetch<ApiResponse<UserDetail>>(
      API_ROUTES.store(storeId).users.detail(userId)
    );

    const user = mapUserDetail(response.data);

    return <UserDetailCard user={user} storeId={storeId} />;
  } catch (error) {
    logger.error('Failed to load user detail', { error });

    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
        <p className="text-destructive">{t('table.empty')}</p>
      </div>
    );
  }
}
