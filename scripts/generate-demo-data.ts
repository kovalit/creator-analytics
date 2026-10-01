// Генератор согласованного demo-набора для кабинета WhatsBetter.me Creator.
// Запуск: npm run demo:generate
//
// Главное: сентябрьские totals складываются ТОЧНО в anchor, а месячные агрегаты
// по кампаниям/публикациям/каналам сходятся с итогами креатора.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mulberry32, allocate, repairCap, round } from './lib/rng.ts';
import {
  CREATOR,
  SOCIAL_ACCOUNTS,
  SPHERES,
  CRITERIA,
  PARTNERS,
  MARKETPLACES,
  ENTITIES,
  SHOWS,
  CAMPAIGNS,
  PUBLICATIONS,
  PLATFORM_PROFILES,
  SALES_CHANNELS,
  MONTHLY_TARGETS,
  MONTHS,
  CAMPAIGNS_BY_MONTH,
  MANIFEST,
  daysInMonth,
  weekdayOf,
} from './lib/reference.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../src/mock/data');

const rnd = mulberry32(20260930);

type PerfRow = {
  date: string;
  creatorId: string;
  campaignId: string;
  publicationId: string;
  platform: string;
  salesChannelType: string;
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
};

// --- performanceDaily ---------------------------------------------------------

