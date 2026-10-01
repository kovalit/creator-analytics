import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { useGlobalFilters } from '@/app/filters';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import { PeriodDropdown } from '@/components/filters/FiltersBar';
import { KpiCard } from '@/components/data-display/KpiCard';
import { Funnel } from '@/components/data-display/Funnel';
import { HorizontalBars } from '@/components/data-display/HorizontalBars';
import { PlatformTag } from '@/components/data-display/PlatformTag';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricLineChart } from '@/components/charts/MetricLineChart';
import { IconArrowUpRight, IconChevronRight, IconExternal, IconInfo } from '@/components/ui/icons';
import {
  calcCtr,
  calcAov,
} from '@/analytics/metrics/formulas';
import {
  compactNumber,
  formatDateLong,
  formatMoneyCompact,
  formatPercent,
} from '@/analytics/formatters';
import { FORMAT_LABEL } from '@/analytics/selectors/labels';
import type { MetricKey } from '@/analytics/selectors/perf';

const METRICS: { value: MetricKey; label: string; kind: 'money' | 'number' }[] = [
  { value: 'views', label: 'Просмотры', kind: 'number' },
  { value: 'clicks', label: 'Переходы', kind: 'number' },
  { value: 'gmv', label: 'GMV', kind: 'money' },
  { value: 'commission', label: 'Доход', kind: 'money' },
];

export function ContentDetailPage() {
  const { publicationId = '' } = useParams();
  const { params } = useGlobalFilters();
  const [metric, setMetric] = useState<MetricKey>('gmv');

  const detail = useQuery(
    () => repository.getContentDetail(publicationId, params),
    [publicationId, JSON.stringify(params)],
  );
  const seriesQ = useQuery(
    () => repository.getContentSeries(publicationId, params, metric),
    [publicationId, JSON.stringify(params), metric],
  );

  if (detail.status === 'ready' && !detail.data) {
    return (
      <div className="space-y-5">
        <Breadcrumb title="Публикация" />
        <EmptyState title="Публикация не найдена" description="Проверьте ссылку или вернитесь к списку контента." />
      </div>
    );
  }

  const d = detail.data;
  const pub = d?.publication;
  const t = d?.totals;
  const metricMeta = METRICS.find((m) => m.value === metric)!;

  return (
    <div className="space-y-5">
      <Breadcrumb title={pub?.title ?? 'Публикация'} />

      <PageHeader
        title={pub?.title ?? '—'}
        subtitle={
          pub ? (
            <span className="flex flex-wrap items-center gap-2">
              <PlatformTag platform={pub.platform} />
              <span>{FORMAT_LABEL[pub.format] ?? pub.format}</span>
              <span className="text-text-tertiary">·</span>
              <span>{formatDateLong(pub.publishedAt)}</span>
              {d?.campaignTitle && (
                <>
                  <span className="text-text-tertiary">·</span>
                  <Link to={`/campaigns/${pub.campaignId}`} className="text-primary hover:underline">
                    {d.campaignTitle}
                  </Link>
                </>
              )}
            </span>
          ) : undefined
        }
      >
        <PeriodDropdown />
        {pub && (
          <>
            <Badge tone="success" dot>
              Трекинг активен
            </Badge>
            <Button variant="secondary" icon={<IconExternal width={16} height={16} />} disabled>
              Открыть публикацию
            </Button>
          </>
        )}
      </PageHeader>

      {d?.insight && (
        <div className="flex items-start gap-3 rounded-card border border-primary/20 bg-primary-soft px-4 py-3">
          <IconInfo width={18} height={18} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-[13.5px] text-text-primary">{d.insight}</p>
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
            <KpiCard label="GMV" value={t.gmv} kind="money" sub={`AOV ${formatMoneyCompact(calcAov(t.gmv, t.purchasedOrders))}`} />
            <KpiCard label="Доход" value={t.commission} kind="money" accent />
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-card" />)
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
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
              <MetricLineChart current={seriesQ.data} kind={metricMeta.kind} />
            ) : (
              <div className="skeleton h-[280px] rounded-2xl" />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Где покупали" subtitle="Каналы продаж по этой публикации" />
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

      <Card className="p-5">
        <CardHeader title="Воронка публикации" subtitle="Переходы и конверсии этого контента" />
        <div className="mt-5">
          {d && <Funnel stages={d.funnel} />}
        </div>
      </Card>
    </div>
  );
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] text-text-tertiary">
      <Link to="/content" className="hover:text-text-secondary">
        Контент
      </Link>
      <IconChevronRight width={14} height={14} />
      <span className="truncate text-text-secondary">{title}</span>
      <IconArrowUpRight className="hidden" />
    </div>
  );
}
