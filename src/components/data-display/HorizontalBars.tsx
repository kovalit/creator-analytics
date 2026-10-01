import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface BarItem {
  key: string;
  label: string;
  value: number; // для ширины
  display: string; // подпись значения
  caption?: ReactNode; // доп. строка (affinity, benchmark)
  color?: string;
  benchmark?: number; // 0..1 относительно max — маркер
}

export function HorizontalBars({
  items,
  max,
  barColor = '#356DF3',
  trackColor = '#EEF1F6',
  showBenchmark = false,
}: {
  items: BarItem[];
  max?: number;
  barColor?: string;
  trackColor?: string;
  showBenchmark?: boolean;
}) {
  const m = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="flex flex-col gap-3.5">
      {items.map((it) => {
        const pct = Math.max(2, (it.value / m) * 100);
        return (
          <div key={it.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-[13.5px] font-medium text-text-primary">
                {it.label}
              </span>
              <span className="shrink-0 text-[13px] font-semibold text-text-primary tnum">
                {it.display}
              </span>
            </div>
            <div
              className="relative h-2.5 w-full overflow-visible rounded-full"
              style={{ backgroundColor: trackColor }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: it.color ?? barColor }}
              />
              {showBenchmark && it.benchmark !== undefined && (
                <span
                  className="absolute top-1/2 h-4 w-[2px] -translate-y-1/2 rounded bg-text-tertiary"
                  style={{ left: `${Math.min(100, it.benchmark * 100)}%` }}
                  title="Среднее по Whatsbetter"
                />
              )}
            </div>
            {it.caption && (
              <div className="mt-1 text-[12px] text-text-tertiary">{it.caption}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LegendRow({
  color,
  label,
  value,
  sub,
  className,
}: {
  color: string;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 py-1.5', className)}>
      <span className="flex min-w-0 items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
        <span className="truncate text-[13.5px] text-text-secondary">{label}</span>
      </span>
      <span className="flex shrink-0 items-baseline gap-2">
        <span className="text-[13.5px] font-semibold text-text-primary tnum">{value}</span>
        {sub && <span className="text-[12px] text-text-tertiary tnum">{sub}</span>}
      </span>
    </div>
  );
}