function buildPerformanceDaily(): PerfRow[] {
  const out: PerfRow[] = [];

  for (const month of MONTHS) {
    const target = MONTHLY_TARGETS[month];
    const dim = daysInMonth(month);
    const campaignIds = CAMPAIGNS_BY_MONTH[month] ?? [];

    // Собираем кандидатов (day × publication × channel).
    type Cand = {
      date: string;
      campaignId: string;
      publicationId: string;
      platform: string;
      channelType: string;
      marketplaceId: string | null;
      partnerId: string | null;
      wViews: number;
      ctr: number;
      cart: number;
      order: number;
      redeem: number;
      aov: number;
      eng: number;
      commRate: number;
    };
    const cands: Cand[] = [];

    for (const campaignId of campaignIds) {
      const campaign = CAMPAIGNS.find((c) => c.id === campaignId)!;
      const pubs = PUBLICATIONS.filter((p) => p.campaignId === campaignId);
      for (const pub of pubs) {
        const prof = PLATFORM_PROFILES[pub.platform];
        for (let day = pub.publishDay; day <= dim; day++) {
          const since = day - pub.publishDay;
          // launch spike + мягкий спад
          let spike = 1;
          if (since === 0) spike = 1.9;
          else if (since === 1) spike = 1.45;
          else if (since === 2) spike = 1.2;
          const decay = Math.exp(-0.018 * since);
          // недельный паттерн
          const wd = weekdayOf(month, day);
          const weekend = wd === 0 || wd === 6;
          let weekFactor = weekend ? 0.88 : 1.0;
          if (pub.platform === 'youtube' && weekend) weekFactor = 1.1;
          // слабые дни
          const weak = rnd() < 0.12 ? 0.5 : 1;
          // шум
          const noise = 0.8 + rnd() * 0.45;
          const wDay = pub.weightMult * spike * decay * weekFactor * weak * noise;

          for (const ch of SALES_CHANNELS) {
            const partnerId =
              campaign.partnerIds.length > 0
                ? campaign.partnerIds[
                    Math.floor(rnd() * campaign.partnerIds.length) %
                      campaign.partnerIds.length
                  ]
                : null;
            cands.push({
              date: `${month}-${String(day).padStart(2, '0')}`,
              campaignId,
              publicationId: pub.id,
              platform: pub.platform,
              channelType: ch.type,
              marketplaceId: ch.marketplaceId,
              partnerId,
              wViews: wDay * ch.weight,
              ctr: prof.ctr * (0.92 + rnd() * 0.16),
              cart: prof.cart * (0.95 + rnd() * 0.1),
              order: prof.order * (0.92 + rnd() * 0.16),
              redeem: prof.redeem * (0.97 + rnd() * 0.06),
              aov: prof.aov * (0.9 + rnd() * 0.2),
              eng: prof.eng * (0.85 + rnd() * 0.3),
              commRate: campaign.defaultCommissionRate * (0.9 + rnd() * 0.2),
            });
          }
        }
      }
    }

    const n = cands.length;
    // Views
    const views = allocate(cands.map((c) => c.wViews), target.views);
    // Clicks (вес = wViews*ctr), cap <= views
    const clicks = allocate(cands.map((c) => c.wViews * c.ctr), target.clicks);
    repairCap(clicks, views);
    // Product views, cap <= clicks
    const productViews = allocate(
      cands.map((c, i) => clicks[i] * 0.75 + c.wViews * 0.01),
      target.productViews,
    );
    repairCap(productViews, clicks);
    // Add to cart, cap <= productViews
    const addToCart = allocate(
      cands.map((c, i) => productViews[i] * c.cart),
      target.addToCart,
    );
    repairCap(addToCart, productViews);
    // Orders, cap <= addToCart
    const orders = allocate(
      cands.map((c, i) => addToCart[i] * c.order),
      target.orders,
    );
    repairCap(orders, addToCart);
    // Purchased, cap <= orders
    const purchased = allocate(
      cands.map((c, i) => orders[i] * c.redeem),
      target.purchasedOrders,
    );
    repairCap(purchased, orders);
    // GMV (вес = purchased*aov), только по строкам с purchased>0
    const gmvWeights = cands.map((c, i) => (purchased[i] > 0 ? purchased[i] * c.aov : 0));
    const gmv = allocate(gmvWeights, target.gmv);
    // Commission (вес = gmv*commRate), cap <= gmv
    const commWeights = cands.map((c, i) => (gmv[i] > 0 ? gmv[i] * c.commRate : 0));
    const commission = allocate(commWeights, target.commission);
    repairCap(commission, gmv);

    for (let i = 0; i < n; i++) {
      if (views[i] <= 0) continue;
      const c = cands[i];
      const reach = round(views[i] * (0.8 + rnd() * 0.1));
      const engagements = Math.min(reach, round(views[i] * 0.09 * c.eng));
      const uniqueVisitors = Math.min(clicks[i], round(clicks[i] * (0.85 + rnd() * 0.1)));
      const ratingViews = Math.min(productViews[i], round(productViews[i] * (0.72 + rnd() * 0.12)));
      const ratingInteractions = Math.min(ratingViews, round(ratingViews * (0.2 + rnd() * 0.12)));
      out.push({
        date: c.date,
        creatorId: CREATOR.id,
        campaignId: c.campaignId,
        publicationId: c.publicationId,
        platform: c.platform,
        salesChannelType: c.channelType,
        marketplaceId: c.marketplaceId,
        partnerId: c.partnerId,
        views: views[i],
        reach,
        engagements,
        clicks: clicks[i],
        uniqueVisitors,
        productViews: productViews[i],
        ratingViews,
        ratingInteractions,
        addToCart: addToCart[i],
        orders: orders[i],
        purchasedOrders: purchased[i],
        gmv: gmv[i],
        commission: commission[i],
      });
    }
  }

  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return out;
}

// --- Audience intelligence ----------------------------------------------------

