# Whatsbetter Creator Cabinet — план реализации frontend demo

## 1. Цель

Сделать desktop-first demo кабинета блогера, который показывает ценность Whatsbetter как единого слоя:

`контент → аудитория → рейтинг/интерес → покупка → комиссия`.

Кабинет должен отвечать:

1. Сколько аудитории я привел?
2. Что аудитория делала после перехода?
3. Что люди покупали и где?
4. Какой GMV создан?
5. Сколько заработал блогер?
6. Какие публикации и кампании дают лучший результат?
7. Чем еще интересуется аудитория?
8. На какие сферы подписана?
9. Какие критерии выбора для нее важны?
10. Какие новые кампании ей подходят?

Demo не должен конкурировать с VK/YouTube в деталях watch analytics. Его ценность начинается после перехода пользователя в экосистему Whatsbetter.

---

# 2. Рекомендуемый стек

```text
React
TypeScript
Vite
React Router
Zustand — global filters/UI state
Tailwind CSS
Radix UI primitives или собственные primitives
Apache ECharts + echarts-for-react
TanStack Table
date-fns
zod
```

Опционально:

```text
TanStack Query
```

Даже с JSON можно использовать repository abstraction, чтобы позже заменить mock на API.

---

# 3. Архитектура

```text
src/
  app/
    AppShell.tsx
    router.tsx
    providers.tsx

  components/
    ui/
    charts/
    data-display/
    filters/

  features/
    overview/
    content/
    campaigns/
    audience/
    sales/
    earnings/
    opportunities/
    settings/

  analytics/
    metrics/
    selectors/
    formatters/

  data/
    repositories/
      CreatorAnalyticsRepository.ts
      MockCreatorAnalyticsRepository.ts

  mock/
    data/

  pages/
```

---

# 4. Основная навигация

```text
Главная
Контент
Кампании
Аудитория
Продажи
Заработок
Возможности
```

В profile/settings:

```text
Интеграции
Настройки
Помощь
```

---

# 5. Global App Shell

Desktop:

```text
┌──────── Sidebar ────────┬─────────────────────────────────────────┐
│ Whatsbetter Creator     │ Page title      Period        Profile  │
│                         │                                         │
│ Главная                 │ Page content                            │
│ Контент                 │                                         │
│ Кампании                │                                         │
│ Аудитория               │                                         │
│ Продажи                 │                                         │
│ Заработок               │                                         │
│ Возможности             │                                         │
│                         │                                         │
│ [creator mini profile]  │                                         │
└─────────────────────────┴─────────────────────────────────────────┘
```

Global controls:

- period;
- compare with previous period;
- optional campaign filter;
- profile.

---

# 6. Глобальные периоды

```text
7 дней
30 дней
90 дней
6 месяцев
С начала года
Свой период
```

Default: `30 дней`.

Главный period state синхронно меняет все отчеты страницы.

---

# 7. Страница 1 — Главная / Overview

## Задача

За 10 секунд показать:

`масштаб → воронка → деньги → сильные источники`.

## Блок A — KPI cards

6 карточек:

```text
Просмотры
100 000

Переходы
18 400
18,4% CTR

Заказы
1 260

Выкуплено
1 035
82,1%

GMV
3,8 млн ₽

Мой доход
380 000 ₽
```

Каждая:

- current value;
- growth vs previous period;
- optional micro sparkline;
- tooltip с определением.

Данные: `performanceDaily`.

Selector:

```ts
getOverviewKpis(period)
```

## Блок B — Funnel

Этапы:

```text
Просмотры        100 000
Переходы          18 400
Добавили корзину   4 700
Заказы             1 260
Выкуплено          1 035
```

Отдельно:

```text
GMV      3,8 млн ₽
Доход    380 тыс ₽
```

Показывать conversion между соседними стадиями.

Selector:

```ts
getFunnel(period)
```

## Блок C — Динамика

Line chart.

Переключатель:

```text
Просмотры
Переходы
Заказы
GMV
Доход
```

Default: `Доход`.

Опция comparison: предыдущий период.

Selector:

```ts
getPerformanceSeries(period, metric)
```

## Блок D — Где покупают

4 группы:

```text
Whatsbetter
Сайты производителей
Сайты производителей в экосистеме
Маркетплейсы
```

Показывать:

- purchased orders;
- GMV;
- share.

Selector:

```ts
getSalesByChannel(period)
```

## Блок E — Лучшие кампании

Top 4:

```text
Кампания
Просмотры
Выкуплено
GMV
Доход
```

Selector:

