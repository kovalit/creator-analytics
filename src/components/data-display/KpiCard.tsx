import { Card } from '../ui/Card';
import { GrowthBadge } from '../ui/GrowthBadge';
import { Tooltip } from '../ui/Tooltip';
import { IconInfo } from '../ui/icons';
import { formatMoneyCompact, formatPercent, compactNumber } from '@/analytics/formatters';
import { cn } from '@/lib/cn';

export interface KpiCardProps {
  label: string;
  value: number;
  kind: 'number' | 'money' | 'percent';
  growth?: number | null;
  sub?: string;
  tooltip?: string;
  accent?: boolean;
  className?: string;
}

function formatValue(value: number, kind: KpiCardProps['kind']): string {
  if (kind === 'money') return formatMoneyCompact(value);
  if (kind === 'percent') return formatPercent(value);
  return compactNumber(value);
}

export function KpiCard({
  label,
  value,
  kind,
  growth,
  sub,
  tooltip,
  accent,
  className,
}: KpiCardProps) {
  return (
    <Card
      size="sm"
      className={cn(
        'flex flex-col justify-between p-4',
        accent && 'border-transparent bg-gradient-to-br from-primary to-[#4b7bf5] text-white shadow-card',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'text-[13px] font-medium',
            accent ? 'text-white/80' : 'text-text-secondary',
          )}
        >
          {label}
        </span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <IconInfo
              width={14}
              height={14}
              className={accent ? 'text-white/70' : 'text-text-tertiary'}
            />
          </Tooltip>
        )}
      </div>
      <div className="mt-2.5 flex items-end justify-between gap-2">
        <span
          className={cn(
            'text-[26px] font-bold leading-none tracking-tight tnum',
            accent ? 'text-white' : 'text-text-primary',
          )}
        >
          {formatValue(value, kind)}
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        {growth !== undefined && !accent && <GrowthBadge value={growth} />}
        {growth !== undefined && accent && (
          <span className="text-[12.5px] font-semibold text-white/90">
            {growth === null ? '' : `${growth > 0 ? '+' : ''}${formatPercent(growth)}`}
          </span>
        )}
        {sub && (
          <span
            className={cn(
              'text-[12.5px] font-medium',
              accent ? 'text-white/80' : 'text-text-tertiary',
            )}
          >
            {sub}
          </span>
        )}
      </div>
    </Card>
  );
}
