# Whatsbetter Creator Cabinet — структура demo-данных

## 1. Цель

Demo-кабинет блогера работает полностью на клиенте: без backend и без отдельной БД. Все данные хранятся в JSON, а страницы строятся через единый слой selectors.

Ключевая бизнес-цепочка:

`контент → переход → интерес → корзина → заказ → выкуп → GMV → комиссия блогера`.

Базовый demo-anchor за последние 30 дней:

`100 000 просмотров → 18 400 переходов → 4 700 добавлений в корзину → 1 260 заказов → 1 035 выкупленных заказов → 3,8 млн ₽ GMV → 380 000 ₽ комиссии`.

## 2. Что уже есть в основной модели Whatsbetter

Из существующей схемы полезно сохранить концепции:

- `users` — пользователи;
- `providers_socials` — связанные соцсети;
- `spheres`, `spheres_users` — сферы и подписки;
- `criteria`, `criteria_spheres` — критерии;
- `entities` — объекты рейтинга, включая товары;
- `scores`, `average_scores` — оценки;
- `marketplaces` — торговые площадки;
- `partners`, `partners_websites` — партнеры и сайты партнеров;
- `prices` — цены по площадкам;
- `orders`, `orders_entities` — заказы и позиции;
- `referrals` — реферальные связи;
- `posts`, `articles` — собственный контент.

Для creator cabinet добавляется demo-слой:

- creator profile;
- connected accounts;
- shows;
- campaigns;
- publications;
- attribution/performance;
- audience intelligence;
- commissions;
- payouts;
- commercial opportunities.

## 3. Принципы JSON-модели

### 3.1. Не хранить отдельные totals для каждой страницы

Плохо:

```json
{
  "overview": {"gmv": 3800000},
  "sales": {"gmv": 3790000},
  "earnings": {"gmv": 3810000}
}
```

Хорошо:

```text
performance-daily.json
        ↓
selectors
        ↓
Overview / Sales / Earnings
```

### 3.2. Нормализованные справочники + факты

Справочники:

- creator;
- socialAccounts;
- spheres;
- criteria;
- entities;
- partners;
- marketplaces;
- shows;
- campaigns;
- publications;
- opportunities.

Факты:

- performanceDaily;
- audienceSnapshots;
- audienceAffinities;
- commerceOrders;
- commissions;
- payouts.

Производные KPI считаются на клиенте.

## 4. Файловая структура

```text
src/
  mock/
    data/
      manifest.json
      creator.json
      social-accounts.json

      spheres.json
      criteria.json
      entities.json
      partners.json
      marketplaces.json

      shows.json
      campaigns.json
      publications.json

      performance-daily.json

      audience-snapshots.json
      audience-affinities.json

      commerce-orders.json
      commissions.json
      payouts.json

      opportunities.json
```

Допустим один `demo-data.json`, но отдельные файлы удобнее для разработки.

## 5. Общие соглашения

### ID

Читаемые строки:

```json
{"id":"campaign_face_cream_2026_09"}
```

### Даты

ISO 8601:

```json
{
  "date":"2026-09-30",
  "createdAt":"2026-09-30T13:20:00+03:00"
}
```

### Деньги

Для demo хранить целые рубли:

```json
{
  "gmv":3800000,
  "commission":380000,
  "currency":"RUB"
}
```

### Проценты

Хранить как decimal:

```json
{"commissionRate":0.10}
```

### Рейтинги

Исходный score Whatsbetter может оставаться `-1..1`.
Аналитические индексы UI (`importance`, `matchScore`) — `0..100`.

## 6. manifest.json

```json
{
  "datasetVersion":1,
  "generatedAt":"2026-10-01T12:00:00+03:00",
  "locale":"ru-RU",
  "currency":"RUB",
  "timezone":"Europe/Moscow",
  "demoPeriod":{"from":"2026-04-01","to":"2026-09-30"},
  "defaultPeriod":"30d",
  "creatorId":"creator_alina"
}
```

## 7. creator.json

```json
{
  "id":"creator_alina",
  "userId":"user_4102",
  "displayName":"Алина Морозова",
  "username":"@alina.beauty",
  "avatar":"/demo/avatars/alina.jpg",
  "categorySphereIds":["sphere_beauty","sphere_skincare","sphere_fashion"],
  "status":"active",
  "verified":true,
  "summary":{
    "connectedAccounts":4,
    "totalFollowers":842000
  }
}
```

## 8. social-accounts.json

