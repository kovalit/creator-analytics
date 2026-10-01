// Реализация репозитория на статическом JSON-наборе.

import type { PeriodParams, Platform } from '../types';
import { dataset } from '../dataset';
import type {
  CreatorAnalyticsRepository,
  IntegrationState,
  ReferenceData,
} from './CreatorAnalyticsRepository';
import { getOverview, getPerformanceSeries } from '@/analytics/selectors/overview';
import { getContent, getContentDetail, getContentSeries } from '@/analytics/selectors/content';
import {
  getCampaignDetail,
  getCampaignSeries,
  getCampaignSummaries,
} from '@/analytics/selectors/campaigns';
import {
  getAudienceOverview,
  getCriteriaImportance,
  getGrowingInterests,
  getProductMatches,
  getSphereInterests,
  getSphereSubscriptions,
  getSpheresWithCriteria,
} from '@/analytics/selectors/audience';
import { getSales } from '@/analytics/selectors/sales';
import { getEarnings } from '@/analytics/selectors/earnings';
import {
  getOpportunities,
  getOpportunitySpheres,
  type OpportunityFilters,
} from '@/analytics/selectors/opportunities';
import type { MetricKey } from '@/analytics/selectors/perf';

// В demo данные локальные и синхронные — оборачиваем в Promise, чтобы сохранить
// асинхронный контракт будущего API.
const ok = <T>(value: T): Promise<T> => Promise.resolve(value);

export class MockCreatorAnalyticsRepository implements CreatorAnalyticsRepository {
  getReference(): Promise<ReferenceData> {
    return ok({
      creator: dataset.creator,
      socialAccounts: dataset.socialAccounts,
      campaigns: dataset.campaigns,
      spheres: dataset.spheres,
      partners: dataset.partners,
      marketplaces: dataset.marketplaces,
    });
  }

  getOverview(params: PeriodParams) {
    return ok(getOverview(dataset, params));
  }

  getPerformanceSeries(params: PeriodParams, metric: MetricKey) {
    return ok(getPerformanceSeries(dataset, params, metric));
  }

  getContent(params: PeriodParams) {
    return ok(getContent(dataset, params));
  }

  getContentDetail(id: string, params: PeriodParams) {
    return ok(getContentDetail(dataset, id, params));
  }

  getContentSeries(id: string, params: PeriodParams, metric: MetricKey) {
    return ok(getContentSeries(dataset, id, params, metric));
  }

  getCampaignSummaries(params: PeriodParams) {
    return ok(getCampaignSummaries(dataset, params));
  }

  getCampaignDetail(id: string, params: PeriodParams) {
    return ok(getCampaignDetail(dataset, id, params));
  }

  getCampaignSeries(id: string, metric: MetricKey) {
    return ok(getCampaignSeries(dataset, id, metric));
  }

  getAudienceOverview(params: PeriodParams) {
    return ok(getAudienceOverview(dataset, params));
  }

  getSphereInterests() {
    return ok(getSphereInterests(dataset));
  }

  getGrowingInterests() {
    return ok(getGrowingInterests(dataset));
  }

  getSphereSubscriptions() {
    return ok(getSphereSubscriptions(dataset));
  }

  getCriteriaImportance(sphereId: string) {
    return ok(getCriteriaImportance(dataset, sphereId));
  }

  getProductMatches() {
    return ok(getProductMatches(dataset));
  }

  getSpheresWithCriteria() {
    return ok(getSpheresWithCriteria(dataset));
  }

  getSales(params: PeriodParams) {
    return ok(getSales(dataset, params));
  }

  getEarnings(params: PeriodParams) {
    return ok(getEarnings(dataset, params));
  }

  getOpportunities(filters: OpportunityFilters) {
    return ok(getOpportunities(dataset, filters));
  }

  getOpportunitySpheres() {
    return ok(getOpportunitySpheres(dataset));
  }

  getIntegrations(): Promise<IntegrationState> {
    const social = dataset.socialAccounts.map((s) => ({
      id: s.id,
      label: s.label,
      handle: s.handle,
      connected: s.connected,
      followers: s.followers,
      platform: s.platform as Platform,
    }));
    const commerce = [
      { id: 'whatsbetter', label: 'Whatsbetter', status: 'active' as const, note: 'Прямые продажи и рейтинги' },
      ...dataset.marketplaces
        .filter((m) => m.channelType === 'marketplace')
        .map((m) => ({
          id: m.id,
          label: m.label,
          status: 'available' as const,
          note: 'Данные о продажах доступны',
        })),
    ];
    return ok({ social, commerce });
  }
}

export const repository: CreatorAnalyticsRepository = new MockCreatorAnalyticsRepository();
