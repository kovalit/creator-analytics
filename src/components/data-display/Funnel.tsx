import { compactNumber, formatMoneyCompact, formatPercent } from '@/analytics/formatters';
import { IconChevronRight } from '../ui/icons';
import { cn } from '@/lib/cn';

export interface FunnelStageInput {
  key: string;
  label: string;
  value: number;
  conversionFromPrev?: number | null;
  conversion?: number | null;
}

export function Funnel({
  stages,
  gmv,
  commission,
}: {
  stages: FunnelStageInput[];
  gmv?: number;
  commission?: number;
}) {
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:items-stretch">
        {stages.map((s, i) => {
          const conv = s.conversionFromPrev ?? s.conversion ?? null;
          const heightPct = 32 + (s.value / max) * 68;
          return (
            <div key={s.key} className="relative flex flex-col">
              <div className="flex flex-1 flex-col justify-end">
                <div
                  className="flex flex-col justify-end rounded-2xl bg-gradient-to-b from-primary-soft to-[#f6f9ff] px-3 pb-3 pt-6"
                  style={{ minHeight: `${heightPct}px` }}
                >
                  <span className="text-[20px] font-bold leading-none text-text-primary tnum">
                    {compactNumber(s.value)}
                  </span>
                  <span className="mt-1 text-[12.5px] font-medium text-text-secondary">
                    {s.label}
                  </span>
                </div>
              </div>
              {i > 0 && conv !== null && (
                <div className="mt-2 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1 rounded-pill bg-surface-soft px-2 py-0.5 text-[11.5px] font-semibold text-primary tnum">
                    {formatPercent(conv)}
                  </span>
                </div>
              )}
              {i < stages.length - 1 && (
                <IconChevronRight
                  width={16}
                  height={16}
                  className="absolute -right-2.5 top-[40%] hidden text-border-strong md:block"
                />
              )}
            </div>
          );
        })}
      </div>

      {(gmv !== undefined || commission !== undefined) && (
        <div className="grid grid-cols-2 gap-3">
          <MoneyPill label="GMV" value={gmv ?? 0} tone="primary" />
          <MoneyPill label="Мой доход" value={commission ?? 0} tone="success" />
        </div>
      )}
    </div>
  );
}

function MoneyPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'primary' | 'success';
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-2xl px-4 py-3',
        tone === 'primary' ? 'bg-primary-soft' : 'bg-success-soft',
      )}
    >
      <span
        className={cn(
          'text-[13px] font-medium',
          tone === 'primary' ? 'text-primary' : 'text-success',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'text-[19px] font-bold tnum',
          tone === 'primary' ? 'text-primary' : 'text-success',
        )}
      >
        {formatMoneyCompact(value)}
      </span>
    </div>
  );
}
