'use client';

/**
 * SidebarNavItem component.
 * Individual navigation item with active state styling.
 * 
 * Reason for 'use client': uses Link and interactive state.
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isCollapsed: boolean;
  isActive: boolean;
}

/**
 * Single navigation item with icon and label.
 * Shows only icon when collapsed, with tooltip.
 */
export function SidebarNavItem({
  label,
  href,
  icon: Icon,
  isCollapsed,
  isActive,
}: SidebarNavItemProps) {
  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        title={isCollapsed ? label : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    </li>
  );
}
