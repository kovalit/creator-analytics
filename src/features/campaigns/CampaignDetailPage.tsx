import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { useGlobalFilters } from '@/app/filters';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import { KpiCard } from '@/components/data-display/KpiCard';
import { Funnel } from '@/components/data-display/Funnel';
import { HorizontalBars } from '@/components/data-display/HorizontalBars';
import { PlatformTag } from '@/components/data-display/PlatformTag';
import { DataTable, type Column } from '@/components/data-display/DataTable';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, type Tone } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricLineChart } from '@/components/charts/MetricLineChart';
import { IconChevronRight } from '@/components/ui/icons';
import {
  calcCtr,
} from '@/analytics/metrics/formulas';
import {
  compactNumber,
  formatMoneyCompact,
  formatPercent,
} from '@/analytics/formatters';
import type { MetricKey } from '@/analytics/selectors/perf';
import type { ProductRow } from '@/analytics/selectors/campaigns';

const METRICS: { value: MetricKey; label: string; kind: 'money' | 'number' }[] = [
  { value: 'views', label: 'Просмотры', kind: 'number' },
  { value: 'clicks', label: 'Переходы', kind: 'number' },
  { value: 'orders', label: 'Заказы', kind: 'number' },
  { value: 'gmv', label: 'GMV', kind: 'money' },
  { value: 'commission', label: 'Доход', kind: 'money' },
];

const STATUS: Record<string, { label: string; tone: Tone }> = {
  active: { label: 'Активна', tone: 'success' },
  completed: { label: 'Завершена', tone: 'neutral' },
  draft: { label: 'Черновик', tone: 'warning' },
};

