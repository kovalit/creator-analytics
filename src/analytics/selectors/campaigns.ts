import type { Campaign, Dataset, PeriodParams, Platform } from '@/data/types';
import { calcAov, calcCtr, safeRate } from '../metrics/formulas';
import {
  byChannel,
  byMarketplace,
  byPartner,
  byPlatform,
  filterRows,
  series,
  totals,
  type ExtendedTotals,
  type MetricKey,
} from './perf';

export interface CampaignSummary {
  id: string;
  title: string;
  status: string;
  sphereLabel: string;
  startDate: string;
  endDate: string;
  heroImage: string;
  publications: number;
  views: number;
  purchasedOrders: number;
  gmv: number;
  commission: number;
}

export function getCampaignSummaries(dataset: Dataset, params: PeriodParams): CampaignSummary[] {
  // Для списка кампаний игнорируем campaign-фильтр, но учитываем период.
  const rows = filterRows(dataset, { ...params, campaignId: null });
  const sphereMap = new Map(dataset.spheres.map((s) => [s.id, s]));
  const pubCount = new Map<string, number>();
  for (const p of dataset.publications) {
    pubCount.set(p.campaignId, (pubCount.get(p.campaignId) ?? 0) + 1);
  }
  const byCamp = new Map<string, ExtendedTotals>();
  for (const c of dataset.campaigns) byCamp.set(c.id, totals([]));
  for (const r of rows) {
    const t = byCamp.get(r.campaignId);
    if (t) {
      t.views += r.views;
      t.purchasedOrders += r.purchasedOrders;
      t.gmv += r.gmv;
      t.commission += r.commission;
    }
  }
  return dataset.campaigns
    .map((c) => {
      const t = byCamp.get(c.id)!;
      return {
        id: c.id,
        title: c.title,
        status: c.status,
        sphereLabel: sphereMap.get(c.sphereId)?.label ?? '',
        startDate: c.startDate,
        endDate: c.endDate,
        heroImage: c.heroImage,
        publications: pubCount.get(c.id) ?? 0,
        views: t.views,
        purchasedOrders: t.purchasedOrders,
        gmv: t.gmv,
        commission: t.commission,
      };
    })
    .sort((a, b) => b.gmv - a.gmv);
}

export interface ProductRow {
  entityId: string;
  label: string;
  brand: string;
  image: string;
  ratingScore: number;
  ratingPlace: number;
  purchasedOrders: number;
  gmv: number;
  aov: number;
  commission: number;
  matchScore: number;
}

export interface CampaignDetailData {
  campaign: Campaign;
  sphereLabel: string;
  header: {
    partners: number;
    products: number;
    marketplaces: number;
    publications: number;
  };
  totals: ExtendedTotals;
  funnel: { key: string; label: string; value: number; conversion: number | null }[];
  platforms: { platform: Platform; views: number; clicks: number; ctr: number; purchasedOrders: number; gmv: number }[];
  products: ProductRow[];
  channels: { key: string; label: string; purchasedOrders: number; gmv: number; share: number }[];
  marketplaces: { id: string; label: string; purchasedOrders: number; gmv: number }[];
  criteria: { id: string; label: string; importance: number; benchmark: number; delta: number }[];
  partners: { id: string; label: string; logo: string; products: number; purchasedOrders: number; gmv: number; audienceMatch: number }[];
}

