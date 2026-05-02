'use client';

/**
 * UserMenu component.
 * Dropdown menu with user info and logout action.
 * 
 * Reason for 'use client': interactive dropdown with auth state.
 */

import { useAuthStore, selectUser } from '@/stores/authStore';
import { useLogout } from '@/hooks/auth/useLogout';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ROUTES } from '@/config/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { logger } from '@/lib/logger';

/**
 * User menu dropdown with logout functionality.
 */
export function UserMenu() {
  const user = useAuthStore(selectUser);
  const router = useRouter();
  const t = useTranslations('auth');

  const { mutate: logout, isPending } = useLogout({
    onSuccess: () => {
      toast.success(t('loggedOut'));
      router.push(ROUTES.auth.login());
    },
    onError: (error) => {
      logger.error('Logout error', { error });
      toast.error(error.message);
    },
  });

  // Get user initials
  const getInitials = (name: string | null): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          type="button"
          className="relative h-8 w-8 rounded-full"
          aria-label={user?.name ?? 'User menu'}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(user?.name ?? null)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} disabled={isPending}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{isPending ? t('loggingOut') : t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
