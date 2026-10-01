// Валидатор demo-набора. Запуск: npm run demo:validate
// Критерий готовности: Validation passed: 0 errors

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../src/mock/data');

function load<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(DATA_DIR, name), 'utf8')) as T;
}

const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => warnings.push(m);

type Perf = {
  date: string;
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
  addToCart: number;
  orders: number;
  purchasedOrders: number;
  gmv: number;
  commission: number;
};

const manifest = load<any>('manifest.json');
const spheres = load<any[]>('spheres.json');
const criteria = load<any[]>('criteria.json');
const partners = load<any[]>('partners.json');
const marketplaces = load<any[]>('marketplaces.json');
const entities = load<any[]>('entities.json');
const campaigns = load<any[]>('campaigns.json');
const publications = load<any[]>('publications.json');
const perf = load<Perf[]>('performance-daily.json');
const snapshots = load<any[]>('audience-snapshots.json');
const affinities = load<any>('audience-affinities.json');
const commissions = load<any[]>('commissions.json');
const payouts = load<any[]>('payouts.json');
const orders = load<any[]>('commerce-orders.json');
const opportunities = load<any[]>('opportunities.json');

const sphereIds = new Set(spheres.map((s) => s.id));
const partnerIds = new Set(partners.map((p) => p.id));
const marketplaceIds = new Set(marketplaces.map((m) => m.id));
const entityIds = new Set(entities.map((e) => e.id));
const campaignIds = new Set(campaigns.map((c) => c.id));
const pubIds = new Set(publications.map((p) => p.id));
const criterionIds = new Set(criteria.map((c) => c.id));

// 1. Duplicate IDs
function checkDuplicates(name: string, arr: any[]) {
  const seen = new Set<string>();
  for (const x of arr) {
    if (x.id === undefined) continue;
    if (seen.has(x.id)) err(`[${name}] дубликат id: ${x.id}`);
    seen.add(x.id);
  }
}
checkDuplicates('spheres', spheres);
checkDuplicates('criteria', criteria);
checkDuplicates('partners', partners);
checkDuplicates('entities', entities);
checkDuplicates('campaigns', campaigns);
checkDuplicates('publications', publications);
checkDuplicates('commissions', commissions);
checkDuplicates('payouts', payouts);
checkDuplicates('orders', orders);
checkDuplicates('opportunities', opportunities);

// 2. Referential integrity
for (const s of spheres) {
  if (s.parentId !== null && !sphereIds.has(s.parentId)) err(`sphere ${s.id}: parentId ${s.parentId} не найден`);
}
for (const c of criteria) {
  for (const sid of c.sphereIds) if (!sphereIds.has(sid)) err(`criterion ${c.id}: sphere ${sid} не найден`);
}
for (const e of entities) {
  if (!sphereIds.has(e.sphereId)) err(`entity ${e.id}: sphere не найден`);
  if (!partnerIds.has(e.partnerId)) err(`entity ${e.id}: partner не найден`);
}
for (const c of campaigns) {
  if (!sphereIds.has(c.sphereId)) err(`campaign ${c.id}: sphere не найден`);
  for (const p of c.partnerIds) if (!partnerIds.has(p)) err(`campaign ${c.id}: partner ${p} не найден`);
  for (const e of c.entityIds) if (!entityIds.has(e)) err(`campaign ${c.id}: entity ${e} не найден`);
}
for (const p of publications) {
  if (!campaignIds.has(p.campaignId)) err(`pub ${p.id}: campaign не найден`);
}
for (const r of perf) {
  if (!campaignIds.has(r.campaignId)) err(`perf: campaign ${r.campaignId} не найден`);
  if (!pubIds.has(r.publicationId)) err(`perf: publication ${r.publicationId} не найден`);
  if (r.marketplaceId && !marketplaceIds.has(r.marketplaceId)) err(`perf: marketplace ${r.marketplaceId} не найден`);
  if (r.partnerId && !partnerIds.has(r.partnerId)) err(`perf: partner ${r.partnerId} не найден`);
}
for (const o of orders) {
  if (!campaignIds.has(o.campaignId)) err(`order ${o.id}: campaign не найден`);
  if (!pubIds.has(o.publicationId)) err(`order ${o.id}: publication не найден`);
  if (!entityIds.has(o.entityId)) err(`order ${o.id}: entity не найден`);
  if (o.marketplaceId && !marketplaceIds.has(o.marketplaceId)) err(`order ${o.id}: marketplace не найден`);
}
for (const a of affinities.criterionAffinities) {
  if (!criterionIds.has(a.criterionId)) err(`criterionAffinity: ${a.criterionId} не найден`);
}
for (const a of affinities.entityAffinities) {
  if (!entityIds.has(a.entityId)) err(`entityAffinity: ${a.entityId} не найден`);
}
for (const a of affinities.sphereAffinities) {
  if (!sphereIds.has(a.sphereId)) err(`sphereAffinity: ${a.sphereId} не найден`);
}
for (const o of opportunities) {
  if (!sphereIds.has(o.sphereId)) err(`opportunity ${o.id}: sphere не найден`);
  for (const p of o.partnerIds) if (!partnerIds.has(p)) err(`opportunity ${o.id}: partner ${p} не найден`);
}