export function CampaignDetailPage() {
  const { campaignId = '' } = useParams();
  const { params } = useGlobalFilters();
  const [metric, setMetric] = useState<MetricKey>('gmv');

  const detail = useQuery(
    () => repository.getCampaignDetail(campaignId, params),
    [campaignId, JSON.stringify(params)],
  );
  const seriesQ = useQuery(
    () => repository.getCampaignSeries(campaignId, metric),
    [campaignId, metric],
  );

  if (detail.status === 'ready' && !detail.data) {
    return (
      <div className="space-y-5">
        <Breadcrumb title="Кампания" />
        <EmptyState title="Кампания не найдена" description="Проверьте ссылку или вернитесь к списку кампаний." />
      </div>
    );
  }

  const d = detail.data;
  const t = d?.totals;
  const status = d ? (STATUS[d.campaign.status] ?? STATUS.completed) : STATUS.completed;
  const metricMeta = METRICS.find((m) => m.value === metric)!;

  return (
    <div className="space-y-5">
      <Breadcrumb title={d?.campaign.title ?? 'Кампания'} />

      <PageHeader title={d?.campaign.title ?? '—'} subtitle={d?.sphereLabel}>
        {d && (
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        )}
      </PageHeader>

      {/* Header chips */}
      {d && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <HeaderChip value={d.header.partners} label="производителей" />
          <HeaderChip value={d.header.products} label="товаров" />
          <HeaderChip value={d.header.marketplaces} label="площадки" />
          <HeaderChip value={d.header.publications} label="публикаций" />
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {t ? (
          <>
            <KpiCard label="Просмотры" value={t.views} kind="number" />
            <KpiCard label="Переходы" value={t.clicks} kind="number" sub={`CTR ${formatPercent(calcCtr(t.clicks, t.views))}`} />
            <KpiCard label="В корзину" value={t.addToCart} kind="number" />
            <KpiCard label="Выкуплено" value={t.purchasedOrders} kind="number" />
            <KpiCard label="GMV" value={t.gmv} kind="money" />
            <KpiCard label="Доход" value={t.commission} kind="money" accent />
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-card" />)
        )}
      </div>

      {/* Funnel + dynamics */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Воронка кампании" />
          <div className="mt-5">{d && <Funnel stages={d.funnel} />}</div>
        </Card>
        <Card className="p-5">
          <CardHeader
            title="Динамика"
            action={
              <SegmentedControl
                value={metric}
                onChange={setMetric}
                size="sm"
                segments={METRICS.map((m) => ({ value: m.value, label: m.label }))}
              />
            }
          />
          <div className="mt-4">
            {seriesQ.data ? (
              <MetricLineChart current={seriesQ.data} kind={metricMeta.kind} height={248} />
            ) : (
              <div className="skeleton h-[248px] rounded-2xl" />
            )}
          </div>
        </Card>
      </div>

      {/* Platforms + channels */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Площадки" subtitle="Факты по каждой площадке без общего «победителя»" />
          <div className="mt-4 space-y-2.5">
            {d?.platforms.map((p) => (
              <div key={p.platform} className="flex items-center gap-3 rounded-xl bg-surface-soft px-3 py-2.5">
                <PlatformTag platform={p.platform} />
                <div className="ml-auto grid grid-cols-3 gap-4 text-right">
                  <MiniStat label="Просм." value={compactNumber(p.views)} />
                  <MiniStat label="CTR" value={formatPercent(p.ctr)} />
                  <MiniStat label="GMV" value={formatMoneyCompact(p.gmv)} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <CardHeader title="Где покупали" subtitle="Каналы продаж" />
          <div className="mt-5">
            {d && (
              <HorizontalBars
                items={d.channels.map((c) => ({
                  key: c.key,
                  label: c.label,
                  value: c.share,
                  display: formatPercent(c.share),
                  caption: `${compactNumber(c.purchasedOrders)} выкуплено · ${formatMoneyCompact(c.gmv)}`,
                }))}
                max={Math.max(...(d.channels.map((c) => c.share) ?? [0.01]), 0.01)}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Products */}
      {d && d.products.length > 0 && (
        <Card className="p-5">
          <CardHeader title="Товары" subtitle="Рейтинг и продажи по товарам кампании" />
          <div className="mt-3">
            <ProductsTable products={d.products} />
          </div>
        </Card>
      )}

      {/* Criteria + partners */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {d && d.criteria.length > 0 && (
          <Card className="p-5">
            <CardHeader title="Важные критерии" subtitle="Важность для аудитории vs среднее Whatsbetter" />
            <div className="mt-5">
              <HorizontalBars
                showBenchmark
                items={d.criteria.map((c) => ({
                  key: c.id,
                  label: c.label,
                  value: c.importance,
                  display: String(c.importance),
                  benchmark: c.benchmark / 100,
                  caption: `среднее Whatsbetter ${c.benchmark}`,
                }))}
                max={100}
              />
            </div>
          </Card>
        )}

        {d && d.partners.length > 0 && (
          <Card className="p-5">
            <CardHeader title="Производители шоу" subtitle="Вклад и совпадение с аудиторией" />
            <div className="mt-3 max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
              {d.partners.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-soft">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-[13px] font-bold text-primary">
                    {p.label.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-text-primary">{p.label}</div>
                    <div className="text-[12px] text-text-tertiary">
                      {p.products} товаров · {compactNumber(p.purchasedOrders)} выкуплено
                    </div>
                  </div>
                  <div className="text-right text-[13.5px] font-semibold text-text-primary tnum">
                    {formatMoneyCompact(p.gmv)}
                  </div>
                  {p.audienceMatch > 0 && (
                    <ProgressRing value={p.audienceMatch} size={40} stroke={4} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProductsTable({ products }: { products: ProductRow[] }) {
  const columns: Column<ProductRow>[] = [
    {
      key: 'label',
      header: 'Товар',
      render: (r) => (
        <div>
          <div className="text-[13.5px] font-medium text-text-primary">{r.label}</div>
          <div className="text-[12px] text-text-tertiary">{r.brand}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Рейтинг',
      align: 'right',
      sortValue: (r) => r.ratingScore,
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="rounded-md bg-surface-soft px-1.5 py-0.5 text-[11.5px] text-text-tertiary">
            #{r.ratingPlace}
          </span>
          <span className="font-medium tnum">{r.ratingScore.toFixed(2)}</span>
        </span>
      ),
    },
    { key: 'purchased', header: 'Выкуплено', align: 'right', sortValue: (r) => r.purchasedOrders, render: (r) => compactNumber(r.purchasedOrders) },
    { key: 'gmv', header: 'GMV', align: 'right', sortValue: (r) => r.gmv, render: (r) => <span className="font-medium">{formatMoneyCompact(r.gmv)}</span> },
    { key: 'commission', header: 'Комиссия', align: 'right', sortValue: (r) => r.commission, render: (r) => <span className="font-semibold text-success">{formatMoneyCompact(r.commission)}</span> },
    {
      key: 'match',
      header: 'Совпадение',
      align: 'right',
      sortValue: (r) => r.matchScore,
      render: (r) => <span className="font-medium text-primary tnum">{r.matchScore}%</span>,
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={products}
      rowKey={(r) => r.entityId}
      initialSort={{ key: 'gmv', dir: 'desc' }}
      pageSize={10}
    />
  );
}

function HeaderChip({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3">
      <div className="text-[22px] font-bold text-text-primary tnum">{value}</div>
      <div className="text-[12.5px] text-text-secondary">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-text-tertiary">{label}</div>
      <div className="text-[13px] font-semibold text-text-primary tnum">{value}</div>
    </div>
  );
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] text-text-tertiary">
      <Link to="/campaigns" className="hover:text-text-secondary">
        Кампании
      </Link>
      <IconChevronRight width={14} height={14} />
      <span className="truncate text-text-secondary">{title}</span>
    </div>
  );
}