```json
[
  {
    "id":"social_vk_1",
    "creatorId":"creator_alina",
    "platform":"vk",
    "label":"VK",
    "handle":"@alina_beauty",
    "connected":true,
    "followers":215000
  },
  {
    "id":"social_telegram_1",
    "creatorId":"creator_alina",
    "platform":"telegram",
    "label":"Telegram",
    "handle":"@alina_beauty",
    "connected":true,
    "followers":127000
  },
  {
    "id":"social_youtube_1",
    "creatorId":"creator_alina",
    "platform":"youtube",
    "label":"YouTube",
    "handle":"@alina_beauty",
    "connected":true,
    "followers":380000
  },
  {
    "id":"social_rutube_1",
    "creatorId":"creator_alina",
    "platform":"rutube",
    "label":"RUTUBE",
    "handle":"alina_beauty",
    "connected":true,
    "followers":120000
  }
]
```

## 9. spheres.json

```json
[
  {
    "id":"sphere_beauty",
    "name":"beauty",
    "label":"Красота",
    "parentId":null
  },
  {
    "id":"sphere_skincare",
    "name":"skincare",
    "label":"Уход за кожей",
    "parentId":"sphere_beauty"
  },
  {
    "id":"sphere_face_cream",
    "name":"face_cream",
    "label":"Кремы для лица",
    "parentId":"sphere_skincare"
  }
]
```

Для demo желательно 12–15 сфер из разных областей жизни.

## 10. criteria.json

```json
[
  {
    "id":"criterion_hydration",
    "name":"hydration",
    "label":"Увлажнение",
    "description":"Насколько хорошо средство поддерживает ощущение увлажненной кожи.",
    "code":"hydr",
    "sphereIds":["sphere_face_cream"]
  }
]
```

Для «Кремов для лица» — минимум 10 критериев.

## 11. entities.json

Универсальные объекты рейтинга; в commerce-сценарии это товары.

```json
[
  {
    "id":"entity_cream_01",
    "sphereId":"sphere_face_cream",
    "type":"product",
    "name":"aqua_balance_cream",
    "label":"Aqua Balance Cream",
    "brand":"NordSkin",
    "partnerId":"partner_nordskin",
    "image":"/demo/products/cream-01.jpg",
    "properties":{
      "volumeMl":50,
      "skinTypes":["normal","dry","sensitive"]
    },
    "rating":{
      "score":0.86,
      "place":1,
      "countScores":5821
    }
  }
]
```

## 12. partners.json

```json
[
  {
    "id":"partner_nordskin",
    "label":"NordSkin",
    "companyName":"ООО НордСкин",
    "logo":"/demo/brands/nordskin.svg",
    "website":"https://nordskin.demo",
    "ecosystemMember":true
  }
]
```

## 13. marketplaces.json

```json
[
  {"id":"marketplace_whatsbetter","name":"whatsbetter","label":"Whatsbetter","channelType":"whatsbetter"},
  {"id":"marketplace_ozon","name":"ozon","label":"Ozon","channelType":"marketplace"},
  {"id":"marketplace_wb","name":"wildberries","label":"Wildberries","channelType":"marketplace"},
  {"id":"marketplace_yandex","name":"yandex_market","label":"Яндекс Маркет","channelType":"marketplace"}
]
```

## 14. shows.json

```json
[
  {
    "id":"show_what_is_better",
    "name":"what_is_better",
    "label":"Что лучше",
    "description":"Производители одной сферы сравнивают продукты по понятным критериям."
  }
]
```

## 15. campaigns.json

```json
[
  {
    "id":"campaign_face_cream_2026_09",
    "showId":"show_what_is_better",
    "creatorId":"creator_alina",
    "sphereId":"sphere_face_cream",
    "title":"Что лучше: кремы для лица",
    "status":"active",
    "startDate":"2026-09-01",
    "endDate":"2026-09-30",
    "heroImage":"/demo/campaigns/face-cream.jpg",
    "partnerIds":["partner_nordskin","partner_lumera"],
    "entityIds":["entity_cream_01","entity_cream_02"],
    "defaultCommissionRate":0.10,
    "attributionWindowDays":30,
    "trackingCode":"alina-facecream-sep26"
  }
]
```

Рекомендуется 6–8 кампаний за период.

## 16. publications.json

```json
[
  {
    "id":"pub_facecream_vk_01",
    "campaignId":"campaign_face_cream_2026_09",
    "creatorId":"creator_alina",
    "socialAccountId":"social_vk_1",
    "platform":"vk",
    "format":"video",
    "title":"Что лучше: 10 кремов для лица",
    "publishedAt":"2026-09-05T18:00:00+03:00",
    "thumbnail":"/demo/content/facecream-vk.jpg",
    "trackingCode":"tt-a1-vk",
    "status":"published"
  }
]
```

Форматы:

`video`, `short_video`, `story`, `post`, `stream`, `article`, `telegram_post`.

## 17. performance-daily.json

Главный источник большинства отчетов.

Одна запись — day × campaign × publication × platform × sales channel.

