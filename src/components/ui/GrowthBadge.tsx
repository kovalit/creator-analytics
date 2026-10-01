import { formatGrowth, growthTone } from '@/analytics/formatters';
import { cn } from '@/lib/cn';
import { IconTrendDown, IconTrendUp } from './icons';

export function GrowthBadge({
  value,
  className,
  compact = false,
}: {
  value: number | null;
  className?: string;
  compact?: boolean;
}) {
  const tone = growthTone(value);
  const color =
    tone === 'up' ? 'text-success' : tone === 'down' ? 'text-danger' : 'text-text-tertiary';
  const bg =
    tone === 'up'
      ? 'bg-success-soft'
      : tone === 'down'
        ? 'bg-danger-soft'
        : 'bg-[#F0F2F6]';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[12.5px] font-semibold tnum',
        color,
        !compact && bg,
        className,
      )}
    >
      {tone === 'up' && <IconTrendUp width={13} height={13} />}
      {tone === 'down' && <IconTrendDown width={13} height={13} />}
      {formatGrowth(value)}
    </span>
  );
}
