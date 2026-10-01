import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { useGlobalFilters } from '@/app/filters';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import { PeriodDropdown } from '@/components/filters/FiltersBar';
import { KpiCard } from '@/components/data-display/KpiCard';
import { HorizontalBars, LegendRow } from '@/components/data-display/HorizontalBars';
import { DataTable, type Column } from '@/components/data-display/DataTable';
import { Card, CardHeader } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { GrowthBadge } from '@/components/ui/GrowthBadge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { KpiCardSkeleton } from '@/components/ui/Skeleton';
import { AudienceGrowthChart } from '@/components/charts/AudienceGrowthChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { HeatmapChart } from '@/components/charts/HeatmapChart';
import {
  compactNumber,
  formatAffinity,
  formatPercent,
} from '@/analytics/formatters';
import type { SubscriptionRow } from '@/analytics/selectors/audience';
import { dataset } from '@/data/dataset';
import { IconAudience } from '@/components/ui/icons';

type Tab = 'overview' | 'interests' | 'criteria' | 'products';

const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Обзор' },
  { value: 'interests', label: 'Интересы' },
  { value: 'criteria', label: 'Что важно' },
  { value: 'products', label: 'Товары' },
];

const AGE_COLORS = ['#356DF3', '#5b85f5', '#7357E8', '#9aa1ac'];

export function AudiencePage() {
  const [sp, setSp] = useSearchParams();
  const tabParam = (sp.get('tab') as Tab) ?? 'overview';
  const tab = TABS.some((t) => t.value === tabParam) ? tabParam : 'overview';

  const setTab = (t: Tab) =>
    setSp(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', t);
        return next;
      },
      { replace: true },
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Аудитория"
        subtitle="Кто моя аудитория, чем интересуется и что для неё важно"
      >
        <PeriodDropdown />
      </PageHeader>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={
              'relative whitespace-nowrap px-4 py-2.5 text-[14px] font-medium transition-colors ' +
              (tab === t.value
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary')
            }
          >
            {t.label}
            {tab === t.value && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'interests' && <InterestsTab />}
      {tab === 'criteria' && <CriteriaTab />}
      {tab === 'products' && <ProductsTab />}
    </div>
  );
}