```json
[
  {
    "date":"2026-09-05",
    "creatorId":"creator_alina",
    "campaignId":"campaign_face_cream_2026_09",
    "publicationId":"pub_facecream_vk_01",
    "platform":"vk",

    "salesChannelType":"marketplace",
    "marketplaceId":"marketplace_ozon",
    "partnerId":"partner_nordskin",

    "views":8200,
    "reach":7100,
    "engagements":830,

    "clicks":1510,
    "uniqueVisitors":1390,
    "productViews":1060,
    "ratingViews":890,
    "ratingInteractions":210,

    "addToCart":370,
    "orders":98,
    "purchasedOrders":81,

    "gmv":296000,
    "commission":29600
  }
]
```

## 18. Основная воронка

За период суммируются:

```text
views
clicks
addToCart
orders
purchasedOrders
gmv
commission
```

Anchor:

```json
{
  "views":100000,
  "clicks":18400,
  "addToCart":4700,
  "orders":1260,
  "purchasedOrders":1035,
  "gmv":3800000,
  "commission":380000
}
```

## 19. Каналы покупки

Обязательные значения:

```text
whatsbetter
manufacturer_external
manufacturer_ecosystem
marketplace
```

Пример:

```json
{
  "salesChannelType":"marketplace",
  "marketplaceId":"marketplace_ozon"
}
```

## 20. commerce-orders.json

Не нужно создавать 1260 подробных заказов. Достаточно 30–50 recent orders.

```json
[
  {
    "id":"order_demo_0001",
    "orderNumber":"WB-260930-001",
    "creatorId":"creator_alina",
    "campaignId":"campaign_face_cream_2026_09",
    "publicationId":"pub_facecream_vk_01",
    "entityId":"entity_cream_01",
    "partnerId":"partner_nordskin",
    "channelType":"marketplace",
    "marketplaceId":"marketplace_ozon",
    "createdAt":"2026-09-30T14:21:00+03:00",
    "status":"delivered",
    "quantity":1,
    "amount":3890,
    "currency":"RUB",
    "commissionRate":0.10,
    "commission":389
  }
]
```

Статусы:

`created`, `paid`, `shipped`, `delivered`, `cancelled`, `returned`.

## 21. commissions.json

Комиссия отдельна от заказа, потому что финансовый статус меняется позже.

```json
[
  {
    "id":"commission_0001",
    "orderId":"order_demo_0001",
    "creatorId":"creator_alina",
    "campaignId":"campaign_face_cream_2026_09",
    "amount":389,
    "currency":"RUB",
    "rate":0.10,
    "status":"available",
    "earnedAt":"2026-09-30T14:21:00+03:00",
    "availableAt":"2026-10-14T00:00:00+03:00",
    "payoutId":null
  }
]
```

Статусы:

`estimated`, `pending`, `available`, `paid`, `reversed`.

## 22. payouts.json

```json
[
  {
    "id":"payout_2026_09_01",
    "creatorId":"creator_alina",
    "period":{"from":"2026-09-01","to":"2026-09-15"},
    "amount":146800,
    "currency":"RUB",
    "status":"paid",
    "paidAt":"2026-09-18T12:00:00+03:00",
    "method":"bank_account"
  }
]
```

## 23. audience-snapshots.json

Только агрегированная аудитория.

```json
[
  {
    "date":"2026-09-30",
    "creatorId":"creator_alina",
    "audience":{
      "knownUsers":68400,
      "active30d":42100,
      "new30d":12700,
      "returning30d":29400,
      "buyers30d":3890,
      "rated30d":12800,
      "subscribedToSphere30d":16700
    },
    "demographics":{
      "gender":[
        {"key":"female","share":0.78},
        {"key":"male","share":0.20},
        {"key":"unknown","share":0.02}
      ],
      "age":[
        {"key":"18-24","share":0.18},
        {"key":"25-34","share":0.42},
        {"key":"35-44","share":0.27},
        {"key":"45+","share":0.13}
      ]
    }
  }
]
```

## 24. audience-affinities.json

### Интерес к сферам

```json
{
  "type":"sphere",
  "creatorId":"creator_alina",
  "period":"2026-09",
  "items":[
    {
      "sphereId":"sphere_skincare",
      "audienceShare":0.82,
      "affinityIndex":168,
      "trend":0.12
    }
  ]
}
```

`affinityIndex = 100` — средний интерес аудитории Whatsbetter.

### Важность критериев

```json
{
  "type":"criterion",
  "creatorId":"creator_alina",
  "sphereId":"sphere_face_cream",
  "period":"2026-09",
  "items":[
    {
      "criterionId":"criterion_hydration",
      "importance":92,
      "audienceAvgScore":0.81,
      "platformAvgImportance":74,
      "delta":18
    }
  ]
}
```

