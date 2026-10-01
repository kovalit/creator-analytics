# WhatsBetter.me Creator — demo-кабинет блогера

Демонстрационный кабинет креатора с аналитикой для платформы многокритериального
рейтинга **WhatsBetter.me**. Полностью клиентское приложение: без backend, все
данные берутся из согласованного JSON-набора и считаются на клиенте через слой
selectors.

Ключевая бизнес-цепочка:

```
контент → переход → интерес → корзина → заказ → выкуп → GMV → комиссия блогера
```

## Стек

- React 18 + TypeScript + Vite
- React Router (состояние фильтров хранится в URL)
- Tailwind CSS (дизайн-токены из `docs/04-design-requirements.md`)
- Apache ECharts (`echarts-for-react`)
- date-fns
- Zustand в зависимостях (для будущего UI-state)

## Запуск

```bash
npm install
npm run dev          # дев-сервер
npm run build        # production-сборка (tsc + vite)
npm run preview      # предпросмотр сборки
```

## Demo-данные

```bash
npm run demo:generate   # детерминированно генерирует src/mock/data/*.json
npm run demo:validate   # проверяет инварианты и сверяет сентябрьский anchor
```

Сентябрьский anchor (последние 30 дней) **точно** сходится после суммирования
daily-данных:

```
100 000 просмотров → 18 400 переходов → 4 700 в корзину →
1 260 заказов → 1 035 выкуплено → 3 800 000 ₽ GMV → 380 000 ₽ комиссии
```

Генератор (`scripts/generate-demo-data.ts`) распределяет месячные цели по
дням / публикациям / каналам методом наибольшего остатка и чинит воронку так,
чтобы выполнялись инварианты (`clicks ≤ views`, `purchasedOrders ≤ orders`,
`commission ≤ gmv` и т.д.). Валидатор (`scripts/validate-demo-data.ts`)
проверяет ссылочную целостность, anchor, сверку разбивок (кампании / площадки /
каналы = итог), демографию и сверку выплат с комиссиями.

## Архитектура

```
src/
  app/            AppShell, роутер, навигация, фильтры (URL), useQuery
  analytics/
    metrics/      формулы (CTR, AOV, рост, …)
    formatters/   валюта, проценты, компактные числа, даты (ru-RU)
    selectors/    period + perf + по странице (overview, content, …)
  components/
    ui/           Card, Dropdown, Badge, Button, Skeleton, …
    charts/       ECharts-обёртки (line, donut, heatmap, …)
    data-display/ KpiCard, Funnel, HorizontalBars, DataTable, …
    filters/      PageHeader, фильтры периода/кампании/площадки
  data/
    types.ts
    dataset.ts                загрузка JSON
    repositories/             CreatorAnalyticsRepository (интерфейс) + Mock
  features/       страницы: overview, content, campaigns, audience,
                  sales, earnings, opportunities, settings
  mock/data/      сгенерированный demo-набор
```

### Repository abstraction

UI зависит только от интерфейса `CreatorAnalyticsRepository`. Сейчас данные
отдаёт `MockCreatorAnalyticsRepository` (локальный JSON); позже его можно
заменить на `ApiCreatorAnalyticsRepository` без переписывания страниц.

## Страницы

Главная · Контент (+деталь) · Кампании (+деталь) · Аудитория (Обзор / Интересы /
Что важно / Товары) · Продажи · Заработок · Возможности · Интеграции · Настройки.

Демо-взаимодействия работают: переключение периода, сравнение с прошлым периодом,
фильтры кампании/площадки/формата, поиск и сортировка таблиц, вкладки,
drilldown’ы, тултипы, состояния загрузки (skeleton).