function OverviewTab() {
  const { params } = useGlobalFilters();
  const q = useQuery(() => repository.getAudienceOverview(params), [JSON.stringify(params)]);
  const d = q.data;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {!d
          ? Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)
          : d.kpis.map((k) => (
              <KpiCard key={k.key} label={k.label} value={k.value} kind="number" growth={k.growth} />
            ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <CardHeader title="Рост аудитории" subtitle="Известная, активная, вернувшаяся, покупатели" />
          <div className="mt-4">
            {d ? (
              <AudienceGrowthChart
                months={d.growthSeries.months}
                series={[
                  { name: 'Известная', data: d.growthSeries.known, color: '#356DF3', area: true },
                  { name: 'Активные', data: d.growthSeries.active, color: '#7357E8' },
                  { name: 'Вернувшиеся', data: d.growthSeries.returning, color: '#1F9D70' },
                  { name: 'Покупатели', data: d.growthSeries.buyers, color: '#D79527' },
                ]}
              />
            ) : (
              <div className="skeleton h-[280px] rounded-2xl" />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Демография" subtitle="Пол и возраст" />
          {d && (
            <div className="mt-2">
              <DonutChart
                height={180}
                data={d.gender.map((g, i) => ({
                  name: g.label,
                  value: Math.round(g.share * 1000),
                  color: ['#356DF3', '#7357E8', '#D7DCE4'][i] ?? '#9aa1ac',
                }))}
                centerValue={formatPercent(d.gender[0]?.share ?? 0)}
                centerLabel={d.gender[0]?.label}
              />
              <div className="mt-2 space-y-1">
                {d.gender.map((g, i) => (
                  <LegendRow
                    key={g.key}
                    color={['#356DF3', '#7357E8', '#D7DCE4'][i] ?? '#9aa1ac'}
                    label={g.label}
                    value={formatPercent(g.share)}
                  />
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <HorizontalBars
                  items={d.age.map((a, i) => ({
                    key: a.key,
                    label: a.key,
                    value: a.share,
                    display: formatPercent(a.share),
                    color: AGE_COLORS[i] ?? '#9aa1ac',
                  }))}
                  max={Math.max(...d.age.map((a) => a.share), 0.01)}
                />
              </div>
            </div>
          )}
        </Card>
      </div>

      {d?.behavior && (
        <Card className="p-5">
          <CardHeader title="Поведение в рейтинговой системе" subtitle="Активность аудитории с рейтингами и критериями" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <BehaviorStat label="Просмотры рейтингов" value={d.behavior.ratingViews} />
            <BehaviorStat label="Создано оценок" value={d.behavior.ratingsCreated} />
            <BehaviorStat label="Использовано критериев" value={d.behavior.criteriaUsed} />
            <BehaviorStat label="Сравнений товаров" value={d.behavior.entitiesCompared} />
            <BehaviorStat label="Создано подборок" value={d.behavior.presetsCreated} />
            <BehaviorStat label="Сохранено товаров" value={d.behavior.productsSaved} />
          </div>
        </Card>
      )}
    </div>
  );
}

function BehaviorStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-soft px-3 py-3">
      <div className="text-[20px] font-bold text-text-primary tnum">{compactNumber(value)}</div>
      <div className="mt-0.5 text-[12px] leading-snug text-text-secondary">{label}</div>
    </div>
  );
}

function InterestsTab() {
  const interests = useQuery(() => repository.getSphereInterests(), []);
  const growing = useQuery(() => repository.getGrowingInterests(), []);
  const subs = useQuery(() => repository.getSphereSubscriptions(), []);

  const heatmap = useMemo(() => {
    const top = (interests.data ?? []).slice(0, 6);
    const labels = top.map((t) => t.label);
    const matrix = top.map((row, y) =>
      top.map((col, x) => {
        if (x === y) return 100;
        const base = Math.min(row.audienceShare, col.audienceShare) /
          Math.max(row.audienceShare, col.audienceShare);
        const blend = (row.affinityIndex + col.affinityIndex) / 2 / 170;
        return Math.round(base * blend * 100);
      }),
    );
    return { labels, matrix };
  }, [interests.data]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <CardHeader title="Сферы интересов" subtitle="Доля аудитории и affinity к среднему Whatsbetter" />
          <div className="mt-5">
            {interests.data && (
              <HorizontalBars
                items={interests.data.map((s) => ({
                  key: s.sphereId,
                  label: s.label,
                  value: s.audienceShare,
                  display: formatPercent(s.audienceShare),
                  caption: `Affinity ${formatAffinity(s.affinityIndex)}`,
                }))}
                max={1}
              />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Растущие интересы" subtitle="Топ сфер по росту affinity" />
          <div className="mt-4 space-y-3">
            {growing.data?.map((g) => (
              <div key={g.sphereId} className="flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2.5">
                <div>
                  <div className="text-[13.5px] font-medium text-text-primary">{g.label}</div>
                  <div className="text-[12px] text-text-tertiary">
                    Доля {formatPercent(g.audienceShare)}
                  </div>
                </div>
                <GrowthBadge value={g.trend} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader title="Подписки на сферы" subtitle="Сколько аудитории подписано на сферы Whatsbetter" />
        <div className="mt-3">
          {subs.data && <SubscriptionsTable rows={subs.data} />}
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Пересечение интересов" subtitle="Индекс совместного интереса между сферами" />
        <div className="mt-3">
          {interests.data && interests.data.length >= 2 && (
            <HeatmapChart labels={heatmap.labels} matrix={heatmap.matrix} />
          )}
        </div>
      </Card>
    </div>
  );
}

function SubscriptionsTable({ rows }: { rows: SubscriptionRow[] }) {
  const columns: Column<SubscriptionRow>[] = [
    { key: 'label', header: 'Сфера', render: (r) => <span className="font-medium text-text-primary">{r.label}</span> },
    { key: 'subs', header: 'Подписчиков из аудитории', align: 'right', sortValue: (r) => r.subscribersFromAudience, render: (r) => compactNumber(r.subscribersFromAudience) },
    { key: 'share', header: 'Доля', align: 'right', sortValue: (r) => r.share, render: (r) => formatPercent(r.share) },
    { key: 'growth', header: 'Рост 30 дней', align: 'right', sortValue: (r) => r.growth30d, render: (r) => <GrowthBadge value={r.growth30d} compact /> },
  ];
  return (
    <DataTable columns={columns} rows={rows} rowKey={(r) => r.sphereId} initialSort={{ key: 'subs', dir: 'desc' }} />
  );
}

function CriteriaTab() {
  const spheres = useQuery(() => repository.getSpheresWithCriteria(), []);
  const [sphereId, setSphereId] = useState<string>('sphere_face_cream');
  const crit = useQuery(() => repository.getCriteriaImportance(sphereId), [sphereId]);

  const options = (spheres.data ?? []).map((s) => ({ value: s.id, label: s.label }));

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Важность критериев</h3>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              Насколько критерий важен аудитории при выборе — это важность, а не оценка качества товара
            </p>
          </div>
          {options.length > 0 && (
            <Dropdown value={sphereId} options={options} onChange={setSphereId} minWidth={220} />
          )}
        </div>
        <div className="mt-6">
          {crit.data && crit.data.length > 0 ? (
            <HorizontalBars
              showBenchmark
              items={crit.data.map((c) => ({
                key: c.id,
                label: c.label,
                value: c.importance,
                display: String(c.importance),
                benchmark: c.benchmark / 100,
                caption: (
                  <span>
                    среднее Whatsbetter {c.benchmark} ·{' '}
                    <span className={c.delta >= 0 ? 'text-success' : 'text-danger'}>
                      {c.delta >= 0 ? '+' : ''}
                      {c.delta}
                    </span>
                  </span>
                ),
              }))}
              max={100}
            />
          ) : (
            <EmptyState
              title="Нет данных по критериям"
              description="Выберите другую сферу, чтобы увидеть важные для аудитории критерии."
            />
          )}
        </div>
      </Card>
    </div>
  );
}

function ProductsTab() {
  const q = useQuery(() => repository.getProductMatches(), []);
  const [purchasedOnly, setPurchasedOnly] = useState<'all' | 'purchased'>('all');
  const [sort, setSort] = useState<'match' | 'purchases'>('match');

  const rows = useMemo(() => {
    let r = q.data ?? [];
    if (purchasedOnly === 'purchased') r = r.filter((x) => x.purchases > 0);
    r = [...r].sort((a, b) => (sort === 'match' ? b.matchScore - a.matchScore : b.purchases - a.purchases));
    return r;
  }, [q.data, purchasedOnly, sort]);

  const sphereLabel = dataset.spheres.find((s) => s.id === 'sphere_face_cream')?.label ?? '';

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Товары под аудиторию</h3>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              Сфера: {sphereLabel}. Совпадение — это соответствие товара интересам вашей аудитории
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <SegmentedControl
              value={purchasedOnly}
              onChange={setPurchasedOnly}
              size="sm"
              segments={[
                { value: 'all', label: 'Все' },
                { value: 'purchased', label: 'С покупками' },
              ]}
            />
            <Dropdown
              value={sort}
              options={[
                { value: 'match', label: 'По совпадению' },
                { value: 'purchases', label: 'По покупкам' },
              ]}
              onChange={(v) => setSort(v as 'match' | 'purchases')}
              minWidth={180}
              size="sm"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((p) => (
          <Card key={p.entityId} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <IconAudience width={22} height={22} />
              </div>
              <ProgressRing value={p.matchScore / 100} size={52} stroke={5} />
            </div>
            <div className="mt-3">
              <div className="text-[14px] font-semibold text-text-primary">{p.label}</div>
              <div className="text-[12.5px] text-text-tertiary">{p.brand}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-[12.5px]">
              <Metric label="Просмотры" value={compactNumber(p.views)} />
              <Metric label="Сохранения" value={compactNumber(p.saves)} />
              <Metric label="Оценки" value={compactNumber(p.ratings)} />
              <Metric label="Покупки" value={compactNumber(p.purchases)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-tertiary">{label}</span>
      <span className="font-semibold text-text-primary tnum">{value}</span>
    </div>
  );
}
