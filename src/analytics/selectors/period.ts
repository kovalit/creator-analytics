// Разрешение периодов и гранулярности.

import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns';
import type { PeriodKey, ResolvedPeriod } from '@/data/types';

// «Сегодня» демо — конец данных.
export const DEMO_NOW = '2026-09-30';
export const DATA_START = '2026-04-01';
export const DATA_END = '2026-09-30';

const iso = (d: Date) => format(d, 'yyyy-MM-dd');
const clampFrom = (d: string) => (d < DATA_START ? DATA_START : d);
const clampTo = (d: string) => (d > DATA_END ? DATA_END : d);

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: '7d', label: '7 дней' },
  { key: '30d', label: '30 дней' },
  { key: '90d', label: '90 дней' },
  { key: '6m', label: '6 месяцев' },
  { key: 'ytd', label: 'С начала года' },
  { key: 'custom', label: 'Свой период' },
];

export function periodLabel(key: PeriodKey): string {
  return PERIOD_OPTIONS.find((o) => o.key === key)?.label ?? '30 дней';
}

export function resolvePeriod(
  key: PeriodKey,
  custom?: { from: string; to: string },
): ResolvedPeriod {
  const now = parseISO(DEMO_NOW);
  let from: string;
  let to = DEMO_NOW;

  switch (key) {
    case '7d':
      from = iso(subDays(now, 6));
      break;
    case '90d':
      from = iso(subDays(now, 89));
      break;
    case '6m':
      from = iso(addDays(subMonths(now, 6), 1));
      break;
    case 'ytd':
      from = `${now.getFullYear()}-01-01`;
      break;
    case 'custom':
      from = custom?.from ?? iso(subDays(now, 29));
      to = custom?.to ?? DEMO_NOW;
      break;
    case '30d':
    default:
      from = iso(subDays(now, 29));
      break;
  }

  from = clampFrom(from);
  to = clampTo(to);

  return { key, from, to, label: periodLabel(key) };
}

export function previousPeriod(p: ResolvedPeriod): ResolvedPeriod {
  const from = parseISO(p.from);
  const to = parseISO(p.to);
  const len = differenceInCalendarDays(to, from) + 1;
  const prevTo = subDays(from, 1);
  const prevFrom = subDays(prevTo, len - 1);
  return {
    key: p.key,
    from: iso(prevFrom),
    to: iso(prevTo),
    label: 'предыдущий период',
  };
}

export type Granularity = 'day' | 'week' | 'month';

export function granularityFor(p: ResolvedPeriod): Granularity {
  const days = differenceInCalendarDays(parseISO(p.to), parseISO(p.from)) + 1;
  if (days <= 31) return 'day';
  if (days <= 120) return 'week';
  return 'month';
}

export interface Bucket {
  key: string; // идентификатор (дата начала)
  label: string;
}

/** Строит непрерывные корзины на интервале [from,to]. */
export function buildBuckets(p: ResolvedPeriod, g: Granularity): Bucket[] {
  const from = parseISO(p.from);
  const to = parseISO(p.to);
  const buckets: Bucket[] = [];

  if (g === 'day') {
    let d = from;
    while (d <= to) {
      buckets.push({ key: iso(d), label: format(d, 'd') });
      d = addDays(d, 1);
    }
  } else if (g === 'week') {
    let d = startOfWeek(from, { weekStartsOn: 1 });
    while (d <= to) {
      buckets.push({ key: iso(d), label: '' });
      d = addDays(d, 7);
    }
  } else {
    let y = from.getFullYear();
    let m = from.getMonth();
    while (new Date(y, m, 1) <= to) {
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      buckets.push({ key, label: '' });
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
    }
  }
  return buckets;
}

/** Возвращает ключ корзины для конкретной даты. */
export function bucketKeyFor(dateStr: string, g: Granularity): string {
  if (g === 'day') return dateStr;
  if (g === 'month') return dateStr.slice(0, 7);
  // week
  const d = parseISO(dateStr);
  return iso(startOfWeek(d, { weekStartsOn: 1 }));
}
