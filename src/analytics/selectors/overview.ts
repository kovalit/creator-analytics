import type { Dataset, PeriodParams } from '@/data/types';
import {
  calcAov,
  calcCommissionRate,
  calcCtr,
  calcGrowth,
  calcPurchaseRate,
  safeRate,
} from '../metrics/formulas';
import {
  byCampaign,
  byChannel,
  filterRows,
  series,
  totals,
  type ExtendedTotals,
  type MetricKey,
  type SeriesPoint,
} from './perf';
import { previousPeriod } from './period';

export interface Kpi {
  key: string;
  label: string;
  value: number;
  kind: 'number' | 'money' | 'percent';
  growth: number | null;
  sub?: string;
  tooltip?: string;
}

export interface FunnelStage {
  key: string;
  label: string;
  value: number;
  conversionFromPrev: number | null;
  conversionLabel?: string;
}

export interface ChannelRow {
  key: string;
  label: string;
  color: string;
  purchasedOrders: number;
  gmv: number;
  share: number;
  aov: number;
}

export interface TopCampaignRow {
  id: string;
  title: string;
  sphereLabel: string;
  status: string;
  views: number;
  purchasedOrders: number;
  gmv: number;
  commission: number;
}

export interface SphereAffinityRow {
  sphereId: string;
  label: string;
  audienceShare: number;
  affinityIndex: number;
  trend: number;
}

export interface RecentCommissionRow {
  id: string;
  productLabel: string;
  brand: string;
  channel: string;
  amount: number;
  commission: number;
  status: string;
  date: string;
}

export interface OverviewData {
  kpis: Kpi[];
  funnel: { stages: FunnelStage[]; gmv: number; commission: number };
  channels: ChannelRow[];
  topCampaigns: TopCampaignRow[];
  sphereAffinities: SphereAffinityRow[];
  recentCommissions: RecentCommissionRow[];
}

export function buildKpis(cur: ExtendedTotals, prev: ExtendedTotals): Kpi[] {
  return [
    {
      key: 'views',
      label: 'Просмотры',
      value: cur.views,
      kind: 'number',
      growth: calcGrowth(cur.views, prev.views),
      tooltip: 'Суммарные просмотры публикаций за период.',
    },
    {
      key: 'clicks',
      label: 'Переходы',
      value: cur.clicks,
      kind: 'number',
      growth: calcGrowth(cur.clicks, prev.clicks),
      sub: `CTR ${(calcCtr(cur.clicks, cur.views) * 100).toFixed(1).replace('.', ',')}%`,
      tooltip: 'Переходы в экосистему Whatsbetter из публикаций.',
    },
    {
      key: 'orders',
      label: 'Заказы',
      value: cur.orders,
      kind: 'number',
      growth: calcGrowth(cur.orders, prev.orders),
      tooltip: 'Оформленные заказы после перехода.',
    },
    {
      key: 'purchasedOrders',
      label: 'Выкуплено',
      value: cur.purchasedOrders,
      kind: 'number',
      growth: calcGrowth(cur.purchasedOrders, prev.purchasedOrders),
      sub: `${(calcPurchaseRate(cur.purchasedOrders, cur.orders) * 100).toFixed(1).replace('.', ',')}% выкуп`,
      tooltip: 'Выкупленные (подтверждённые) заказы.',
    },
    {
      key: 'gmv',
      label: 'GMV',
      value: cur.gmv,
      kind: 'money',
      growth: calcGrowth(cur.gmv, prev.gmv),
      tooltip: 'Валовой объём продаж, созданный вашим контентом.',
    },
    {
      key: 'commission',
      label: 'Мой доход',
      value: cur.commission,
      kind: 'money',
      growth: calcGrowth(cur.commission, prev.commission),
      sub: `${(calcCommissionRate(cur.commission, cur.gmv) * 100).toFixed(1).replace('.', ',')}% ставка`,
      tooltip: 'Комиссия блогера за период.',
    },
  ];
}

