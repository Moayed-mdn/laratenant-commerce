/**
 * Skeleton loader for the categories list page.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