// 3. Funnel inequalities + no negatives
for (const r of perf) {
  const fields = [r.views, r.clicks, r.productViews, r.addToCart, r.orders, r.purchasedOrders, r.gmv, r.commission, r.reach, r.engagements, r.uniqueVisitors];
  if (fields.some((v) => v < 0 || !Number.isFinite(v))) err(`perf ${r.date}/${r.publicationId}: отрицательные/NaN значения`);
  if (r.clicks > r.views) err(`perf ${r.date}/${r.publicationId}: clicks > views`);
  if (r.uniqueVisitors > r.clicks) err(`perf ${r.date}/${r.publicationId}: uniqueVisitors > clicks`);
  if (r.productViews > r.clicks) err(`perf ${r.date}/${r.publicationId}: productViews > clicks`);
  if (r.addToCart > r.productViews) err(`perf ${r.date}/${r.publicationId}: addToCart > productViews`);
  if (r.orders > r.addToCart) err(`perf ${r.date}/${r.publicationId}: orders > addToCart`);
  if (r.purchasedOrders > r.orders) err(`perf ${r.date}/${r.publicationId}: purchasedOrders > orders`);
  if (r.commission > r.gmv) err(`perf ${r.date}/${r.publicationId}: commission > gmv`);
}

// 4. September anchor
const anchor = manifest.anchor;
const metrics = ['views', 'clicks', 'addToCart', 'orders', 'purchasedOrders', 'gmv', 'commission'] as const;
const sep = perf.filter((r) => r.date.startsWith('2026-09'));
const sepTotals: Record<string, number> = {};
for (const m of metrics) sepTotals[m] = sep.reduce((a, r) => a + (r as any)[m], 0);
for (const m of metrics) {
  if (sepTotals[m] !== anchor[m]) err(`Сентябрьский anchor: ${m} = ${sepTotals[m]}, ожидалось ${anchor[m]}`);
}

// 5. Monthly growth (positive overall trend), not strictly monotonic allowed
const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
const monthlyViews = months.map((mo) => perf.filter((r) => r.date.startsWith(mo)).reduce((a, r) => a + r.views, 0));
const monthlyGmv = months.map((mo) => perf.filter((r) => r.date.startsWith(mo)).reduce((a, r) => a + r.gmv, 0));
if (monthlyViews[5] <= monthlyViews[0]) err('Нет роста просмотров за период');
if (monthlyGmv[5] <= monthlyGmv[0]) err('Нет роста GMV за период');

// 6. Breakdown reconciliation: campaigns & platforms & channels == total
function sumBy(rows: Perf[], metric: keyof Perf) {
  return rows.reduce((a, r) => a + (r[metric] as number), 0);
}
const totalGmv = sumBy(perf, 'gmv');
const byCampaign = sumBy(perf, 'gmv'); // identity check below
let campaignSum = 0;
for (const c of campaignIds) campaignSum += sumBy(perf.filter((r) => r.campaignId === c), 'gmv');
if (campaignSum !== totalGmv) err(`Сумма GMV по кампаниям (${campaignSum}) != итог (${totalGmv})`);
let channelSum = 0;
const channelTypes = new Set(perf.map((r) => r.salesChannelType));
for (const ch of channelTypes) channelSum += sumBy(perf.filter((r) => r.salesChannelType === ch), 'gmv');
if (channelSum !== totalGmv) err(`Сумма GMV по каналам (${channelSum}) != итог (${totalGmv})`);
let platformSum = 0;
const platforms = new Set(perf.map((r) => r.platform));
for (const pl of platforms) platformSum += sumBy(perf.filter((r) => r.platform === pl), 'gmv');
if (platformSum !== totalGmv) err(`Сумма GMV по площадкам (${platformSum}) != итог (${totalGmv})`);
void byCampaign;