```ts
getTopCampaigns(period, 4)
```

## Блок F — Интересы аудитории

Top sphere affinity:

```text
Уход за кожей
Путешествия
Здоровое питание
Одежда
Интерьер
```

## Блок G — Последние начисления

5–7 commission rows.

```text
Товар
Канал
Продажа
Комиссия
Статус
```

---

# 8. Страница 2 — Контент

## Задача

Ответить:

> какой контент не только смотрят, но какой приводит к покупкам.

Header KPIs:

```text
Публикаций
Просмотров
CTR
Выкуплено
GMV
Доход
```

Основной отчет:

| Контент | Площадка | Кампания | Просмотры | CTR | Корзины | Выкуплено | GMV | Доход |
|---|---|---|---:|---:|---:|---:|---:|---:|

Фильтры:

- platform;
- campaign;
- format;
- date;
- search.

Sort:

- views;
- CTR;
- purchased;
- GMV;
- commission.

Sources:

```text
publications
performanceDaily
socialAccounts
campaigns
```

Selector:

```ts
getPublicationPerformance(period, filters)
```

---

# 9. Content Detail

Route:

```text
/content/:publicationId
```

Header:

- thumbnail;
- title;
- platform;
- date;
- campaign;
- external link;
- tracking status.

Reports:

1. KPI row.
2. Funnel.
3. Performance over time.
4. Sales by channel.
5. Top products.
6. Audience interests from this publication.
7. Criteria used by this traffic, если доступны.

Insight допустим, например:

> Конверсия в заказ на 24% выше среднего по вашим публикациям.

Это только factual comparison.

---

# 10. Страница 3 — Кампании

## List

Карточки или table:

```text
Что лучше: кремы для лица
Что лучше: SPF
Парфюмерия
Отели
...
```

Для каждой:

- status;
- dates;
- sphere;
- publications;
- views;
- purchased;
- GMV;
- creator income.

Selector:

```ts
getCampaignSummaries(period)
```

---

# 11. Campaign Detail

Route:

```text
/campaigns/:campaignId
```

Главная demo-кампания:

**Что лучше: кремы для лица**

Header:

```text
10 производителей
20 товаров
4 площадки
6 публикаций
```

Reports:

### A. Funnel

Только данные кампании.

### B. Dynamics

Переключатель:

```text
Views / Clicks / Orders / GMV / Income
```

### C. Platforms

VK / Telegram / YouTube / RUTUBE.

Показывать факты, без общего «победителя».

### D. Products

| Товар | Бренд | Рейтинг | Продажи | GMV | Комиссия |
|---|---|---:|---:|---:|---:|

### E. Где покупали

```text
Whatsbetter
Manufacturer external
Manufacturer ecosystem
Ozon
Wildberries
Яндекс Маркет
```

### F. Важные критерии

Например:

```text
Увлажнение              92
Состав                  87
Для чувствительной кожи 83
Цена/ценность           71
Текстура                 68
```

### G. Производители шоу

10 cards/rows:

- logo;
- product count;
- purchased;
- GMV;
- audience match.

---

# 12. Страница 4 — Аудитория

Это ключевая отличительная страница.

Внутренние tabs:

```text
Обзор
Интересы
Что важно
Товары
```

---

# 13. Audience / Обзор

KPIs:

```text
Известная аудитория
Активные 30 дней
Новые
Вернувшиеся
Покупатели
Оставляли оценки
```

Data:

`audienceSnapshots`.

Report: Audience growth.

Series:

```text
known
active
returning
buyers
```

Basic demographics:

- gender;
- age.

Демографию не делать главным смыслом страницы.

---

# 14. Audience / Интересы

## A. Сферы

Horizontal bars:

```text
Уход за кожей      82%
Путешествия        57%
Здоровое питание   51%
Одежда             47%
Интерьер           31%
Отели              24%
```

Дополнительно:

```text
Affinity ×1.68
```

## B. На что подписана аудитория

Использует агрегаты по `spheres_users`-логике.

Поля:

```text
Sphere
Subscribers from audience
Share
30d growth
```

## C. Growing interests

Top 5 сфер по росту affinity.

## D. Cross-interest

Опциональный heatmap:

```text
Skincare × Travel
Skincare × Fashion
Travel × Hotels
...
```

---

# 15. Audience / Что важно

Dropdown sphere:

```text
[Кремы для лица ▼]
```

Horizontal ranking:

```text
Увлажнение
Состав
Для чувствительной кожи
Текстура
Цена/ценность
...
```

Для каждой строки:

