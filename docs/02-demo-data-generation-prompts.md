# Whatsbetter Creator Cabinet — промты для генерации demo-данных

## 1. Цель

Нужно сгенерировать согласованный JSON-набор для demo-кабинета блогера Whatsbetter.

Ключевое требование: **все страницы должны рассказывать одну и ту же историю роста**, а не показывать случайные независимые цифры.

Anchor последних 30 дней:

```text
100 000 просмотров
→ 18 400 переходов
→ 4 700 добавлений в корзину
→ 1 260 заказов
→ 1 035 выкупленных заказов
→ 3 800 000 ₽ GMV
→ 380 000 ₽ комиссия блогера
```

Период demo:

```text
2026-04-01 .. 2026-09-30
```

---

# 2. Общий системный блок для всех промтов

```text
You generate internally consistent demo JSON data for a creator analytics dashboard
for Whatsbetter, a multi-criteria ranking platform covering many areas of life.

The demo represents one fictional Russian-speaking creator who distributes
"Что лучше" show content across VK, Telegram, YouTube and RUTUBE.

Viewers can open Whatsbetter ratings and later buy:
1) directly on Whatsbetter;
2) on an external manufacturer website;
3) on a manufacturer website that is part of the Whatsbetter ecosystem;
4) on an integrated marketplace.

The dataset is used only in a frontend demo.

IMPORTANT:
- Output valid JSON only.
- No Markdown.
- No commentary.
- Use Russian display labels and English machine-readable IDs/names.
- Currency: RUB.
- Timezone: Europe/Moscow.
- Period: 2026-04-01 through 2026-09-30.
- Default visible period: last 30 days ending 2026-09-30.
- Do not use personal data of real people.
- The creator, manufacturers and products are fictional.
- Do not create independent totals for separate dashboard pages.
- Every aggregate must reconcile with lower-level data.
- Keep a generally positive six-month trend.
- Daily data must contain normal variation, dips, spikes and weekly patterns.
- Do not make every day or every conversion metric improve monotonically.
- Growth must be believable rather than exponential.
```

---

# 3. Целевая динамика

Ориентир:

```text
April
views ~48k
clicks ~7.0k
GMV ~1.15m
commission ~115k

May
views ~57k
clicks ~8.9k
GMV ~1.45m
commission ~145k

June
views ~65k
clicks ~10.6k
GMV ~1.90m
commission ~190k

July
views ~73k
clicks ~12.2k
GMV ~2.25m
commission ~225k

August
views ~84k
clicks ~14.9k
GMV ~2.95m
commission ~295k

September
views = 100000
clicks = 18400
addToCart = 4700
orders = 1260
purchasedOrders = 1035
GMV = 3800000
commission = 380000
```

Сентябрьские totals должны совпадать **точно** после суммирования daily data.

---

# 4. Логика роста

Не все коэффициенты должны улучшаться одновременно.

Желаемое поведение:

```text
views                растут заметно
clicks               растут заметно
CTR                  плавно улучшается
cart rate            почти стабилен
order conversion     плавно улучшается
redemption rate      колеблется около 79–84%
average order value  растет умеренно
commission rate      в среднем около 10%
```

Отдельные кампании могут иметь commission rate 6–14%.

---

# 5. PROMPT 1 — справочники

