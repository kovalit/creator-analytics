// Абстракция источника данных кабинета. UI зависит только от этого интерфейса,
// поэтому mock позже можно заменить на ApiCreatorAnalyticsRepository без правок страниц.

import type {
  Creator,
  Campaign,
  Marketplace,
  Partner,
  PeriodParams,
  Platform,
  SocialAccount,
  Sphere,
} from '../types';
import type { MetricKey } from '@/analytics/selectors/perf';
import type { OverviewData } from '@/analytics/selectors/overview';
import type { ContentData, ContentDetailData } from '@/analytics/selectors/content';
import type {
  CampaignDetailData,
  CampaignSummary,
} from '@/analytics/selectors/campaigns';
import type {
  AudienceOverview,
  CriterionImportanceRow,
  ProductMatchRow,
  SphereInterestRow,
  SubscriptionRow,
} from '@/analytics/selectors/audience';
import type { SalesData } from '@/analytics/selectors/sales';
import type { EarningsData } from '@/analytics/selectors/earnings';
import type {
  OpportunityCard,
  OpportunityFilters,
} from '@/analytics/selectors/opportunities';

export interface ReferenceData {
  creator: Creator;
  socialAccounts: SocialAccount[];
  campaigns: Campaign[];
  spheres: Sphere[];
  partners: Partner[];
  marketplaces: Marketplace[];
}

export interface IntegrationState {
  social: { id: string; label: string; handle: string; connected: boolean; followers: number; platform: Platform }[];
  commerce: { id: string; label: string; status: 'active' | 'available'; note: string }[];
}

export interface CreatorAnalyticsRepository {
  getReference(): Promise<ReferenceData>;
  getOverview(params: PeriodParams): Promise<OverviewData>;
  getPerformanceSeries(
    params: PeriodParams,
    metric: MetricKey,
  ): Promise<{ current: { key: string; date: string; value: number }[]; previous: { key: string; date: string; value: number }[] | null }>;
  getContent(params: PeriodParams): Promise<ContentData>;
  getContentDetail(id: string, params: PeriodParams): Promise<ContentDetailData | null>;
  getContentSeries(id: string, params: PeriodParams, metric: MetricKey): Promise<{ key: string; date: string; value: number }[]>;
  getCampaignSummaries(params: PeriodParams): Promise<CampaignSummary[]>;
  getCampaignDetail(id: string, params: PeriodParams): Promise<CampaignDetailData | null>;
  getCampaignSeries(id: string, metric: MetricKey): Promise<{ key: string; date: string; value: number }[]>;
  getAudienceOverview(params: PeriodParams): Promise<AudienceOverview>;
  getSphereInterests(): Promise<SphereInterestRow[]>;
  getGrowingInterests(): Promise<SphereInterestRow[]>;
  getSphereSubscriptions(): Promise<SubscriptionRow[]>;
  getCriteriaImportance(sphereId: string): Promise<CriterionImportanceRow[]>;
  getProductMatches(): Promise<ProductMatchRow[]>;
  getSpheresWithCriteria(): Promise<{ id: string; label: string }[]>;
  getSales(params: PeriodParams): Promise<SalesData>;
  getEarnings(params: PeriodParams): Promise<EarningsData>;
  getOpportunities(filters: OpportunityFilters): Promise<OpportunityCard[]>;
  getOpportunitySpheres(): Promise<{ id: string; label: string }[]>;
  getIntegrations(): Promise<IntegrationState>;
}