export function getCampaignDetail(
  dataset: Dataset,
  campaignId: string,
  params: PeriodParams,
): CampaignDetailData | null {
  const campaign = dataset.campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;

  // Для детали кампании период расширяем до её полного окна, чтобы цифры были полными.
  const campPeriod = {
    key: 'custom' as const,
    from: campaign.startDate,
    to: campaign.endDate,
    label: 'период кампании',
  };
  const rows = filterRows(dataset, {
    period: campPeriod,
    campaignId,
    platform: params.platform ?? null,
  });
  const t = totals(rows);

  const sphereMap = new Map(dataset.spheres.map((s) => [s.id, s]));
  const pubs = dataset.publications.filter((p) => p.campaignId === campaignId);

  const funnel = [
    { key: 'views', label: 'Просмотры', value: t.views, conversion: null },
    { key: 'clicks', label: 'Переходы', value: t.clicks, conversion: safeRate(t.clicks, t.views) },
    { key: 'addToCart', label: 'В корзину', value: t.addToCart, conversion: safeRate(t.addToCart, t.clicks) },
    { key: 'orders', label: 'Заказы', value: t.orders, conversion: safeRate(t.orders, t.addToCart) },
    { key: 'purchasedOrders', label: 'Выкуплено', value: t.purchasedOrders, conversion: safeRate(t.purchasedOrders, t.orders) },
  ];

  const platforms = byPlatform(rows).map((g) => ({
    platform: g.key as Platform,
    views: g.totals.views,
    clicks: g.totals.clicks,
    ctr: calcCtr(g.totals.clicks, g.totals.views),
    purchasedOrders: g.totals.purchasedOrders,
    gmv: g.totals.gmv,
  }));

  const channelLabel: Record<string, string> = {
    whatsbetter: 'Whatsbetter',
    manufacturer_external: 'Сайт производителя',
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

  const mpMap = new Map(dataset.marketplaces.map((m) => [m.id, m]));
  const marketplaces = byMarketplace(rows)
    .filter((g) => g.key)
    .map((g) => ({
      id: g.key,
      label: mpMap.get(g.key)?.label ?? g.key,
      purchasedOrders: g.totals.purchasedOrders,
      gmv: g.totals.gmv,
    }));

  // Products: распределяем выкуп/GMV/комиссию по товарам кампании через entityAffinities.
  const entityMap = new Map(dataset.entities.map((e) => [e.id, e]));
  const affMap = new Map(dataset.affinities.entityAffinities.map((a) => [a.entityId, a]));
  const campaignEntities =
    campaign.entityIds.length > 0
      ? campaign.entityIds
      : dataset.entities.filter((e) => e.sphereId === campaign.sphereId).map((e) => e.id);
  const weights = campaignEntities.map((id) => affMap.get(id)?.purchases ?? 1);
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  const products: ProductRow[] = campaignEntities
    .map((id, i) => {
      const e = entityMap.get(id);
      if (!e) return null;
      const w = weights[i] / wSum;
      const purchased = Math.round(t.purchasedOrders * w);
      const gmv = Math.round(t.gmv * w);
      const commission = Math.round(t.commission * w);
      return {
        entityId: id,
        label: e.label,
        brand: e.brand,
        image: e.image,
        ratingScore: e.rating.score,
        ratingPlace: e.rating.place,
        purchasedOrders: purchased,
        gmv,
        aov: calcAov(gmv, purchased),
        commission,
        matchScore: affMap.get(id)?.matchScore ?? 0,
      };
    })
    .filter((x): x is ProductRow => x !== null)
    .sort((a, b) => b.gmv - a.gmv);

  // Criteria importance (для сферы кампании).
  const critMap = new Map(dataset.criteria.map((c) => [c.id, c]));
  const criteria = dataset.affinities.criterionAffinities
    .filter((a) => a.sphereId === campaign.sphereId)
    .sort((a, b) => b.importance - a.importance)
    .map((a) => ({
      id: a.criterionId,
      label: critMap.get(a.criterionId)?.label ?? a.criterionId,
      importance: a.importance,
      benchmark: a.platformAvgImportance,
      delta: a.delta,
    }));

  // Partners (производители шоу).
  const partnerMap = new Map(dataset.partners.map((p) => [p.id, p]));
  const partnerProducts = new Map<string, number>();
  for (const e of dataset.entities) {
    if (campaignEntities.includes(e.id)) {
      partnerProducts.set(e.partnerId, (partnerProducts.get(e.partnerId) ?? 0) + 1);
    }
  }
  const prodByPartner = new Map<string, { purchased: number; gmv: number }>();
  for (const p of products) {
    const e = entityMap.get(p.entityId);
    if (!e) continue;
    const agg = prodByPartner.get(e.partnerId) ?? { purchased: 0, gmv: 0 };
    agg.purchased += p.purchasedOrders;
    agg.gmv += p.gmv;
    prodByPartner.set(e.partnerId, agg);
  }
  const perfPartner = new Map(byPartner(rows).map((g) => [g.key, g.totals]));
  const partners = campaign.partnerIds
    .map((id) => {
      const p = partnerMap.get(id);
      if (!p) return null;
      const agg = prodByPartner.get(id);
      const perf = perfPartner.get(id);
      // audienceMatch — среднее match по товарам партнёра.
      const partnerEntities = dataset.entities.filter(
        (e) => e.partnerId === id && campaignEntities.includes(e.id),
      );
      const matches = partnerEntities
        .map((e) => affMap.get(e.id)?.matchScore ?? 0)
        .filter((m) => m > 0);
      const audienceMatch = matches.length
        ? matches.reduce((a, b) => a + b, 0) / matches.length / 100
        : 0;
      return {
        id,
        label: p.label,
        logo: p.logo,
        products: partnerProducts.get(id) ?? 0,
        purchasedOrders: agg?.purchased ?? perf?.purchasedOrders ?? 0,
        gmv: agg?.gmv ?? perf?.gmv ?? 0,
        audienceMatch,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.gmv - a.gmv);

  return {
    campaign,
    sphereLabel: sphereMap.get(campaign.sphereId)?.label ?? '',
    header: {
      partners: campaign.partnerIds.length,
      products: campaignEntities.length,
      marketplaces: dataset.marketplaces.length,
      publications: pubs.length,
    },
    totals: t,
    funnel,
    platforms,
    products,
    channels,
    marketplaces,
    criteria,
    partners,
  };
}

export function getCampaignSeries(
  dataset: Dataset,
  campaignId: string,
  metric: MetricKey,
) {
  const campaign = dataset.campaigns.find((c) => c.id === campaignId);
  if (!campaign) return [];
  const campPeriod = {
    key: 'custom' as const,
    from: campaign.startDate,
    to: campaign.endDate,
    label: 'период кампании',
  };
  const rows = filterRows(dataset, { period: campPeriod, campaignId });
  return series(rows, campPeriod, metric);
}