```text
Create reference JSON for the Whatsbetter creator dashboard demo.

Return one JSON object with:
- creator
- socialAccounts
- spheres
- criteria
- partners
- marketplaces
- entities
- shows
- campaigns
- publications

CREATOR
Create one fictional Russian-speaking beauty/lifestyle creator.
Connect four platforms:
- VK
- Telegram
- YouTube
- RUTUBE
Total followers: around 800k–900k.

SPHERES
Create 12–15 spheres representing different areas of life.
Must include:
- Красота
- Уход за кожей
- Кремы для лица
- Парфюмерия
- Одежда
- Путешествия
- Отели
- Рестораны
- Фитнес
- Здоровое питание
- Товары для дома
- Техника

Use parentId where appropriate.

CRITERIA
Create 35–50 criteria total.
Create at least 10 criteria for "Кремы для лица".

For face creams cover ideas like:
- hydration
- composition
- sensitive-skin suitability
- texture
- absorption
- comfort
- scent
- economy
- packaging
- price/value

Each criterion:
id, name, label, description, code, sphereIds.

PARTNERS
Create 10 fictional manufacturers for the flagship show.
Do not use real brand names.
Some ecosystemMember=true, some false.

MARKETPLACES
Create:
- Whatsbetter
- Ozon
- Wildberries
- Яндекс Маркет

These are demo sales-channel references only.

ENTITIES
Create 20 face cream products distributed among 10 manufacturers.

Each:
- id
- sphereId
- type=product
- name
- label
- brand
- partnerId
- image placeholder
- properties
- rating {score, place, countScores}

SHOW
Create:
- id: show_what_is_better
- label: "Что лучше"

CAMPAIGNS
Create 6–8 campaigns between April and September 2026.

September flagship:
"Что лучше: кремы для лица"

It must contain 10 manufacturers and 20 products.

Other campaigns may include:
- SPF
- perfume
- hotels
- home appliances
- healthy food
- sportswear

PUBLICATIONS
Create 18–24 publications across:
VK, Telegram, YouTube, RUTUBE.

Formats:
video, short_video, post, story, telegram_post.

Every publication must belong to:
creator + socialAccount + campaign.

Use stable readable IDs.
Return JSON only.
```

---

# 6. PROMPT 2 — performanceDaily

Передать JSON из Prompt 1 как input context.

```text
Using the supplied reference JSON, generate performanceDaily.

Period:
2026-04-01 through 2026-09-30.

The data must support aggregation by:
- date
- month
- campaign
- publication
- platform
- sales channel
- marketplace

Each row:
- date
- creatorId
- campaignId
- publicationId
- platform
- salesChannelType
- marketplaceId or null
- partnerId or null

Metrics:
- views
- reach
- engagements
- clicks
- uniqueVisitors
- productViews
- ratingViews
- ratingInteractions
- addToCart
- orders
- purchasedOrders
- gmv
- commission

SEPTEMBER MUST SUM EXACTLY TO:
views = 100000
clicks = 18400
addToCart = 4700
orders = 1260
purchasedOrders = 1035
gmv = 3800000
commission = 380000

Approximate monthly growth:
April: 48k views / 1.15m GMV
May: 57k / 1.45m
June: 65k / 1.90m
July: 73k / 2.25m
August: 84k / 2.95m
September: exactly 100k / 3.8m

Consistency:
- clicks <= views
- uniqueVisitors <= clicks
- productViews <= clicks
- addToCart <= productViews
- orders <= addToCart
- purchasedOrders <= orders
- commission <= gmv
- values are non-negative integers

September sales-channel mix by purchased orders approximately:
- Whatsbetter: 35–45%
- manufacturer_external: 12–20%
- manufacturer_ecosystem: 15–25%
- marketplaces total: 20–30%

Platform behavior:
- YouTube and VK lead in views
- Telegram has lower reach but stronger click conversion
- RUTUBE is smaller but meaningful
- different platforms must have recognizably different conversion profiles

Daily behavior:
- campaign launches create spikes
- include 2–4 weak days per month
- include normal weekday/weekend variation
- do not use the same conversion ratio every day
- no smooth linear growth

Maturity:
- CTR gradually improves over six months
- click-to-order gradually improves
- redemption stays around 79–84% with noise
- AOV grows moderately

Return JSON array only.
```

---

# 7. PROMPT 3 — Audience Intelligence

