import type { Dataset, PeriodParams, Platform } from '@/data/types';
import {
  calcAov,
  calcCtr,
  calcGrowth,
  calcOrderConversion,
  calcPurchaseRate,
  safeRate,
} from '../metrics/formulas';
import {
  byChannel,
  byPublication,
  filterRows,
  series,
  totals,
  type ExtendedTotals,
  type MetricKey,
} from './perf';
import { previousPeriod } from './period';

export interface PublicationRow {
  id: string;
  title: string;
  platform: Platform;
  format: string;
  campaignId: string;
  campaignTitle: string;
  publishedAt: string;
  views: number;
  ctr: number;
  addToCart: number;
  purchasedOrders: number;
  gmv: number;
  commission: number;
}

export interface ContentData {
  header: {
    publications: number;
    views: number;
    ctr: number;
    purchasedOrders: number;
    gmv: number;
    commission: number;
    growth: { views: number | null; gmv: number | null };
  };
  rows: PublicationRow[];
}

export function getContent(dataset: Dataset, params: PeriodParams): ContentData {
  const rows = filterRows(dataset, params);
  const t = totals(rows);
  const prev = totals(
    filterRows(dataset, { ...params, period: previousPeriod(params.period) }),
  );

  const pubMap = new Map(dataset.publications.map((p) => [p.id, p]));
  const campMap = new Map(dataset.campaigns.map((c) => [c.id, c]));

  const pubRows: PublicationRow[] = byPublication(rows)
    .map((g) => {
      const p = pubMap.get(g.key);
      if (!p) return null;
      const c = campMap.get(p.campaignId);
      return {
        id: p.id,
        title: p.title,
        platform: p.platform,
        format: p.format,
        campaignId: p.campaignId,
        campaignTitle: c?.title ?? '',
        publishedAt: p.publishedAt,
        views: g.totals.views,
        ctr: calcCtr(g.totals.clicks, g.totals.views),
        addToCart: g.totals.addToCart,
        purchasedOrders: g.totals.purchasedOrders,
        gmv: g.totals.gmv,
        commission: g.totals.commission,
      };
    })
    .filter((x): x is PublicationRow => x !== null)
    .sort((a, b) => b.views - a.views);

  return {
    header: {
      publications: pubRows.length,
      views: t.views,
      ctr: calcCtr(t.clicks, t.views),
      purchasedOrders: t.purchasedOrders,
      gmv: t.gmv,
      commission: t.commission,
      growth: {
        views: calcGrowth(t.views, prev.views),
        gmv: calcGrowth(t.gmv, prev.gmv),
      },
    },
    rows: pubRows,
  };
}

export interface ContentDetailData {
  publication: Dataset['publications'][number];
  campaignTitle: string;
  totals: ExtendedTotals;
  funnel: { key: string; label: string; value: number; conversion: number | null }[];
  seriesGmv: ReturnType<typeof series>;
  seriesViews: ReturnType<typeof series>;
  channels: { key: string; label: string; purchasedOrders: number; gmv: number; share: number }[];
  insight: string | null;
}

export function getContentDetail(
  dataset: Dataset,
  publicationId: string,
  params: PeriodParams,
): ContentDetailData | null {
  const publication = dataset.publications.find((p) => p.id === publicationId);
  if (!publication) return null;
  const campaign = dataset.campaigns.find((c) => c.id === publication.campaignId);

  const rows = filterRows(dataset, { ...params, campaignId: null, platform: null }).filter(
    (r) => r.publicationId === publicationId,
  );
  const t = totals(rows);

  const funnel = [
    { key: 'views', label: 'Просмотры', value: t.views, conversion: null },
    { key: 'clicks', label: 'Переходы', value: t.clicks, conversion: safeRate(t.clicks, t.views) },
    { key: 'addToCart', label: 'В корзину', value: t.addToCart, conversion: safeRate(t.addToCart, t.clicks) },
    { key: 'orders', label: 'Заказы', value: t.orders, conversion: safeRate(t.orders, t.addToCart) },
    { key: 'purchasedOrders', label: 'Выкуплено', value: t.purchasedOrders, conversion: safeRate(t.purchasedOrders, t.orders) },
  ];

  const channelLabel: Record<string, string> = {
    whatsbetter: 'Whatsbetter',
    manufacturer_external: 'Сайты производителей',
    manufacturer_ecosystem: 'В экосистеме',
    marketplace: 'Маркетплейсы',
  };
  const chGroups = byChannel(rows);
  const totalPurch = chGroups.reduce((a, g) => a + g.totals.purchasedOrders, 0);
  const channels = chGroups.map((g) => ({
    key: g.key,
    label: channelLabel[g.key] ?? g.key,
    purchasedOrders: g.totals.purchasedOrders,
    gmv: g.totals.gmv,
    share: safeRate(g.totals.purchasedOrders, totalPurch),
  }));

  // Insight: сравнение конверсии в заказ с средним по публикациям за период.
  const allRows = filterRows(dataset, { ...params, campaignId: null, platform: null });
  const avgOrderConv = calcOrderConversion(
    totals(allRows).orders,
    totals(allRows).clicks,
  );
  const thisOrderConv = calcOrderConversion(t.orders, t.clicks);
  let insight: string | null = null;
  if (avgOrderConv > 0 && t.clicks > 50) {
    const diff = (thisOrderConv - avgOrderConv) / avgOrderConv;
    if (Math.abs(diff) >= 0.08) {
      const dir = diff > 0 ? 'выше' : 'ниже';
      insight = `Конверсия в заказ на ${Math.abs(Math.round(diff * 100))}% ${dir} среднего по вашим публикациям за период.`;
    }
  }

  return {
    publication,
    campaignTitle: campaign?.title ?? '',
    totals: t,
    funnel,
    seriesGmv: series(rows, params.period, 'gmv'),
    seriesViews: series(rows, params.period, 'views'),
    channels,
    insight,
  };
}

export function getContentSeries(
  dataset: Dataset,
  publicationId: string,
  params: PeriodParams,
  metric: MetricKey,
) {
  const rows = filterRows(dataset, { ...params, campaignId: null, platform: null }).filter(
    (r) => r.publicationId === publicationId,
  );
  return series(rows, params.period, metric);
}

export { calcAov, calcPurchaseRate };
