import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { Card } from './Card';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn('skeleton h-4 w-full', className)} style={style} />;
}

export function KpiCardSkeleton() {
  return (
    <Card className="p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-7 w-28" />
      <Skeleton className="mt-3 h-4 w-16" />
    </Card>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <Card className="p-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-5 w-full rounded-2xl" style={{ height }} />
    </Card>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="p-5">
      <Skeleton className="h-4 w-40" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </Card>
  );
}
