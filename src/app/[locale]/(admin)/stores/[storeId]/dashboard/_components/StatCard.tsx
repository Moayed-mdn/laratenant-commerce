/**
 * Stat card component for dashboard stats.
 * Pure display component — no client state needed.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type StatCardIcon = 'revenue' | 'orders' | 'customers' | 'products';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isUp: boolean;
  icon: StatCardIcon;
}

const iconMap: Record<StatCardIcon, ReactNode> = {
  revenue: <DollarSign className="h-4 w-4" aria-hidden="true" />,
  orders: <ShoppingCart className="h-4 w-4" aria-hidden="true" />,
  customers: <Users className="h-4 w-4" aria-hidden="true" />,
  products: <Package className="h-4 w-4" aria-hidden="true" />,
};

/**
 * Stat card component displaying a single metric with trend indicator.
 */
export function StatCard({ title, value, change, isUp, icon }: StatCardProps) {
  const IconComponent = iconMap[icon];
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted">{title}</CardTitle>
        {IconComponent}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs mt-1">
          <TrendIcon
            className={`h-3 w-3 ${isUp ? 'text-success' : 'text-destructive'}`}
            aria-hidden="true"
          />
          <span className={isUp ? 'text-success' : 'text-destructive'}>{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}