function buildAudience() {
  // Снимки на конец месяца — плавный рост.
  const snapBase: Record<
    string,
    { known: number; active: number; new30: number; returning: number; buyers: number; rated: number; subSphere: number }
  > = {
    '2026-04': { known: 41200, active: 24800, new30: 9100, returning: 15700, buyers: 2050, rated: 7100, subSphere: 10200 },
    '2026-05': { known: 46800, active: 28200, new30: 9900, returning: 18300, buyers: 2420, rated: 8300, subSphere: 11600 },
    '2026-06': { known: 51600, active: 31500, new30: 10400, returning: 21100, buyers: 2760, rated: 9300, subSphere: 12900 },
    '2026-07': { known: 56400, active: 34800, new30: 11200, returning: 23600, buyers: 3080, rated: 10400, subSphere: 14100 },
    '2026-08': { known: 62100, active: 38600, new30: 12100, returning: 26500, buyers: 3510, rated: 11700, subSphere: 15500 },
    '2026-09': { known: 68400, active: 42100, new30: 12700, returning: 29400, buyers: 3890, rated: 12800, subSphere: 16700 },
  };

  const genderBy: Record<string, [number, number, number]> = {
    '2026-04': [0.8, 0.18, 0.02],
    '2026-05': [0.8, 0.18, 0.02],
    '2026-06': [0.79, 0.19, 0.02],
    '2026-07': [0.79, 0.19, 0.02],
    '2026-08': [0.78, 0.2, 0.02],
    '2026-09': [0.78, 0.2, 0.02],
  };
  const ageBy: Record<string, [number, number, number, number]> = {
    '2026-04': [0.2, 0.4, 0.27, 0.13],
    '2026-05': [0.19, 0.41, 0.27, 0.13],
    '2026-06': [0.19, 0.41, 0.27, 0.13],
    '2026-07': [0.18, 0.42, 0.27, 0.13],
    '2026-08': [0.18, 0.42, 0.27, 0.13],
    '2026-09': [0.18, 0.42, 0.27, 0.13],
  };

  const audienceSnapshots = MONTHS.map((month) => {
    const b = snapBase[month];
    const dim = daysInMonth(month);
    const [gf, gm, gu] = genderBy[month];
    const [a1, a2, a3, a4] = ageBy[month];
    return {
      date: `${month}-${String(dim).padStart(2, '0')}`,
      month,
      creatorId: CREATOR.id,
      audience: {
        knownUsers: b.known,
        active30d: b.active,
        new30d: b.new30,
        returning30d: b.returning,
        buyers30d: b.buyers,
        rated30d: b.rated,
        subscribedToSphere30d: b.subSphere,
      },
      demographics: {
        gender: [
          { key: 'female', label: 'Женщины', share: gf },
          { key: 'male', label: 'Мужчины', share: gm },
          { key: 'unknown', label: 'Не указан', share: gu },
        ],
        age: [
          { key: '18-24', share: a1 },
          { key: '25-34', share: a2 },
          { key: '35-44', share: a3 },
          { key: '45+', share: a4 },
        ],
      },
    };
  });

  // Sphere affinities (не обязаны суммироваться в 1).
  const sphereAff: {
    sphereId: string;
    audienceShare: number;
    affinityIndex: number;
    trend: number;
  }[] = [
    { sphereId: 'sphere_skincare', audienceShare: 0.82, affinityIndex: 168, trend: 0.12 },
    { sphereId: 'sphere_beauty', audienceShare: 0.79, affinityIndex: 161, trend: 0.08 },
    { sphereId: 'sphere_face_cream', audienceShare: 0.74, affinityIndex: 155, trend: 0.14 },
    { sphereId: 'sphere_travel', audienceShare: 0.57, affinityIndex: 131, trend: 0.09 },
    { sphereId: 'sphere_healthy_food', audienceShare: 0.51, affinityIndex: 124, trend: 0.11 },
    { sphereId: 'sphere_fashion', audienceShare: 0.47, affinityIndex: 118, trend: 0.05 },
    { sphereId: 'sphere_perfume', audienceShare: 0.44, affinityIndex: 139, trend: 0.07 },
    { sphereId: 'sphere_spf', audienceShare: 0.39, affinityIndex: 142, trend: 0.18 },
    { sphereId: 'sphere_home_interior', audienceShare: 0.34, affinityIndex: 104, trend: 0.06 },
    { sphereId: 'sphere_hotels', audienceShare: 0.31, affinityIndex: 112, trend: 0.1 },
    { sphereId: 'sphere_fitness', audienceShare: 0.29, affinityIndex: 108, trend: 0.04 },
    { sphereId: 'sphere_home_appliance', audienceShare: 0.26, affinityIndex: 96, trend: -0.03 },
    { sphereId: 'sphere_restaurants', audienceShare: 0.23, affinityIndex: 91, trend: 0.02 },
    { sphereId: 'sphere_home', audienceShare: 0.22, affinityIndex: 89, trend: 0.01 },
  ];

  const sphereSubscriptions = [
    { sphereId: 'sphere_skincare', subscribersFromAudience: 24600, share: 0.584, growth30d: 0.082 },
    { sphereId: 'sphere_beauty', subscribersFromAudience: 21300, share: 0.506, growth30d: 0.061 },
    { sphereId: 'sphere_face_cream', subscribersFromAudience: 18900, share: 0.449, growth30d: 0.097 },
    { sphereId: 'sphere_travel', subscribersFromAudience: 12400, share: 0.294, growth30d: 0.054 },
    { sphereId: 'sphere_healthy_food', subscribersFromAudience: 10800, share: 0.256, growth30d: 0.069 },
    { sphereId: 'sphere_perfume', subscribersFromAudience: 9600, share: 0.228, growth30d: 0.043 },
    { sphereId: 'sphere_fashion', subscribersFromAudience: 9100, share: 0.216, growth30d: 0.038 },
    { sphereId: 'sphere_spf', subscribersFromAudience: 7700, share: 0.183, growth30d: 0.121 },
    { sphereId: 'sphere_hotels', subscribersFromAudience: 6200, share: 0.147, growth30d: 0.047 },
    { sphereId: 'sphere_fitness', subscribersFromAudience: 5400, share: 0.128, growth30d: 0.029 },
  ];

  // Criterion affinities для кремов для лица (>=10).
  const faceCreamCriteria = CRITERIA.filter((c) => c.sphereIds.includes('sphere_face_cream'));
  const importanceSeed: Record<string, [number, number, number]> = {
    // criterionName: [importance, audienceAvgScore, platformAvgImportance]
    hydration: [92, 0.81, 74],
    composition: [87, 0.78, 72],
    sensitive_skin: [83, 0.74, 66],
    price_value: [76, 0.69, 70],
    texture: [71, 0.76, 63],
    absorption: [69, 0.75, 61],
    no_stickiness: [66, 0.72, 58],
    longevity: [64, 0.7, 60],
    comfort: [61, 0.73, 57],
    economy: [54, 0.66, 59],
    scent: [48, 0.64, 52],
    packaging: [39, 0.61, 47],
  };
  const criterionAffinities = faceCreamCriteria.map((c) => {
    const seed = importanceSeed[c.name] ?? [50, 0.6, 50];
    return {
      criterionId: c.id,
      sphereId: 'sphere_face_cream',
      importance: seed[0],
      audienceAvgScore: seed[1],
      platformAvgImportance: seed[2],
      delta: seed[0] - seed[2],
    };
  });

  // Entity affinities (>=10). Лучший по рейтингу не обязан иметь лучший match.
  const matchSeed = [94, 88, 91, 83, 86, 79, 90, 82, 76, 85, 81, 72, 88, 74, 80, 69, 77, 71, 84, 66];
  const entityAffinities = ENTITIES.map((e, i) => {
    const base = 1 - i * 0.03;
    return {
      entityId: e.id,
      sphereId: 'sphere_face_cream',
      views: round(8600 * base * (0.8 + rnd() * 0.4)),
      saves: round(1550 * base * (0.75 + rnd() * 0.5)),
      ratings: round(960 * base * (0.8 + rnd() * 0.4)),
      purchases: round(230 * base * (0.7 + rnd() * 0.6)),
      matchScore: matchSeed[i],
    };
  });

  const behaviorBase: Record<string, number> = {
    '2026-04': 0.6,
    '2026-05': 0.68,
    '2026-06': 0.76,
    '2026-07': 0.83,
    '2026-08': 0.92,
    '2026-09': 1.0,
  };
  const audienceBehavior = MONTHS.map((month) => {
    const f = behaviorBase[month];
    return {
      month,
      creatorId: CREATOR.id,
      ratingViews: round(32800 * f),
      ratingsCreated: round(9470 * f),
      criteriaUsed: round(18200 * f),
      entitiesCompared: round(11600 * f),
      presetsCreated: round(1290 * f),
      productsSaved: round(7820 * f),
    };
  });

  return {
    audienceSnapshots,
    sphereAffinities: sphereAff,
    sphereSubscriptions,
    criterionAffinities,
    entityAffinities,
    audienceBehavior,
  };
}