### Интерес к товарам

```json
{
  "type":"entity",
  "creatorId":"creator_alina",
  "sphereId":"sphere_face_cream",
  "period":"2026-09",
  "items":[
    {
      "entityId":"entity_cream_01",
      "views":8410,
      "saves":1510,
      "ratings":930,
      "purchases":220,
      "matchScore":94
    }
  ]
}
```

## 25. Подписки аудитории на сферы

```json
[
  {
    "creatorId":"creator_alina",
    "sphereId":"sphere_skincare",
    "subscribersFromAudience":24600,
    "share":0.584,
    "growth30d":0.082
  }
]
```

## 26. Поведение в рейтинговой системе

```json
{
  "creatorId":"creator_alina",
  "period":"2026-09",
  "behavior":{
    "ratingViews":32800,
    "ratingsCreated":9470,
    "criteriaUsed":18200,
    "entitiesCompared":11600,
    "presetsCreated":1290,
    "productsSaved":7820
  }
}
```

## 27. opportunities.json

```json
[
  {
    "id":"offer_spf_2026_10",
    "title":"Что лучше: SPF 50",
    "type":"campaign",
    "sphereId":"sphere_spf",
    "partnerIds":["partner_01","partner_02"],
    "commission":{"type":"percent","value":0.12},
    "audienceMatch":0.93,
    "estimated":{
      "revenuePer1000Views":4600,
      "conversionRate":0.061
    },
    "startsAt":"2026-10-15",
    "status":"available"
  }
]
```

## 28. Формулы

```text
CTR = clicks / views
Click→Cart = addToCart / clicks
Click→Order = orders / clicks
Order→Purchased = purchasedOrders / orders
View→Purchased = purchasedOrders / views
AOV = GMV / purchasedOrders
Effective Commission Rate = commission / GMV
Revenue per 1000 Views = commission / views * 1000
GMV per 1000 Views = GMV / views * 1000
Growth = (current - previous) / previous
```

Для anchor:

```text
CTR = 18,4%
Click→Cart = 25,54%
Click→Order = 6,85%
Order→Purchased = 82,14%
AOV ≈ 3 671 ₽
Effective Commission Rate = 10%
Revenue / 1000 views = 3 800 ₽
```

## 29. Периоды

```text
7d
30d
90d
6m
ytd
custom
```

Default: `30d`.

Гранулярность:

```text
<=31 days   → day
32–120 days → week
>120 days   → month
```

## 30. Инварианты

```text
clicks <= views
uniqueVisitors <= clicks
productViews <= clicks
addToCart <= productViews
orders <= addToCart
purchasedOrders <= orders
commission <= gmv

sum(publications) = campaign total
sum(campaigns) = creator total
sum(sales channels) = total
paid commissions согласуются с payouts
```

Демографические buckets должны суммироваться примерно в `1.0`.

Интересы по сферам **не обязаны** суммироваться в 100%: пользователь может интересоваться несколькими сферами.

## 31. Рекомендуемый масштаб demo

```text
1 creator
4 social accounts
12–15 spheres
35–50 criteria
30–40 entities/products
10–15 partners
4–5 marketplaces

1 show
6–8 campaigns
18–24 publications

6 months daily performance
6 monthly audience snapshots
12–15 sphere affinities
10+ criterion affinities
10+ entity affinities

30–50 recent detailed orders
30–60 recent commissions
6–10 payouts
10–15 opportunities
```

## 32. Selector layer

```text
src/analytics/selectors/
  period.ts
  overview.ts
  funnel.ts
  content.ts
  campaigns.ts
  audience.ts
  sales.ts
  earnings.ts
  opportunities.ts
```

Примеры:

```ts
getOverviewKpis(data, period)
getFunnel(data, period)
getPerformanceSeries(data, period, metric)
getPerformanceByPlatform(data, period)
getPerformanceByCampaign(data, period)
getSalesByChannel(data, period)
getSalesByMarketplace(data, period)
getTopProducts(data, period)
getAudienceSphereAffinity(data, period)
getAudienceCriteriaImportance(data, sphereId, period)
getEarningsSummary(data, period)
```

## 33. Repository abstraction

UI не должен знать, что источник — JSON.

```ts
interface CreatorAnalyticsRepository {
  getOverview(params): Promise<OverviewData>;
  getContent(params): Promise<ContentData>;
  getCampaign(id): Promise<CampaignData>;
  getAudience(params): Promise<AudienceData>;
  getSales(params): Promise<SalesData>;
  getEarnings(params): Promise<EarningsData>;
}
```

Demo:

```ts
MockCreatorAnalyticsRepository
```

Позже:

```ts
ApiCreatorAnalyticsRepository
```

Так frontend можно будет перевести на backend без переписывания страниц.
