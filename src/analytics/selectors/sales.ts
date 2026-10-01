import type { Dataset, PeriodParams, SalesChannelType } from '@/data/types';
import {
  calcAov,
  calcCommissionRate,
  calcGrowth,
  calcPurchaseRate,
  safeRate,
} from '../metrics/formulas';
import {
  byCampaign,
  byChannel,
  byMarketplace,
  filterRows,
  multiSeries,
  totals,
} from './perf';
import { previousPeriod } from './period';

export interface SalesData {
  kpis: {
    key: string;
    label: string;
    value: number;
    kind: 'number' | 'money' | 'percent';
    growth: number | null;
  }[];
  trend: { key: string; date: string; gmv: number; purchasedOrders: number }[];
  channels: {
    key: SalesChannelType;
    label: string;
    color: string;
    purchasedOrders: number;
    gmv: number;
    share: number;
    aov: number;
  }[];
  marketplaces: { id: string; label: string; purchasedOrders: number; gmv: number; aov: number }[];
  products: {
    entityId: string;
    label: string;
    brand: string;
    channel: string;
    purchasedOrders: number;
    gmv: number;
    aov: number;
    commission: number;
  }[];
  campaignContribution: { id: string; title: string; gmv: number; share: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    productLabel: string;
    brand: string;
    channel: string;
    createdAt: string;
    amount: number;
    status: string;
    commission: number;
  }[];
}

const CHANNEL_META: Record<SalesChannelType, { label: string; color: string }> = {
  whatsbetter: { label: 'Whatsbetter', color: '#356DF3' },
  manufacturer_external: { label: 'Сайт производителя', color: '#1F9D70' },
  manufacturer_ecosystem: { label: 'Производитель в экосистеме', color: '#7357E8' },
  marketplace: { label: 'Маркетплейсы', color: '#D79527' },
};

export function getSales(dataset: Dataset, params: PeriodParams): SalesData {
  const rows = filterRows(dataset, params);
  const t = totals(rows);
  const prev = totals(filterRows(dataset, { ...params, period: previousPeriod(params.period) }));

  const kpis: SalesData['kpis'] = [
    { key: 'orders', label: 'Заказы', value: t.orders, kind: 'number', growth: calcGrowth(t.orders, prev.orders) },
    { key: 'purchasedOrders', label: 'Выкуплено', value: t.purchasedOrders, kind: 'number', growth: calcGrowth(t.purchasedOrders, prev.purchasedOrders) },
    { key: 'gmv', label: 'GMV', value: t.gmv, kind: 'money', growth: calcGrowth(t.gmv, prev.gmv) },
    { key: 'aov', label: 'Средний чек', value: calcAov(t.gmv, t.purchasedOrders), kind: 'money', growth: calcGrowth(calcAov(t.gmv, t.purchasedOrders), calcAov(prev.gmv, prev.purchasedOrders)) },
    { key: 'redemption', label: 'Выкуп %', value: calcPurchaseRate(t.purchasedOrders, t.orders), kind: 'percent', growth: calcGrowth(calcPurchaseRate(t.purchasedOrders, t.orders), calcPurchaseRate(prev.purchasedOrders, prev.orders)) },
    { key: 'commRate', label: 'Средняя комиссия', value: calcCommissionRate(t.commission, t.gmv), kind: 'percent', growth: calcGrowth(calcCommissionRate(t.commission, t.gmv), calcCommissionRate(prev.commission, prev.gmv)) },
  ];

  const trendRaw = multiSeries(rows, params.period, ['gmv', 'purchasedOrders']);
  const trend = trendRaw.map((p) => ({
    key: p.key,
    date: p.date,
    gmv: p.values.gmv,
    purchasedOrders: p.values.purchasedOrders,
  }));

  const chGroups = byChannel(rows);
  const totalPurch = chGroups.reduce((a, g) => a + g.totals.purchasedOrders, 0);
  const channels = chGroups.map((g) => {
    const meta = CHANNEL_META[g.key as SalesChannelType];
    return {
      key: g.key as SalesChannelType,
      label: meta.label,
      color: meta.color,
      purchasedOrders: g.totals.purchasedOrders,
      gmv: g.totals.gmv,
      share: safeRate(g.totals.purchasedOrders, totalPurch),
      aov: calcAov(g.totals.gmv, g.totals.purchasedOrders),
    };
  });

  const mpMap = new Map(dataset.marketplaces.map((m) => [m.id, m]));
  const marketplaces = byMarketplace(rows)
    .filter((g) => g.key)
    .map((g) => ({
      id: g.key,
      label: mpMap.get(g.key)?.label ?? g.key,
      purchasedOrders: g.totals.purchasedOrders,
      gmv: g.totals.gmv,
      aov: calcAov(g.totals.gmv, g.totals.purchasedOrders),
    }));

  // Product leaderboard — из флагманской кампании за период.
  const flagship = 'campaign_face_cream_2026_09';
  const flagshipRows = rows.filter((r) => r.campaignId === flagship);
  const ft = totals(flagshipRows);
  const entityMap = new Map(dataset.entities.map((e) => [e.id, e]));
  const affMap = new Map(dataset.affinities.entityAffinities.map((a) => [a.entityId, a]));
  const flagshipEntities = dataset.campaigns.find((c) => c.id === flagship)?.entityIds ?? [];
  const channelCycle: SalesChannelType[] = ['whatsbetter', 'manufacturer_ecosystem', 'marketplace', 'manufacturer_external'];
  const weights = flagshipEntities.map((id) => affMap.get(id)?.purchases ?? 1);
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  const products = flagshipEntities
    .map((id, i) => {
      const e = entityMap.get(id);
      if (!e) return null;
      const w = weights[i] / wSum;
      const purchased = Math.round(ft.purchasedOrders * w);
      const gmv = Math.round(ft.gmv * w);
      const commission = Math.round(ft.commission * w);
      return {
        entityId: id,
        label: e.label,
        brand: e.brand,
        channel: CHANNEL_META[channelCycle[i % channelCycle.length]].label,
        purchasedOrders: purchased,
        gmv,
        aov: calcAov(gmv, purchased),
        commission,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, 12);

  // Campaign contribution
  const campMap = new Map(dataset.campaigns.map((c) => [c.id, c]));
  const campaignContribution = byCampaign(rows).map((g) => ({
    id: g.key,
    title: campMap.get(g.key)?.title ?? g.key,
    gmv: g.totals.gmv,
    share: safeRate(g.totals.gmv, t.gmv),
  }));

  // Recent orders (из commerceOrders, внутри периода)
  const channelShort: Record<string, string> = {
    whatsbetter: 'Whatsbetter',
    manufacturer_external: 'Внешний сайт',
    manufacturer_ecosystem: 'Экосистема',
    marketplace: 'Маркетплейс',
  };
  const recentOrders = dataset.commerceOrders
    .filter((o) => o.createdAt.slice(0, 10) >= params.period.from && o.createdAt.slice(0, 10) <= params.period.to)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((o) => {
      const e = entityMap.get(o.entityId);
      const mpLabel = o.marketplaceId ? mpMap.get(o.marketplaceId)?.label : null;
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        productLabel: e?.label ?? 'Товар',
        brand: e?.brand ?? '',
        channel: mpLabel ?? channelShort[o.channelType] ?? o.channelType,
        createdAt: o.createdAt,
        amount: o.amount,
        status: o.status,
        commission: o.commission,
      };
    });

  return {
    kpis,
    trend,
    channels,
    marketplaces,
    products,
    campaignContribution,
    recentOrders,
  };
}