- importance;
- Whatsbetter benchmark;
- delta.

Важно: `importance` — это важность критерия, а не оценка качества продукта.

---

# 16. Audience / Товары

Карточка:

```text
[image]
Aqua Balance Cream
NordSkin

Совпадение 94%

Просмотры
Сохранения
Оценки
Покупки
```

Фильтры:

- sphere;
- purchased only;
- match score;
- trend.

---

# 17. Страница 5 — Продажи

## Задача

Единая аналитика независимо от места покупки.

KPIs:

```text
Заказы
Выкуплено
GMV
Средний чек
Выкуп %
Средняя комиссия
```

## Report A — Sales trend

Line/bar:

```text
GMV
Purchased orders
```

## Report B — Sales channels

```text
Whatsbetter
Сайт производителя
Сайт производителя / ecosystem
Маркетплейс
```

Metrics:

- purchased;
- GMV;
- share;
- AOV.

## Report C — Marketplaces

```text
Ozon
Wildberries
Яндекс Маркет
```

## Report D — Product leaderboard

| Товар | Бренд | Канал | Выкуплено | GMV | AOV | Комиссия |
|---|---|---|---:|---:|---:|---:|

## Report E — Campaign contribution

Campaign → GMV.

## Report F — Recent orders

Source: `commerceOrders`.

Columns:

```text
Order
Date
Product
Source
Amount
Status
Commission
```

---

# 18. Страница 6 — Заработок

Большая верхняя card:

```text
Заработано за период
380 000 ₽
```

Рядом:

```text
Доступно
Ожидает подтверждения
В обработке
Выплачено
```

Reports:

### A. Earnings trend

Commission over time.

### B. Commission status

Segmented bar:

```text
estimated
pending
available
paid
```

### C. Доход по кампаниям

Campaign contribution.

### D. Recent commissions

```text
Date
Campaign
Product
Channel
Order amount
Rate
Commission
Status
```

### E. Payouts

```text
Date
Period
Amount
Status
Method
```

Sources:

`performanceDaily`, `commissions`, `payouts`.

---

# 19. Страница 7 — Возможности

Задача:

> превратить аналитику аудитории в следующий коммерческий шаг.

Cards:

```text
Что лучше: SPF 50
Совпадение с аудиторией 93%
12% с продажи
Ожидаемый AOV 3 900 ₽
```

Категории:

- SPF;
- perfume;
- hotel/travel;
- healthy food;
- home appliance;
- sportswear;
- home/interior.

Фильтры:

- sphere;
- commission;
- start date;
- audience match.

Sort:

- match;
- revenue per 1000 views;
- commission;
- newest.

Прогноз подписывать:

```text
Оценка по вашей прошлой аудитории
```

Не показывать как гарантированный заработок.

---

# 20. Интеграции

Secondary page в Settings.

Social:

```text
VK          Подключено
Telegram    Подключено
YouTube     Подключено
RUTUBE      Подключено
```

Commerce:

```text
Whatsbetter      Активно
Ozon             Данные доступны
Wildberries      Данные доступны
Яндекс Маркет    Данные доступны
```

Для demo кнопки подключения могут быть disabled.

---

# 21. Global filters

Основные:

```text
Period
Campaign
Platform
```

Page-specific:

```text
Sphere
Sales channel
Marketplace
Product
Status
```

Не выводить все одновременно в header.
Редкие фильтры помещать в popover `Фильтры`.

---

# 22. Источники отчетов

| Отчет | Источник |
|---|---|
| Overview KPI | performanceDaily |
| Funnel | performanceDaily |
| Trend | performanceDaily |
| Platform performance | performanceDaily + socialAccounts |
| Campaign performance | campaigns + performanceDaily |
| Publication performance | publications + performanceDaily |
| Sales channel | performanceDaily + marketplaces |
| Recent orders | commerceOrders |
| Earnings | performanceDaily + commissions |
| Payouts | payouts |
| Active audience | audienceSnapshots |
| Sphere interests | sphereAffinities + spheres |
| Sphere subscriptions | sphereSubscriptions + spheres |
| Criterion importance | criterionAffinities + criteria |
| Product interest | entityAffinities + entities |
| Opportunities | opportunities + affinities |

---

# 23. Selector layer

Pages не считают данные вручную.

Пример hook:

```ts
const data = useOverviewAnalytics({
  from,
  to,
  campaignId,
  platform
})
```

Selectors:

