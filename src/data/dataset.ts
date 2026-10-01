// Загрузка demo-набора из JSON. UI не знает, что источник — статические файлы.

import manifest from '@/mock/data/manifest.json';
import creator from '@/mock/data/creator.json';
import socialAccounts from '@/mock/data/social-accounts.json';
import spheres from '@/mock/data/spheres.json';
import criteria from '@/mock/data/criteria.json';
import partners from '@/mock/data/partners.json';
import marketplaces from '@/mock/data/marketplaces.json';
import entities from '@/mock/data/entities.json';
import shows from '@/mock/data/shows.json';
import campaigns from '@/mock/data/campaigns.json';
import publications from '@/mock/data/publications.json';
import performanceDaily from '@/mock/data/performance-daily.json';
import audienceSnapshots from '@/mock/data/audience-snapshots.json';
import affinities from '@/mock/data/audience-affinities.json';
import sphereSubscriptions from '@/mock/data/sphere-subscriptions.json';
import audienceBehavior from '@/mock/data/audience-behavior.json';
import commerceOrders from '@/mock/data/commerce-orders.json';
import commissions from '@/mock/data/commissions.json';
import payouts from '@/mock/data/payouts.json';
import opportunities from '@/mock/data/opportunities.json';

import type { Dataset } from './types';

export const dataset: Dataset = {
  manifest: manifest as Dataset['manifest'],
  creator: creator as Dataset['creator'],
  socialAccounts: socialAccounts as Dataset['socialAccounts'],
  spheres: spheres as Dataset['spheres'],
  criteria: criteria as Dataset['criteria'],
  partners: partners as Dataset['partners'],
  marketplaces: marketplaces as Dataset['marketplaces'],
  entities: entities as Dataset['entities'],
  shows: shows as Dataset['shows'],
  campaigns: campaigns as Dataset['campaigns'],
  publications: publications as Dataset['publications'],
  performanceDaily: performanceDaily as Dataset['performanceDaily'],
  audienceSnapshots: audienceSnapshots as Dataset['audienceSnapshots'],
  affinities: affinities as Dataset['affinities'],
  sphereSubscriptions: sphereSubscriptions as Dataset['sphereSubscriptions'],
  audienceBehavior: audienceBehavior as Dataset['audienceBehavior'],
  commerceOrders: commerceOrders as Dataset['commerceOrders'],
  commissions: commissions as Dataset['commissions'],
  payouts: payouts as Dataset['payouts'],
  opportunities: opportunities as Dataset['opportunities'],
};