// September channel mix by purchased orders
const sepPurchased = sep.reduce((a, r) => a + r.purchasedOrders, 0);
const chMix: Record<string, number> = {};
for (const r of sep) chMix[r.salesChannelType] = (chMix[r.salesChannelType] ?? 0) + r.purchasedOrders;
const wbShare = (chMix['whatsbetter'] ?? 0) / sepPurchased;
const extShare = (chMix['manufacturer_external'] ?? 0) / sepPurchased;
const ecoShare = (chMix['manufacturer_ecosystem'] ?? 0) / sepPurchased;
const mpShare = (chMix['marketplace'] ?? 0) / sepPurchased;
if (wbShare < 0.35 || wbShare > 0.45) warn(`Whatsbetter share ${(wbShare * 100).toFixed(1)}% вне 35–45%`);
if (extShare < 0.12 || extShare > 0.2) warn(`manufacturer_external share ${(extShare * 100).toFixed(1)}% вне 12–20%`);
if (ecoShare < 0.15 || ecoShare > 0.25) warn(`manufacturer_ecosystem share ${(ecoShare * 100).toFixed(1)}% вне 15–25%`);
if (mpShare < 0.2 || mpShare > 0.3) warn(`marketplaces share ${(mpShare * 100).toFixed(1)}% вне 20–30%`);

// 7. Audience demographics sum ~1.0
for (const s of snapshots) {
  const g = s.demographics.gender.reduce((a: number, x: any) => a + x.share, 0);
  const a = s.demographics.age.reduce((acc: number, x: any) => acc + x.share, 0);
  if (Math.abs(g - 1) > 0.02) err(`snapshot ${s.month}: gender сумма ${g.toFixed(3)} != 1.0`);
  if (Math.abs(a - 1) > 0.02) err(`snapshot ${s.month}: age сумма ${a.toFixed(3)} != 1.0`);
}

// 8. Commissions reconcile with payouts (paid)
const paidCommission = commissions.filter((c) => c.status === 'paid').reduce((a, c) => a + c.amount, 0);
const paidPayouts = payouts.filter((p) => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
if (paidCommission !== paidPayouts) err(`paid-комиссии (${paidCommission}) != paid-выплаты (${paidPayouts})`);

// September earned commission == 380000 (available+pending+estimated+paid)
const sepEarned = commissions
  .filter((c) => c.month === '2026-09' && ['available', 'pending', 'estimated', 'paid'].includes(c.status))
  .reduce((a, c) => a + c.amount, 0);
if (sepEarned !== 380000) err(`Сентябрьская начисленная комиссия (${sepEarned}) != 380000`);

// 9. Order commission ~= amount * rate
for (const o of orders) {
  if (o.status === 'cancelled') continue;
  const expected = Math.round(o.amount * o.commissionRate);
  if (Math.abs(expected - o.commission) > 1) err(`order ${o.id}: commission ${o.commission} != amount*rate (${expected})`);
}

// --- Report ---
console.log('');
console.log('=== Валидация demo-данных WhatsBetter.me Creator ===');
console.log(`performanceDaily строк: ${perf.length}`);
console.log(`Сентябрьский anchor: ${JSON.stringify(sepTotals)}`);
console.log(`Месячные просмотры: ${monthlyViews.join(' → ')}`);
console.log(`Каналы (сент., выкуп): wb ${(wbShare * 100).toFixed(1)}% / ext ${(extShare * 100).toFixed(1)}% / eco ${(ecoShare * 100).toFixed(1)}% / mp ${(mpShare * 100).toFixed(1)}%`);
console.log(`paid-комиссии = выплаты: ${paidCommission} = ${paidPayouts}`);
console.log('');
if (warnings.length) {
  console.log(`Предупреждения (${warnings.length}):`);
  warnings.forEach((w) => console.log('  ! ' + w));
  console.log('');
}
if (errors.length) {
  console.log(`Validation FAILED: ${errors.length} errors`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
} else {
  console.log('Validation passed: 0 errors');
}