// --- Commerce orders / commissions / payouts ---------------------------------

function buildCommerce() {
  const flagship = CAMPAIGNS.find((c) => c.id === 'campaign_face_cream_2026_09')!;
  const flagshipPubs = PUBLICATIONS.filter((p) => p.campaignId === flagship.id);
  const statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'shipped', 'paid', 'created', 'cancelled', 'returned'];

  const commerceOrders: {
    id: string;
    orderNumber: string;
    creatorId: string;
    campaignId: string;
    publicationId: string;
    entityId: string;
    partnerId: string;
    channelType: string;
    marketplaceId: string | null;
    createdAt: string;
    status: string;
    quantity: number;
    amount: number;
    currency: string;
    commissionRate: number;
    commission: number;
  }[] = [];

  for (let i = 0; i < 40; i++) {
    const entity = ENTITIES[Math.floor(rnd() * ENTITIES.length) % ENTITIES.length];
    const pub = flagshipPubs[Math.floor(rnd() * flagshipPubs.length) % flagshipPubs.length];
    const ch = SALES_CHANNELS[Math.floor(rnd() * SALES_CHANNELS.length) % SALES_CHANNELS.length];
    const status = statuses[Math.floor(rnd() * statuses.length) % statuses.length];
    const day = 30 - Math.floor(rnd() * 12); // последние ~12 дней сентября
    const hour = 8 + Math.floor(rnd() * 14);
    const minute = Math.floor(rnd() * 60);
    const quantity = rnd() < 0.82 ? 1 : 2;
    const unit = 1990 + Math.floor(rnd() * 4600);
    const amount = unit * quantity;
    const rate = 0.06 + rnd() * 0.08; // 6–14%
    const commissionRate = Math.round(rate * 100) / 100;
    const commission = status === 'cancelled' ? 0 : round(amount * commissionRate);
    commerceOrders.push({
      id: `order_demo_${String(i + 1).padStart(4, '0')}`,
      orderNumber: `WB-2609${String(day).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
      creatorId: CREATOR.id,
      campaignId: flagship.id,
      publicationId: pub.id,
      entityId: entity.id,
      partnerId: entity.partnerId,
      channelType: ch.type,
      marketplaceId: ch.marketplaceId,
      createdAt: `2026-09-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+03:00`,
      status,
      quantity,
      amount,
      currency: 'RUB',
      commissionRate,
      commission,
    });
  }
  commerceOrders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // Commissions
  const commissions: {
    id: string;
    orderId: string | null;
    creatorId: string;
    campaignId: string;
    month: string;
    amount: number;
    currency: string;
    rate: number;
    status: string;
    earnedAt: string;
    availableAt: string | null;
    payoutId: string | null;
    aggregate?: boolean;
    label?: string;
  }[] = [];

  // Исторические месяцы Apr–Aug — агрегированные выплаченные комиссии.
  const monthlyPayoutMap: Record<string, string> = {
    '2026-04': 'payout_2026_04',
    '2026-05': 'payout_2026_05',
    '2026-06': 'payout_2026_06',
    '2026-07': 'payout_2026_07',
    '2026-08': 'payout_2026_08',
  };
  for (const m of ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08']) {
    const dim = daysInMonth(m);
    commissions.push({
      id: `commission_agg_${m}`,
      orderId: null,
      creatorId: CREATOR.id,
      campaignId: CAMPAIGNS_BY_MONTH[m][0],
      month: m,
      amount: MONTHLY_TARGETS[m].commission,
      currency: 'RUB',
      rate: 0.1,
      status: 'paid',
      earnedAt: `${m}-${String(dim).padStart(2, '0')}T20:00:00+03:00`,
      availableAt: `${m}-${String(dim).padStart(2, '0')}T20:00:00+03:00`,
      payoutId: monthlyPayoutMap[m],
      aggregate: true,
      label: 'Комиссия за месяц',
    });
  }

  // Сентябрь: детальные комиссии по заказам + агрегаты до 380 000.
  const statusMap: Record<string, string> = {
    delivered: 'available',
    shipped: 'pending',
    paid: 'paid',
    created: 'estimated',
    returned: 'reversed',
    cancelled: 'reversed',
  };
  let idx = 1;
  const sepDetailByStatus: Record<string, number> = {
    available: 0,
    pending: 0,
    estimated: 0,
    paid: 0,
    reversed: 0,
  };
  for (const o of commerceOrders) {
    if (o.status === 'cancelled') continue;
    const st = statusMap[o.status];
    const availableAt =
      st === 'available' || st === 'paid'
        ? `2026-10-${String(5 + (idx % 10)).padStart(2, '0')}T00:00:00+03:00`
        : null;
    commissions.push({
      id: `commission_${String(idx).padStart(4, '0')}`,
      orderId: o.id,
      creatorId: CREATOR.id,
      campaignId: o.campaignId,
      month: '2026-09',
      amount: o.commission,
      currency: 'RUB',
      rate: o.commissionRate,
      status: st,
      earnedAt: o.createdAt,
      availableAt,
      payoutId: st === 'paid' ? 'payout_2026_09_h1' : null,
    });
    sepDetailByStatus[st] += o.commission;
    idx++;
  }

  // Целевой сентябрьский сплит (сумма earned = 380000; reversed отдельно).
  const sepTargets: Record<string, number> = {
    paid: 40000,
    available: 190000,
    pending: 110000,
    estimated: 40000,
  };
  for (const st of ['paid', 'available', 'pending', 'estimated']) {
    const remainder = sepTargets[st] - sepDetailByStatus[st];
    if (remainder > 0) {
      commissions.push({
        id: `commission_agg_2026_09_${st}`,
        orderId: null,
        creatorId: CREATOR.id,
        campaignId: flagship.id,
        month: '2026-09',
        amount: remainder,
        currency: 'RUB',
        rate: 0.1,
        status: st,
        earnedAt: '2026-09-30T20:00:00+03:00',
        availableAt:
          st === 'available' || st === 'paid' ? '2026-10-14T00:00:00+03:00' : null,
        payoutId: st === 'paid' ? 'payout_2026_09_h1' : null,
        aggregate: true,
        label: 'Прочие начисления сентября',
      });
    }
  }

  // Payouts (суммы сходятся с paid-комиссиями).
  const payouts = [
    { id: 'payout_2026_04', creatorId: CREATOR.id, period: { from: '2026-04-01', to: '2026-04-30' }, amount: 115000, currency: 'RUB', status: 'paid', paidAt: '2026-05-05T12:00:00+03:00', method: 'bank_account' },
    { id: 'payout_2026_05', creatorId: CREATOR.id, period: { from: '2026-05-01', to: '2026-05-31' }, amount: 145000, currency: 'RUB', status: 'paid', paidAt: '2026-06-05T12:00:00+03:00', method: 'bank_account' },
    { id: 'payout_2026_06', creatorId: CREATOR.id, period: { from: '2026-06-01', to: '2026-06-30' }, amount: 190000, currency: 'RUB', status: 'paid', paidAt: '2026-07-06T12:00:00+03:00', method: 'bank_account' },
    { id: 'payout_2026_07', creatorId: CREATOR.id, period: { from: '2026-07-01', to: '2026-07-31' }, amount: 225000, currency: 'RUB', status: 'paid', paidAt: '2026-08-05T12:00:00+03:00', method: 'bank_account' },
    { id: 'payout_2026_08', creatorId: CREATOR.id, period: { from: '2026-08-01', to: '2026-08-31' }, amount: 295000, currency: 'RUB', status: 'paid', paidAt: '2026-09-05T12:00:00+03:00', method: 'bank_account' },
    { id: 'payout_2026_09_h1', creatorId: CREATOR.id, period: { from: '2026-09-01', to: '2026-09-15' }, amount: 40000, currency: 'RUB', status: 'paid', paidAt: '2026-09-18T12:00:00+03:00', method: 'bank_account' },
    { id: 'payout_2026_09_h2', creatorId: CREATOR.id, period: { from: '2026-09-16', to: '2026-09-30' }, amount: 190000, currency: 'RUB', status: 'scheduled', paidAt: null, method: 'bank_account' },
  ];

  return { commerceOrders, commissions, payouts };
}

// --- Opportunities ------------------------------------------------------------

function buildOpportunities() {
  return [
    { id: 'offer_spf_2026_10', title: 'Что лучше: SPF 50', type: 'campaign', sphereId: 'sphere_spf', partnerIds: ['partner_nordskin', 'partner_hydrael'], commission: { type: 'percent', value: 0.12 }, audienceMatch: 0.93, estimated: { revenuePer1000Views: 4600, conversionRate: 0.061, expectedAov: 3900 }, startsAt: '2026-10-15', endsAt: '2026-11-15', image: '/demo/opportunities/spf.svg', status: 'available' },
    { id: 'offer_serum_2026_10', title: 'Что лучше: сыворотки для лица', type: 'campaign', sphereId: 'sphere_skincare', partnerIds: ['partner_lumera', 'partner_velura', 'partner_hydrael'], commission: { type: 'percent', value: 0.11 }, audienceMatch: 0.91, estimated: { revenuePer1000Views: 4300, conversionRate: 0.058, expectedAov: 4200 }, startsAt: '2026-10-20', endsAt: '2026-11-20', image: '/demo/opportunities/serum.svg', status: 'available' },
    { id: 'offer_perfume_2026_11', title: 'Что лучше: парфюмерия на осень', type: 'campaign', sphereId: 'sphere_perfume', partnerIds: ['partner_mireya', 'partner_lumera'], commission: { type: 'percent', value: 0.13 }, audienceMatch: 0.86, estimated: { revenuePer1000Views: 5100, conversionRate: 0.049, expectedAov: 5600 }, startsAt: '2026-11-01', endsAt: '2026-12-01', image: '/demo/opportunities/perfume.svg', status: 'available' },
    { id: 'offer_hotels_2026_11', title: 'Что лучше: зимние курорты', type: 'campaign', sphereId: 'sphere_hotels', partnerIds: ['partner_velura', 'partner_botane'], commission: { type: 'percent', value: 0.08 }, audienceMatch: 0.79, estimated: { revenuePer1000Views: 6200, conversionRate: 0.028, expectedAov: 42000 }, startsAt: '2026-11-10', endsAt: '2026-12-25', image: '/demo/opportunities/hotels.svg', status: 'available' },
    { id: 'offer_healthyfood_2026_10', title: 'Что лучше: протеиновые батончики', type: 'campaign', sphereId: 'sphere_healthy_food', partnerIds: ['partner_aqovia', 'partner_purenord'], commission: { type: 'percent', value: 0.1 }, audienceMatch: 0.82, estimated: { revenuePer1000Views: 2800, conversionRate: 0.072, expectedAov: 1850 }, startsAt: '2026-10-18', endsAt: '2026-11-18', image: '/demo/opportunities/food.svg', status: 'available' },
    { id: 'offer_sportswear_2026_11', title: 'Что лучше: одежда для бега', type: 'campaign', sphereId: 'sphere_sportswear', partnerIds: ['partner_verenska', 'partner_velura'], commission: { type: 'percent', value: 0.09 }, audienceMatch: 0.77, estimated: { revenuePer1000Views: 3400, conversionRate: 0.041, expectedAov: 4700 }, startsAt: '2026-11-05', endsAt: '2026-12-05', image: '/demo/opportunities/sportswear.svg', status: 'available' },
    { id: 'offer_appliance_2026_11', title: 'Что лучше: техника для дома', type: 'campaign', sphereId: 'sphere_home_appliance', partnerIds: ['partner_skinlab', 'partner_purenord'], commission: { type: 'percent', value: 0.07 }, audienceMatch: 0.68, estimated: { revenuePer1000Views: 5800, conversionRate: 0.022, expectedAov: 18900 }, startsAt: '2026-11-15', endsAt: '2026-12-20', image: '/demo/opportunities/appliance.svg', status: 'available' },
    { id: 'offer_interior_2026_12', title: 'Что лучше: декор для интерьера', type: 'campaign', sphereId: 'sphere_home_interior', partnerIds: ['partner_botane', 'partner_mireya'], commission: { type: 'percent', value: 0.1 }, audienceMatch: 0.71, estimated: { revenuePer1000Views: 3900, conversionRate: 0.034, expectedAov: 6800 }, startsAt: '2026-12-01', endsAt: '2027-01-10', image: '/demo/opportunities/interior.svg', status: 'upcoming' },
    { id: 'offer_facecare_set_2026_10', title: 'Что лучше: наборы для ухода', type: 'campaign', sphereId: 'sphere_skincare', partnerIds: ['partner_nordskin', 'partner_lumera', 'partner_aqovia'], commission: { type: 'percent', value: 0.12 }, audienceMatch: 0.9, estimated: { revenuePer1000Views: 5200, conversionRate: 0.054, expectedAov: 5900 }, startsAt: '2026-10-25', endsAt: '2026-11-25', image: '/demo/opportunities/set.svg', status: 'available' },
    { id: 'offer_fitness_2026_11', title: 'Что лучше: фитнес-клубы', type: 'campaign', sphereId: 'sphere_fitness', partnerIds: ['partner_velura'], commission: { type: 'percent', value: 0.09 }, audienceMatch: 0.66, estimated: { revenuePer1000Views: 4100, conversionRate: 0.031, expectedAov: 12000 }, startsAt: '2026-11-12', endsAt: '2026-12-12', image: '/demo/opportunities/fitness.svg', status: 'available' },
    { id: 'offer_perfume_niche_2026_12', title: 'Что лучше: селективная парфюмерия', type: 'campaign', sphereId: 'sphere_perfume', partnerIds: ['partner_mireya', 'partner_velura'], commission: { type: 'percent', value: 0.14 }, audienceMatch: 0.84, estimated: { revenuePer1000Views: 5600, conversionRate: 0.046, expectedAov: 7200 }, startsAt: '2026-12-05', endsAt: '2027-01-05', image: '/demo/opportunities/perfume-niche.svg', status: 'upcoming' },
    { id: 'offer_restaurants_2026_11', title: 'Что лучше: доставка здоровой еды', type: 'campaign', sphereId: 'sphere_restaurants', partnerIds: ['partner_aqovia'], commission: { type: 'percent', value: 0.08 }, audienceMatch: 0.63, estimated: { revenuePer1000Views: 2200, conversionRate: 0.067, expectedAov: 1650 }, startsAt: '2026-11-20', endsAt: '2026-12-20', image: '/demo/opportunities/restaurants.svg', status: 'available' },
  ];
}

// --- Write --------------------------------------------------------------------

function writeJson(name: string, data: unknown) {
  writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const performanceDaily = buildPerformanceDaily();
  const audience = buildAudience();
  const commerce = buildCommerce();
  const opportunities = buildOpportunities();

  writeJson('manifest.json', MANIFEST);
  writeJson('creator.json', CREATOR);
  writeJson('social-accounts.json', SOCIAL_ACCOUNTS);
  writeJson('spheres.json', SPHERES);
  writeJson('criteria.json', CRITERIA);
  writeJson('partners.json', PARTNERS);
  writeJson('marketplaces.json', MARKETPLACES);
  writeJson('entities.json', ENTITIES);
  writeJson('shows.json', SHOWS);
  writeJson(
    'campaigns.json',
    CAMPAIGNS.map(({ ...c }) => c),
  );
  writeJson(
    'publications.json',
    PUBLICATIONS.map(({ publishDay: _pd, weightMult: _wm, ...p }) => p),
  );
  writeJson('performance-daily.json', performanceDaily);
  writeJson('audience-snapshots.json', audience.audienceSnapshots);
  writeJson('audience-affinities.json', {
    sphereAffinities: audience.sphereAffinities,
    criterionAffinities: audience.criterionAffinities,
    entityAffinities: audience.entityAffinities,
  });
  writeJson('sphere-subscriptions.json', audience.sphereSubscriptions);
  writeJson('audience-behavior.json', audience.audienceBehavior);
  writeJson('commerce-orders.json', commerce.commerceOrders);
  writeJson('commissions.json', commerce.commissions);
  writeJson('payouts.json', commerce.payouts);
  writeJson('opportunities.json', opportunities);

  // Короткий отчёт в консоль.
  const sep = performanceDaily.filter((r) => r.date.startsWith('2026-09'));
  const totalsSep = sep.reduce(
    (acc, r) => {
      acc.views += r.views;
      acc.clicks += r.clicks;
      acc.addToCart += r.addToCart;
      acc.orders += r.orders;
      acc.purchasedOrders += r.purchasedOrders;
      acc.gmv += r.gmv;
      acc.commission += r.commission;
      return acc;
    },
    { views: 0, clicks: 0, addToCart: 0, orders: 0, purchasedOrders: 0, gmv: 0, commission: 0 },
  );
  console.log(`Готово. Строк performanceDaily: ${performanceDaily.length}`);
  console.log('Сентябрьский anchor:', JSON.stringify(totalsSep));
}

main();