export function getOverview(dataset: Dataset, params: PeriodParams): OverviewData {
  const cur = totals(filterRows(dataset, params));
  const prev = totals(
    filterRows(dataset, { ...params, period: previousPeriod(params.period) }),
  );

  const kpis = buildKpis(cur, prev);

  // Funnel
  const stages: FunnelStage[] = [
    { key: 'views', label: 'Просмотры', value: cur.views, conversionFromPrev: null },
    {
      key: 'clicks',
      label: 'Переходы',
      value: cur.clicks,
      conversionFromPrev: safeRate(cur.clicks, cur.views),
      conversionLabel: 'CTR',
    },
    {
      key: 'addToCart',
      label: 'В корзину',
      value: cur.addToCart,
      conversionFromPrev: safeRate(cur.addToCart, cur.clicks),
    },
    {
      key: 'orders',
      label: 'Заказы',
      value: cur.orders,
      conversionFromPrev: safeRate(cur.orders, cur.addToCart),
    },
    {
      key: 'purchasedOrders',
      label: 'Выкуплено',
      value: cur.purchasedOrders,
      conversionFromPrev: safeRate(cur.purchasedOrders, cur.orders),
    },
  ];

  // Channels
  const rows = filterRows(dataset, params);
  const channelGroups = byChannel(rows);
  const totalPurchased = channelGroups.reduce((a, g) => a + g.totals.purchasedOrders, 0);
  const channelColor: Record<string, string> = {
    whatsbetter: '#356DF3',
    manufacturer_ecosystem: '#7357E8',
    manufacturer_external: '#1F9D70',
    marketplace: '#D79527',
  };
  const channelLabel: Record<string, string> = {
    whatsbetter: 'Whatsbetter',
    manufacturer_external: 'Сайты производителей',
    manufacturer_ecosystem: 'Производители в экосистеме',
    marketplace: 'Маркетплейсы',
  };
  const channels: ChannelRow[] = channelGroups.map((g) => ({
    key: g.key,
    label: channelLabel[g.key] ?? g.key,
    color: channelColor[g.key] ?? '#9AA1AC',
    purchasedOrders: g.totals.purchasedOrders,
    gmv: g.totals.gmv,
    share: safeRate(g.totals.purchasedOrders, totalPurchased),
    aov: calcAov(g.totals.gmv, g.totals.purchasedOrders),
  }));

  // Top campaigns
  const campaignMap = new Map(dataset.campaigns.map((c) => [c.id, c]));
  const sphereMap = new Map(dataset.spheres.map((s) => [s.id, s]));
  const topCampaigns: TopCampaignRow[] = byCampaign(rows)
    .slice(0, 4)
    .map((g) => {
      const c = campaignMap.get(g.key);
      return {
        id: g.key,
        title: c?.title ?? g.key,
        sphereLabel: c ? (sphereMap.get(c.sphereId)?.label ?? '') : '',
        status: c?.status ?? '',
        views: g.totals.views,
        purchasedOrders: g.totals.purchasedOrders,
        gmv: g.totals.gmv,
        commission: g.totals.commission,
      };
    });

  // Sphere affinities (top 5)
  const sphereAffinities: SphereAffinityRow[] = dataset.affinities.sphereAffinities
    .slice()
    .sort((a, b) => b.audienceShare - a.audienceShare)
    .slice(0, 5)
    .map((a) => ({
      sphereId: a.sphereId,
      label: sphereMap.get(a.sphereId)?.label ?? a.sphereId,
      audienceShare: a.audienceShare,
      affinityIndex: a.affinityIndex,
      trend: a.trend,
    }));

  // Recent commissions
  const orderMap = new Map(dataset.commerceOrders.map((o) => [o.id, o]));
  const entityMap = new Map(dataset.entities.map((e) => [e.id, e]));
  const channelShort: Record<string, string> = {
    whatsbetter: 'Whatsbetter',
    manufacturer_external: 'Внешний сайт',
    manufacturer_ecosystem: 'Экосистема',
    marketplace: 'Маркетплейс',
  };
  const recentCommissions: RecentCommissionRow[] = dataset.commissions
    .filter((c) => c.orderId)
    .sort((a, b) => (a.earnedAt < b.earnedAt ? 1 : -1))
    .slice(0, 6)
    .map((c) => {
      const o = orderMap.get(c.orderId!);
      const e = o ? entityMap.get(o.entityId) : undefined;
      return {
        id: c.id,
        productLabel: e?.label ?? 'Товар',
        brand: e?.brand ?? '',
        channel: o ? (channelShort[o.channelType] ?? o.channelType) : '',
        amount: o?.amount ?? 0,
        commission: c.amount,
        status: c.status,
        date: c.earnedAt,
      };
    });

  return {
    kpis,
    funnel: { stages, gmv: cur.gmv, commission: cur.commission },
    channels,
    topCampaigns,
    sphereAffinities,
    recentCommissions,
  };
}

export function getPerformanceSeries(
  dataset: Dataset,
  params: PeriodParams,
  metric: MetricKey,
): { current: SeriesPoint[]; previous: SeriesPoint[] | null } {
  const curRows = filterRows(dataset, params);
  const current = series(curRows, params.period, metric);
  let previous: SeriesPoint[] | null = null;
  if (params.compare) {
    const prevPeriod = previousPeriod(params.period);
    const prevRows = filterRows(dataset, { ...params, period: prevPeriod });
    previous = series(prevRows, prevPeriod, metric);
  }
  return { current, previous };
}
