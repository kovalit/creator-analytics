import type { Dataset, PeriodParams } from '@/data/types';
import { calcGrowth } from '../metrics/formulas';

export interface AudienceKpi {
  key: string;
  label: string;
  value: number;
  growth: number | null;
}

export interface AudienceOverview {
  kpis: AudienceKpi[];
  growthSeries: {
    months: string[];
    known: number[];
    active: number[];
    returning: number[];
    buyers: number[];
  };
  gender: { key: string; label: string; share: number }[];
  age: { key: string; share: number }[];
  behavior: Dataset['audienceBehavior'][number] | null;
}

function snapshotsUpTo(dataset: Dataset, to: string) {
  return dataset.audienceSnapshots.filter((s) => s.date <= to);
}

export function getAudienceOverview(dataset: Dataset, params: PeriodParams): AudienceOverview {
  const upto = snapshotsUpTo(dataset, params.period.to);
  const list = upto.length ? upto : dataset.audienceSnapshots;
  const current = list[list.length - 1];
  const prev = list[list.length - 2];

  const a = current.audience;
  const pa = prev?.audience;

  const kpis: AudienceKpi[] = [
    { key: 'knownUsers', label: 'Известная аудитория', value: a.knownUsers, growth: pa ? calcGrowth(a.knownUsers, pa.knownUsers) : null },
    { key: 'active30d', label: 'Активные 30 дней', value: a.active30d, growth: pa ? calcGrowth(a.active30d, pa.active30d) : null },
    { key: 'new30d', label: 'Новые', value: a.new30d, growth: pa ? calcGrowth(a.new30d, pa.new30d) : null },
    { key: 'returning30d', label: 'Вернувшиеся', value: a.returning30d, growth: pa ? calcGrowth(a.returning30d, pa.returning30d) : null },
    { key: 'buyers30d', label: 'Покупатели', value: a.buyers30d, growth: pa ? calcGrowth(a.buyers30d, pa.buyers30d) : null },
    { key: 'rated30d', label: 'Оставляли оценки', value: a.rated30d, growth: pa ? calcGrowth(a.rated30d, pa.rated30d) : null },
  ];

  const growthSeries = {
    months: list.map((s) => s.month),
    known: list.map((s) => s.audience.knownUsers),
    active: list.map((s) => s.audience.active30d),
    returning: list.map((s) => s.audience.returning30d),
    buyers: list.map((s) => s.audience.buyers30d),
  };

  const behaviorList = dataset.audienceBehavior.filter(
    (b) => b.month <= params.period.to.slice(0, 7),
  );
  const behavior = behaviorList.length
    ? behaviorList[behaviorList.length - 1]
    : dataset.audienceBehavior[dataset.audienceBehavior.length - 1] ?? null;

  return {
    kpis,
    growthSeries,
    gender: current.demographics.gender,
    age: current.demographics.age,
    behavior,
  };
}

export interface SphereInterestRow {
  sphereId: string;
  label: string;
  audienceShare: number;
  affinityIndex: number;
  trend: number;
}

export function getSphereInterests(dataset: Dataset): SphereInterestRow[] {
  const sphereMap = new Map(dataset.spheres.map((s) => [s.id, s]));
  return dataset.affinities.sphereAffinities
    .slice()
    .sort((a, b) => b.audienceShare - a.audienceShare)
    .map((a) => ({
      sphereId: a.sphereId,
      label: sphereMap.get(a.sphereId)?.label ?? a.sphereId,
      audienceShare: a.audienceShare,
      affinityIndex: a.affinityIndex,
      trend: a.trend,
    }));
}

export function getGrowingInterests(dataset: Dataset): SphereInterestRow[] {
  return getSphereInterests(dataset)
    .slice()
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 5);
}

export interface SubscriptionRow {
  sphereId: string;
  label: string;
  subscribersFromAudience: number;
  share: number;
  growth30d: number;
}

export function getSphereSubscriptions(dataset: Dataset): SubscriptionRow[] {
  const sphereMap = new Map(dataset.spheres.map((s) => [s.id, s]));
  return dataset.sphereSubscriptions
    .slice()
    .sort((a, b) => b.subscribersFromAudience - a.subscribersFromAudience)
    .map((s) => ({
      sphereId: s.sphereId,
      label: sphereMap.get(s.sphereId)?.label ?? s.sphereId,
      subscribersFromAudience: s.subscribersFromAudience,
      share: s.share,
      growth30d: s.growth30d,
    }));
}

export interface CriterionImportanceRow {
  id: string;
  label: string;
  description: string;
  importance: number;
  benchmark: number;
  delta: number;
  audienceAvgScore: number;
}

export function getCriteriaImportance(
  dataset: Dataset,
  sphereId: string,
): CriterionImportanceRow[] {
  const critMap = new Map(dataset.criteria.map((c) => [c.id, c]));
  return dataset.affinities.criterionAffinities
    .filter((a) => a.sphereId === sphereId)
    .sort((a, b) => b.importance - a.importance)
    .map((a) => ({
      id: a.criterionId,
      label: critMap.get(a.criterionId)?.label ?? a.criterionId,
      description: critMap.get(a.criterionId)?.description ?? '',
      importance: a.importance,
      benchmark: a.platformAvgImportance,
      delta: a.delta,
      audienceAvgScore: a.audienceAvgScore,
    }));
}

export interface ProductMatchRow {
  entityId: string;
  label: string;
  brand: string;
  image: string;
  matchScore: number;
  views: number;
  saves: number;
  ratings: number;
  purchases: number;
}

export function getProductMatches(dataset: Dataset): ProductMatchRow[] {
  const entityMap = new Map(dataset.entities.map((e) => [e.id, e]));
  return dataset.affinities.entityAffinities
    .map((a) => {
      const e = entityMap.get(a.entityId);
      if (!e) return null;
      return {
        entityId: a.entityId,
        label: e.label,
        brand: e.brand,
        image: e.image,
        matchScore: a.matchScore,
        views: a.views,
        saves: a.saves,
        ratings: a.ratings,
        purchases: a.purchases,
      };
    })
    .filter((x): x is ProductMatchRow => x !== null)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/** Сферы, по которым есть критерии-аффинити (для dropdown «Что важно»). */
export function getSpheresWithCriteria(dataset: Dataset): { id: string; label: string }[] {
  const sphereMap = new Map(dataset.spheres.map((s) => [s.id, s]));
  const ids = [...new Set(dataset.affinities.criterionAffinities.map((a) => a.sphereId))];
  return ids.map((id) => ({ id, label: sphereMap.get(id)?.label ?? id }));
}
