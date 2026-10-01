import { cn } from '@/lib/cn';

export interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
}

// Сегментированная полоса (как «Spending Overview» в референсе).
export function SegmentBar({
  segments,
  className,
}: {
  segments: Segment[];
  className?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div
      className={cn(
        'flex h-3.5 w-full gap-1 overflow-hidden rounded-pill bg-[#EEF1F6]',
        className,
      )}
    >
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <div
            key={s.key}
            className="h-full rounded-pill transition-all"
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
            title={s.label}
          />
        ))}
    </div>
  );
}