```text
Using the supplied creator, spheres, criteria, entities and performance data,
generate:

{
  "audienceSnapshots": [...],
  "sphereAffinities": [...],
  "sphereSubscriptions": [...],
  "criterionAffinities": [...],
  "entityAffinities": [...],
  "audienceBehavior": [...]
}

AUDIENCE SNAPSHOTS
Create one month-end snapshot for April–September 2026.

Metrics:
- knownUsers
- active30d
- new30d
- returning30d
- buyers30d
- rated30d
- subscribedToSphere30d
- gender distribution
- age distribution

Growth:
- knownUsers grows each month
- active audience grows
- returning share improves gradually
- buyers grow faster in later months
- demographics change only slightly

September targets:
- knownUsers: 65k–75k
- active30d: 40k–45k
- returning30d: 27k–31k
- buyers30d: 3.5k–4.2k
- rated30d: 11k–14k

SPHERE AFFINITIES
For 12–15 spheres create:
- sphereId
- audienceShare 0..1
- affinityIndex where 100 = Whatsbetter platform average
- trend

Strongest interests:
- skincare
- beauty

Also meaningful:
- travel
- hotels
- healthy food
- fashion
- home
- fitness

Do not make all interests high.
Sphere audienceShare values do NOT need to sum to 1 because interests overlap.

SPHERE SUBSCRIPTIONS
Create:
- sphereId
- subscribersFromAudience
- share
- growth30d

CRITERION AFFINITIES
For face creams create at least 10 criteria with:
- criterionId
- importance 0..100
- audienceAvgScore
- platformAvgImportance
- delta

Expected pattern:
- hydration high
- composition high
- sensitive-skin suitability high
- price/value medium-high
- packaging/design lower

ENTITY AFFINITIES
For at least 10 products:
- entityId
- views
- saves
- ratings
- purchases
- matchScore 0..100

Important:
The globally highest-rated product does not have to have the highest audience match.

AUDIENCE BEHAVIOR
For each month:
- ratingViews
- ratingsCreated
- criteriaUsed
- entitiesCompared
- presetsCreated
- productsSaved

Behavior must grow consistently with audience and traffic.

Do not generate raw personal user records.
Return JSON only.
```

---

# 8. PROMPT 4 — commerce, commissions, payouts

```text
Using the supplied reference and performance data, generate:

{
  "commerceOrders": [...],
  "commissions": [...],
  "payouts": [...]
}

COMMERCE ORDERS
Do not generate every historical order.
Generate 40 recent detailed orders from September for tables.

Each:
- id
- orderNumber
- creatorId
- campaignId
- publicationId
- entityId
- partnerId
- channelType
- marketplaceId or null
- createdAt
- status
- quantity
- amount
- currency
- commissionRate
- commission

Statuses:
created, paid, shipped, delivered, cancelled, returned

The recent sample should reflect September sales-channel mix.

Commission rates:
mostly 8–12%,
allowed 6–14%.

COMMISSIONS
Create commission entries corresponding to recent orders.
Older months may use aggregated commission rows if needed.

Statuses:
estimated, pending, available, paid, reversed

Rules:
- cancelled → no final commission
- returned → commission can be reversed
- delivered → eventually available
- paid commission links to payout

PAYOUTS
Create 6–10 payouts.
Use plausible dates and amounts.
Paid commission totals must reconcile with payouts.

As of 2026-09-30, September earned commission = 380000 RUB,
but not all needs to be available or paid.

Use a plausible September split approximately:
- available 45–60%
- pending 25–35%
- estimated/review 10–20%

Return JSON only.
```

---

# 9. PROMPT 5 — opportunities

```text
Generate opportunities for the same creator.

Create 10–15 available or upcoming opportunities.

Each:
- id
- title
- type
- sphereId
- partnerIds
- commission {type, value}
- audienceMatch
- estimated {revenuePer1000Views, conversionRate, expectedAov}
- startsAt
- endsAt
- image
- status

Use several spheres, not beauty only.

Include examples:
- SPF
- perfume
- hotel/travel
- healthy food
- home appliance
- sportswear
- home/interior

Ranking logic should reflect:
- audience match
- historical performance in adjacent spheres
- expected revenue per 1000 views
- commercial terms

Do not present forecast as guaranteed future revenue.

Top offers:
audienceMatch around 0.82–0.95.

Return JSON only.
```

