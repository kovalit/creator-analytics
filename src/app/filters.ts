// Глобальные фильтры хранятся в URL — refresh и шаринг ссылки сохраняют состояние.

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PeriodKey, PeriodParams, Platform } from '@/data/types';
import { previousPeriod, resolvePeriod } from '@/analytics/selectors/period';

const VALID_PERIODS: PeriodKey[] = ['7d', '30d', '90d', '6m', 'ytd', 'custom'];
const VALID_PLATFORMS: Platform[] = ['vk', 'telegram', 'youtube', 'rutube'];

export interface GlobalFilters {
  periodKey: PeriodKey;
  custom: { from: string; to: string } | undefined;
  compare: boolean;
  campaignId: string | null;
  platform: Platform | null;
  params: PeriodParams;
  setPeriod: (key: PeriodKey, custom?: { from: string; to: string }) => void;
  setCompare: (v: boolean) => void;
  setCampaign: (id: string | null) => void;
  setPlatform: (p: Platform | null) => void;
}

export function useGlobalFilters(): GlobalFilters {
  const [sp, setSp] = useSearchParams();

  const rawPeriod = sp.get('period') as PeriodKey | null;
  const periodKey: PeriodKey =
    rawPeriod && VALID_PERIODS.includes(rawPeriod) ? rawPeriod : '30d';
  const from = sp.get('from') ?? undefined;
  const to = sp.get('to') ?? undefined;
  const custom = periodKey === 'custom' && from && to ? { from, to } : undefined;
  const compare = sp.get('compare') === '1';
  const campaignId = sp.get('campaign');
  const rawPlatform = sp.get('platform') as Platform | null;
  const platform = rawPlatform && VALID_PLATFORMS.includes(rawPlatform) ? rawPlatform : null;

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      setSp(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          return next;
        },
        { replace: true },
      );
    },
    [setSp],
  );

  const setPeriod = useCallback(
    (key: PeriodKey, customRange?: { from: string; to: string }) => {
      update((next) => {
        next.set('period', key);
        if (key === 'custom' && customRange) {
          next.set('from', customRange.from);
          next.set('to', customRange.to);
        } else {
          next.delete('from');
          next.delete('to');
        }
      });
    },
    [update],
  );

  const setCompare = useCallback(
    (v: boolean) => update((next) => (v ? next.set('compare', '1') : next.delete('compare'))),
    [update],
  );
  const setCampaign = useCallback(
    (id: string | null) => update((next) => (id ? next.set('campaign', id) : next.delete('campaign'))),
    [update],
  );
  const setPlatform = useCallback(
    (p: Platform | null) => update((next) => (p ? next.set('platform', p) : next.delete('platform'))),
    [update],
  );

  const params: PeriodParams = useMemo(() => {
    const period = resolvePeriod(periodKey, custom);
    return {
      period,
      previous: previousPeriod(period),
      compare,
      campaignId,
      platform,
    };
  }, [periodKey, custom, compare, campaignId, platform]);

  return {
    periodKey,
    custom,
    compare,
    campaignId,
    platform,
    params,
    setPeriod,
    setCompare,
    setCampaign,
    setPlatform,
  };
}
