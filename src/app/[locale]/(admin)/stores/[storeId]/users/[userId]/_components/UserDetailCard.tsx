/**
 * User detail card component.
 * Displays user information in a card layout.
 */

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import type { UserDetailView } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { UserRoleBadge } from '../../_components/UserRoleBadge';
import DeleteUserButton from './DeleteUserButton';
import { ArrowLeft } from 'lucide-react';

interface Props {
  user: UserDetailView;
  storeId: string;
  locale: string;
}

export default async function UserDetailCard({ user, storeId, locale }: Props) {
  const t = await getTranslations('users');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.store(locale, storeId).users.list()}
          className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('detail.back')}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-medium">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserRoleBadge role={user.role} />
              <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                {user.isVerified ? t('status.verified') : t('status.unverified')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('detail.info')}
              </h3>
              <dl className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">{t('table.email')}</dt>
                  <dd className="text-sm font-medium">{user.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">{t('table.role')}</dt>
                  <dd className="text-sm font-medium">{t(`roles.${user.role ?? 'unknown'}`)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">
                    {t('detail.emailVerified')}
                  </dt>
                  <dd className="text-sm font-medium">
                    {user.isVerified && user.verifiedAt
                      ? user.verifiedAt
                      : t('detail.emailNotVerified')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('detail.timestamps')}
              </h3>
              <dl className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">{t('detail.joined')}</dt>
                  <dd className="text-sm font-medium">{user.createdAt}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">
                    {t('detail.lastUpdated')}
                  </dt>
                  <dd className="text-sm font-medium">{user.updatedAt}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <DeleteUserButton
          storeId={storeId}
          userId={String(user.id)}
          userName={user.name}
        />
      </div>
    </div>
  );
}