---

# 10. MASTER PROMPT — если генерировать все одним запросом

```text
Generate a complete internally consistent frontend-only demo dataset for the
Whatsbetter creator analytics cabinet.

Return one JSON object with:
manifest
creator
socialAccounts
spheres
criteria
partners
marketplaces
entities
shows
campaigns
publications
performanceDaily
audienceSnapshots
sphereAffinities
sphereSubscriptions
criterionAffinities
entityAffinities
audienceBehavior
commerceOrders
commissions
payouts
opportunities

Use:
- locale ru-RU
- RUB
- Europe/Moscow
- period 2026-04-01..2026-09-30

Flagship September funnel MUST total exactly:
views 100000
clicks 18400
addToCart 4700
orders 1260
purchasedOrders 1035
gmv 3800000
commission 380000

Growth:
April roughly 48k views / 1.15m GMV
May roughly 57k / 1.45m
June roughly 65k / 1.90m
July roughly 73k / 2.25m
August roughly 84k / 2.95m
September exactly 100k / 3.8m

All dashboard totals must be derivable from lower-level data.

Create realistic:
- weekly variation
- campaign launch spikes
- weak days
- different platform profiles
- different sales-channel profiles
- different campaign economics

Do not make every metric improve at the same rate.
Raw scale should grow faster than mature conversion ratios.

Use readable IDs.
Russian display labels.
English machine names.
No real personal data.
No Markdown.
JSON only.
```

---

# 11. PROMPT проверки JSON

```text
Validate the supplied Whatsbetter creator demo JSON.

Do not rewrite it yet.

Return:
{
  "valid": true|false,
  "errors": [...],
  "warnings": [...],
  "reconciliation": {...}
}

Check:

1. Referential integrity.
Every campaignId, publicationId, sphereId, entityId, partnerId and marketplaceId
must reference an existing object.

2. September totals EXACTLY:
views 100000
clicks 18400
addToCart 4700
orders 1260
purchasedOrders 1035
gmv 3800000
commission 380000

3. Funnel:
clicks <= views
addToCart <= productViews <= clicks
orders <= addToCart
purchasedOrders <= orders

4. Money:
commission <= gmv
order commission ~= order amount * commissionRate

5. Growth:
April→September shows a generally positive trend,
but daily data is not monotonically increasing.

6. Breakdowns:
campaign/platform/channel totals reconcile with creator totals
for the same metric and period.

7. Audience:
gender and age buckets each sum approximately to 1.0.

8. Commissions:
paid commissions reconcile with payouts.

9. No negative metrics.

10. No duplicate IDs.

Return JSON only.
```

---

# 12. PROMPT исправления

```text
Fix the supplied demo JSON using the supplied validation report.

Rules:
- preserve valid IDs
- preserve September anchor totals exactly
- change the minimum amount of data required
- preserve natural daily variation
- preserve realistic six-month growth
- make all cross-report totals reconcile

Return full corrected JSON only.
```

---

# 13. Правила красивых временных рядов

```text
- не делать идеальную прямую;
- 2–3 локальных пика в месяц;
- 2–4 слабых дня;
- после launch spike возможен gradual decay;
- соседние дни должны быть частично коррелированы;
- высокий CTR не всегда означает высокий GMV;
- Telegram может иметь высокий CTR при меньшем reach;
- YouTube может иметь больше views, но холоднее conversion;
- Whatsbetter direct может иметь сильнее purchase conversion;
- GMV зависит и от AOV, а не только от order count.
```

---

# 14. Автоматический validator в репозитории

Создать:

```text
scripts/validate-demo-data.ts
```

Проверять:

```text
references
duplicate IDs
funnel inequalities
monthly sums
September anchor
commission math
audience distributions
payout reconciliation
```

Команда:

```bash
npm run demo:validate
```

Критерий готовности:

```text
Validation passed: 0 errors
```
