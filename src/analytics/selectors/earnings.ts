import type { Dataset, PeriodParams } from '@/data/types';
import { calcGrowth, safeRate } from '../metrics/formulas';
import { byCampaign, filterRows, series, totals } from './perf';
import { previousPeriod } from './period';

export interface EarningsData {
  earned: number;
  earnedGrowth: number | null;
  statusTotals: { estimated: number; pending: number; available: number; paid: number };
  statusBars: { key: string; label: string; value: number; color: string; share: number }[];
  trend: ReturnType<typeof series>;
  byCampaign: { id: string; title: string; commission: number; share: number }[];
  recentCommissions: {
    id: string;
    date: string;
    campaignTitle: string;
    productLabel: string;
    channel: string;
    amount: number;
    rate: number;
    commission: number;
    status: string;
  }[];
  payouts: Dataset['payouts'];
}

export function getEarnings(dataset: Dataset, params: PeriodParams): EarningsData {
  const rows = filterRows(dataset, params);
  const t = totals(rows);
  const prev = totals(filterRows(dataset, { ...params, period: previousPeriod(params.period) }));

  const inPeriod = (d: string) => {
    const day = d.slice(0, 10);
    return day >= params.period.from && day <= params.period.to;
  };

  const statusTotals = { estimated: 0, pending: 0, available: 0, paid: 0 };
  for (const c of dataset.commissions) {
    if (!inPeriod(c.earnedAt)) continue;
    if (c.status in statusTotals) {
      statusTotals[c.status as keyof typeof statusTotals] += c.amount;
    }
  }
  const statusSum =
    statusTotals.estimated + statusTotals.pending + statusTotals.available + statusTotals.paid;

  const statusBars = [
    { key: 'available', label: 'Доступно', value: statusTotals.available, color: '#1F9D70' },
    { key: 'pending', label: 'Ожидает подтверждения', value: statusTotals.pending, color: '#D79527' },
    { key: 'estimated', label: 'Предварительно', value: statusTotals.estimated, color: '#9AA1AC' },
    { key: 'paid', label: 'Выплачено', value: statusTotals.paid, color: '#356DF3' },
  ].map((b) => ({ ...b, share: safeRate(b.value, statusSum) }));

  const campMap = new Map(dataset.campaigns.map((c) => [c.id, c]));
  const byCamp = byCampaign(rows).map((g) => ({
    id: g.key,
    title: campMap.get(g.key)?.title ?? g.key,
    commission: g.totals.commission,
    share: safeRate(g.totals.commission, t.commission),
  }));

  const orderMap = new Map(dataset.commerceOrders.map((o) => [o.id, o]));
  const entityMap = new Map(dataset.entities.map((e) => [e.id, e]));
  const mpMap = new Map(dataset.marketplaces.map((m) => [m.id, m]));
  const channelShort: Record<string, string> = {
    whatsbetter: 'Whatsbetter',
    manufacturer_external: 'Внешний сайт',
    manufacturer_ecosystem: 'Экосистема',
    marketplace: 'Маркетплейс',
  };
  const recentCommissions = dataset.commissions
    .filter((c) => c.orderId && inPeriod(c.earnedAt))
    .sort((a, b) => (a.earnedAt < b.earnedAt ? 1 : -1))
    .map((c) => {
      const o = orderMap.get(c.orderId!);
      const e = o ? entityMap.get(o.entityId) : undefined;
      const mpLabel = o?.marketplaceId ? mpMap.get(o.marketplaceId)?.label : null;
      return {
        id: c.id,
        date: c.earnedAt,
        campaignTitle: campMap.get(c.campaignId)?.title ?? '',
        productLabel: e?.label ?? 'Товар',
        channel: mpLabel ?? (o ? channelShort[o.channelType] : '') ?? '',
        amount: o?.amount ?? 0,
        rate: c.rate,
        commission: c.amount,
        status: c.status,
      };
    });

  const payouts = dataset.payouts
    .slice()
    .sort((a, b) => (a.period.from < b.period.from ? 1 : -1));

  return {
    earned: t.commission,
    earnedGrowth: calcGrowth(t.commission, prev.commission),
    statusTotals,
    statusBars,
    trend: series(rows, params.period, 'commission'),
    byCampaign: byCamp,
    recentCommissions,
    payouts,
  };
}