```ts
getOverviewKpis()
getFunnel()
getPerformanceSeries()
getPublicationPerformance()
getCampaignSummaries()
getCampaignDetail()
getAudienceSummary()
getSphereAffinities()
getCriteriaImportance()
getSalesByChannel()
getSalesByMarketplace()
getTopProducts()
getEarningsSummary()
getCommissionStatus()
```

---

# 24. Формулы

Файл:

```text
src/analytics/metrics/formulas.ts
```

```ts
safeRate(numerator, denominator)
calcGrowth(current, previous)
calcCtr(clicks, views)
calcCartRate(addToCart, clicks)
calcOrderConversion(orders, clicks)
calcPurchaseRate(purchasedOrders, orders)
calcAov(gmv, purchasedOrders)
calcCommissionRate(commission, gmv)
calcRevenuePer1000(commission, views)
```

---

# 25. Formatters

```text
src/analytics/formatters/
  currency.ts
  percent.ts
  compactNumber.ts
  date.ts
```

Примеры:

```text
3 800 000 → 3,8 млн ₽
380 000   → 380 тыс ₽
100000    → 100 тыс.
0.184     → 18,4%
```

В таблицах можно показывать точнее.

---

# 26. Reusable charts

```text
MetricLineChart
ComparisonLineChart
MiniSparkline
HorizontalBarChart
FunnelChart
StackedChannelBar
AffinityBarChart
HeatmapChart
DonutChart — редко
```

---

# 27. Drilldown

Обязательные переходы:

```text
Overview → Campaign
Overview → Sales
Campaign → Publication
Campaign → Product
Audience Sphere → Criteria
Earnings → Commission
```

Demo должен ощущаться настоящим приложением.

---

# 28. URL state

Фильтры сохранять в URL:

```text
?period=30d
?campaign=campaign_face_cream_2026_09
?platform=vk
```

Плюсы:

- refresh сохраняет состояние;
- можно открыть нужный экран на презентации;
- легко тестировать.

---

# 29. Loading / empty / error

Поддержать состояния:

```text
loading
empty
error
ready
```

Даже при локальном JSON.

Loading: skeleton cards/charts, не centered spinner.

---

# 30. Responsive

Приоритет:

```text
1440–1600 desktop
1280 laptop
1024 tablet landscape
```

Grid:

```text
>=1440   12 columns
1200+    12 compact
768+      6
<768      1
```

Mobile — базово, не в ущерб desktop demo.

---

# 31. Demo interactions

Должны работать:

- period switch;
- compare;
- campaign filter;
- platform filter;
- sorting;
- tabs;
- drilldowns;
- tooltips;
- table search;
- pagination/row limit;
- opportunity filter.

Не оставлять visually-active no-op buttons.

---

# 32. Этапы реализации

## Этап 1 — Foundation

- Vite React TS;
- AppShell;
- routes;
- sidebar;
- tokens;
- mock repository;
- JSON loading;
- period filter;
- formatters;
- validation.

Критерий:

```text
Все routes открываются, backend calls отсутствуют.
```

## Этап 2 — Overview

- KPI;
- funnel;
- trend;
- sales channels;
- top campaigns;
- audience interests;
- commissions.

Критерий:

за September 30d:

```text
100000 views
18400 clicks
4700 carts
1260 orders
1035 purchased
3.8m GMV
380k commission
```

## Этап 3 — Content + Campaigns

- content table;
- content detail;
- campaign list;
- campaign detail;
- platforms;
- product table.

## Этап 4 — Audience Intelligence

- growth;
- interests;
- subscriptions;
- criterion importance;
- product match;
- optional heatmap.

Это главный differentiator demo.

## Этап 5 — Sales + Earnings

- channels;
- marketplaces;
- orders;
- commission statuses;
- payouts.

## Этап 6 — Opportunities

- cards;
- audience match;
- terms;
- filters;
- optional detail.

## Этап 7 — Polish

- skeletons;
- empty states;
- responsive;
- chart transitions;
- keyboard focus;
- screenshot-ready layout.

---

# 33. Acceptance criteria

Demo готов, если:

1. Есть 7 основных страниц.
2. Все цифры идут из JSON через repository/selectors.
3. September funnel согласован.
4. Period меняет все relevant reports.
5. Growth рассчитывается, а не хранится вручную.
6. GMV и commission совпадают между Overview, Sales, Earnings.
7. Audience показывает:
   - interests;
   - subscriptions;
   - criteria importance;
   - product affinity/match.
8. Sales показывает 4 purchase destination types.
9. UI легкий, не похож на ERP/CRM.
10. Mock repository позже можно заменить API implementation без переписывания страниц.
