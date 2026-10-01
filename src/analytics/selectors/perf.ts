// Базовые агрегаты по performanceDaily — используются всеми страницами.

import type {
  Dataset,
  FunnelTotals,
  PerfRow,
  Platform,
  ResolvedPeriod,
  SalesChannelType,
} from '@/data/types';
import {
  bucketKeyFor,
  buildBuckets,
  granularityFor,
  type Granularity,
} from './period';

export interface PerfFilter {
  period: ResolvedPeriod;
  campaignId?: string | null;
  platform?: Platform | null;
}

export function filterRows(dataset: Dataset, f: PerfFilter): PerfRow[] {
  const { from, to } = f.period;
  return dataset.performanceDaily.filter((r) => {
    if (r.date < from || r.date > to) return false;
    if (f.campaignId && r.campaignId !== f.campaignId) return false;
    if (f.platform && r.platform !== f.platform) return false;
    return true;
  });
}

export const EMPTY_TOTALS: FunnelTotals = {
  views: 0,
  clicks: 0,
  addToCart: 0,
  orders: 0,
  purchasedOrders: 0,
  gmv: 0,
  commission: 0,
};

export interface ExtendedTotals extends FunnelTotals {
  reach: number;
  engagements: number;
  uniqueVisitors: number;
  productViews: number;
  ratingViews: number;
  ratingInteractions: number;
}

export const EMPTY_EXT: ExtendedTotals = {
  ...EMPTY_TOTALS,
  reach: 0,
  engagements: 0,
  uniqueVisitors: 0,
  productViews: 0,
  ratingViews: 0,
  ratingInteractions: 0,
};

export function totals(rows: PerfRow[]): ExtendedTotals {
  const t: ExtendedTotals = { ...EMPTY_EXT };
  for (const r of rows) {
    t.views += r.views;
    t.reach += r.reach;
    t.engagements += r.engagements;
    t.clicks += r.clicks;
    t.uniqueVisitors += r.uniqueVisitors;
    t.productViews += r.productViews;
    t.ratingViews += r.ratingViews;
    t.ratingInteractions += r.ratingInteractions;
    t.addToCart += r.addToCart;
    t.orders += r.orders;
    t.purchasedOrders += r.purchasedOrders;
    t.gmv += r.gmv;
    t.commission += r.commission;
  }
  return t;
}

export type MetricKey =
  | 'views'
  | 'clicks'
  | 'orders'
  | 'purchasedOrders'
  | 'gmv'
  | 'commission'
  | 'addToCart';

export interface SeriesPoint {
  key: string;
  date: string;
  value: number;
}

export function series(
  rows: PerfRow[],
  period: ResolvedPeriod,
  metric: MetricKey,
  granularityOverride?: Granularity,
): SeriesPoint[] {
  const g = granularityOverride ?? granularityFor(period);
  const buckets = buildBuckets(period, g);
  const map = new Map<string, number>();
  for (const b of buckets) map.set(b.key, 0);
  for (const r of rows) {
    const key = bucketKeyFor(r.date, g);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + r[metric]);
  }
  return buckets.map((b) => ({ key: b.key, date: b.key, value: map.get(b.key) ?? 0 }));
}

/** Несколько метрик сразу по одной сетке корзин. */
export function multiSeries(
  rows: PerfRow[],
  period: ResolvedPeriod,
  metrics: MetricKey[],
  granularityOverride?: Granularity,
): { key: string; date: string; values: Record<string, number> }[] {
  const g = granularityOverride ?? granularityFor(period);
  const buckets = buildBuckets(period, g);
  const map = new Map<string, Record<string, number>>();
  for (const b of buckets) {
    const init: Record<string, number> = {};
    for (const m of metrics) init[m] = 0;
    map.set(b.key, init);
  }
  for (const r of rows) {
    const key = bucketKeyFor(r.date, g);
    const slot = map.get(key);
    if (slot) for (const m of metrics) slot[m] += r[m];
  }
  return buckets.map((b) => ({ key: b.key, date: b.key, values: map.get(b.key)! }));
}

function groupBy<K extends string>(
  rows: PerfRow[],
  keyFn: (r: PerfRow) => K | null,
): Map<K, PerfRow[]> {
  const map = new Map<K, PerfRow[]>();
  for (const r of rows) {
    const k = keyFn(r);
    if (k === null) continue;
    const arr = map.get(k);
    if (arr) arr.push(r);
    else map.set(k, [r]);
  }
  return map;
}

export interface GroupTotals {
  key: string;
  totals: ExtendedTotals;
}

export function byPlatform(rows: PerfRow[]): GroupTotals[] {
  return [...groupBy(rows, (r) => r.platform as Platform).entries()]
    .map(([key, rs]) => ({ key, totals: totals(rs) }))
    .sort((a, b) => b.totals.views - a.totals.views);
}

export function byCampaign(rows: PerfRow[]): GroupTotals[] {
  return [...groupBy(rows, (r) => r.campaignId).entries()]
    .map(([key, rs]) => ({ key, totals: totals(rs) }))
    .sort((a, b) => b.totals.gmv - a.totals.gmv);
}

export function byPublication(rows: PerfRow[]): GroupTotals[] {
  return [...groupBy(rows, (r) => r.publicationId).entries()].map(([key, rs]) => ({
    key,
    totals: totals(rs),
  }));
}

export function byChannel(rows: PerfRow[]): GroupTotals[] {
  const order: SalesChannelType[] = [
    'whatsbetter',
    'manufacturer_external',
    'manufacturer_ecosystem',
    'marketplace',
  ];
  const map = groupBy(rows, (r) => r.salesChannelType as SalesChannelType);
  return order
    .filter((k) => map.has(k))
    .map((key) => ({ key, totals: totals(map.get(key)!) }));
}

export function byMarketplace(rows: PerfRow[]): GroupTotals[] {
  return [...groupBy(rows, (r) => r.marketplaceId).entries()]
    .map(([key, rs]) => ({ key, totals: totals(rs) }))
    .sort((a, b) => b.totals.gmv - a.totals.gmv);
}

export function byPartner(rows: PerfRow[]): GroupTotals[] {
  return [...groupBy(rows, (r) => r.partnerId).entries()]
    .map(([key, rs]) => ({ key, totals: totals(rs) }))
    .sort((a, b) => b.totals.gmv - a.totals.gmv);
}
