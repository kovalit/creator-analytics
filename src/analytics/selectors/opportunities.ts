import type { Dataset, Opportunity } from '@/data/types';

export interface OpportunityCard extends Opportunity {
  sphereLabel: string;
  partnerLabels: string[];
  revenuePer1000Views: number;
}

export type OpportunitySort = 'match' | 'revenue' | 'commission' | 'newest';

export interface OpportunityFilters {
  sphereId?: string | null;
  minMatch?: number;
  sort?: OpportunitySort;
}

export function getOpportunities(
  dataset: Dataset,
  filters: OpportunityFilters = {},
): OpportunityCard[] {
  const sphereMap = new Map(dataset.spheres.map((s) => [s.id, s]));
  const partnerMap = new Map(dataset.partners.map((p) => [p.id, p]));

  let cards: OpportunityCard[] = dataset.opportunities.map((o) => ({
    ...o,
    sphereLabel: sphereMap.get(o.sphereId)?.label ?? o.sphereId,
    partnerLabels: o.partnerIds.map((id) => partnerMap.get(id)?.label ?? id),
    revenuePer1000Views: o.estimated.revenuePer1000Views,
  }));

  if (filters.sphereId) cards = cards.filter((c) => c.sphereId === filters.sphereId);
  if (filters.minMatch) cards = cards.filter((c) => c.audienceMatch >= filters.minMatch!);

  const sort = filters.sort ?? 'match';
  cards.sort((a, b) => {
    switch (sort) {
      case 'revenue':
        return b.revenuePer1000Views - a.revenuePer1000Views;
      case 'commission':
        return b.commission.value - a.commission.value;
      case 'newest':
        return a.startsAt < b.startsAt ? 1 : -1;
      case 'match':
      default:
        return b.audienceMatch - a.audienceMatch;
    }
  });

  return cards;
}

/** Сферы, представленные в возможностях (для фильтра). */
export function getOpportunitySpheres(dataset: Dataset): { id: string; label: string }[] {
  const sphereMap = new Map(dataset.spheres.map((s) => [s.id, s]));
  const ids = [...new Set(dataset.opportunities.map((o) => o.sphereId))];
  return ids.map((id) => ({ id, label: sphereMap.get(id)?.label ?? id }));
}
