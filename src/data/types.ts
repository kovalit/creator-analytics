// Типы demo-данных и доменной модели кабинета.

export type Platform = 'vk' | 'telegram' | 'youtube' | 'rutube';

export type SalesChannelType =
  | 'whatsbetter'
  | 'manufacturer_external'
  | 'manufacturer_ecosystem'
  | 'marketplace';

export type PeriodKey = '7d' | '30d' | '90d' | '6m' | 'ytd' | 'custom';

export interface Manifest {
  datasetVersion: number;
  generatedAt: string;
  locale: string;
  currency: string;
  timezone: string;
  demoPeriod: { from: string; to: string };
  defaultPeriod: PeriodKey;
  creatorId: string;
  creatorName: string;
  anchor: FunnelTotals;
}

export interface Creator {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  categorySphereIds: string[];
  status: string;
  verified: boolean;
  joinedAt: string;
}

export interface SocialAccount {
  id: string;
  creatorId: string;
  platform: Platform;
  label: string;
  handle: string;
  url: string;
  connected: boolean;
  followers: number;
}

export interface Sphere {
  id: string;
  name: string;
  label: string;
  parentId: string | null;
}

export interface Criterion {
  id: string;
  name: string;
  label: string;
  description: string;
  code: string;
  sphereIds: string[];
}

export interface Partner {
  id: string;
  label: string;
  companyName: string;
  logo: string;
  website: string;
  ecosystemMember: boolean;
}

export interface Marketplace {
  id: string;
  name: string;
  label: string;
  channelType: string;
}

export interface Entity {
  id: string;
  sphereId: string;
  type: string;
  name: string;
  label: string;
  brand: string;
  partnerId: string;
  image: string;
  properties: Record<string, unknown>;
  rating: { score: number; place: number; countScores: number };
}

export interface Show {
  id: string;
  name: string;
  label: string;
  description: string;
}

export interface Campaign {
  id: string;
  showId: string;
  creatorId: string;
  sphereId: string;
  title: string;
  status: 'active' | 'completed' | 'draft';
  month: string;
  startDate: string;
  endDate: string;
  heroImage: string;
  partnerIds: string[];
  entityIds: string[];
  defaultCommissionRate: number;
  attributionWindowDays: number;
  trackingCode: string;
}

export interface Publication {
  id: string;
  campaignId: string;
  creatorId: string;
  socialAccountId: string;
  platform: Platform;
  format: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  trackingCode: string;
  status: string;
}

export interface PerfRow {
  date: string;
  creatorId: string;
  campaignId: string;
  publicationId: string;
  platform: Platform;
  salesChannelType: SalesChannelType;
  marketplaceId: string | null;
  partnerId: string | null;
  views: number;
  reach: number;
  engagements: number;
  clicks: number;
  uniqueVisitors: number;
  productViews: number;
  ratingViews: number;
  ratingInteractions: number;
  addToCart: number;
  orders: number;
  purchasedOrders: number;
  gmv: number;
  commission: number;
}

export interface FunnelTotals {
  views: number;
  clicks: number;
  addToCart: number;
  orders: number;
  purchasedOrders: number;
  gmv: number;
  commission: number;
}

export interface AudienceSnapshot {
  date: string;
  month: string;
  creatorId: string;
  audience: {
    knownUsers: number;
    active30d: number;
    new30d: number;
    returning30d: number;
    buyers30d: number;
    rated30d: number;
    subscribedToSphere30d: number;
  };
  demographics: {
    gender: { key: string; label: string; share: number }[];
    age: { key: string; share: number }[];
  };
}

export interface SphereAffinity {
  sphereId: string;
  audienceShare: number;
  affinityIndex: number;
  trend: number;
}

export interface CriterionAffinity {
  criterionId: string;
  sphereId: string;
  importance: number;
  audienceAvgScore: number;
  platformAvgImportance: number;
  delta: number;
}

export interface EntityAffinity {
  entityId: string;
  sphereId: string;
  views: number;
  saves: number;
  ratings: number;
  purchases: number;
  matchScore: number;
}

export interface SphereSubscription {
  sphereId: string;
  subscribersFromAudience: number;
  share: number;
  growth30d: number;
}

export interface AudienceBehavior {
  month: string;
  creatorId: string;
  ratingViews: number;
  ratingsCreated: number;
  criteriaUsed: number;
  entitiesCompared: number;
  presetsCreated: number;
  productsSaved: number;
}

export interface CommerceOrder {
  id: string;
  orderNumber: string;
  creatorId: string;
  campaignId: string;
  publicationId: string;
  entityId: string;
  partnerId: string;
  channelType: SalesChannelType;
  marketplaceId: string | null;
  createdAt: string;
  status: 'created' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  quantity: number;
  amount: number;
  currency: string;
  commissionRate: number;
  commission: number;
}

export interface Commission {
  id: string;
  orderId: string | null;
  creatorId: string;
  campaignId: string;
  month: string;
  amount: number;
  currency: string;
  rate: number;
  status: 'estimated' | 'pending' | 'available' | 'paid' | 'reversed';
  earnedAt: string;
  availableAt: string | null;
  payoutId: string | null;
  aggregate?: boolean;
  label?: string;
}

export interface Payout {
  id: string;
  creatorId: string;
  period: { from: string; to: string };
  amount: number;
  currency: string;
  status: 'paid' | 'scheduled' | 'processing';
  paidAt: string | null;
  method: string;
}

export interface Opportunity {
  id: string;
  title: string;
  type: string;
  sphereId: string;
  partnerIds: string[];
  commission: { type: string; value: number };
  audienceMatch: number;
  estimated: {
    revenuePer1000Views: number;
    conversionRate: number;
    expectedAov: number;
  };
  startsAt: string;
  endsAt: string;
  image: string;
  status: 'available' | 'upcoming' | 'closed';
}

export interface AudienceAffinities {
  sphereAffinities: SphereAffinity[];
  criterionAffinities: CriterionAffinity[];
  entityAffinities: EntityAffinity[];
}

export interface Dataset {
  manifest: Manifest;
  creator: Creator;
  socialAccounts: SocialAccount[];
  spheres: Sphere[];
  criteria: Criterion[];
  partners: Partner[];
  marketplaces: Marketplace[];
  entities: Entity[];
  shows: Show[];
  campaigns: Campaign[];
  publications: Publication[];
  performanceDaily: PerfRow[];
  audienceSnapshots: AudienceSnapshot[];
  affinities: AudienceAffinities;
  sphereSubscriptions: SphereSubscription[];
  audienceBehavior: AudienceBehavior[];
  commerceOrders: CommerceOrder[];
  commissions: Commission[];
  payouts: Payout[];
  opportunities: Opportunity[];
}

export interface ResolvedPeriod {
  key: PeriodKey;
  from: string; // YYYY-MM-DD включительно
  to: string; // YYYY-MM-DD включительно
  label: string;
}

export interface PeriodParams {
  period: ResolvedPeriod;
  previous?: ResolvedPeriod;
  compare?: boolean;
  campaignId?: string | null;
  platform?: Platform | null;
}
