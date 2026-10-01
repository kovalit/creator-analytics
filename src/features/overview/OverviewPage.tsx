import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { useGlobalFilters } from '@/app/filters';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import { CompareToggle, PeriodDropdown } from '@/components/filters/FiltersBar';
import { KpiCard } from '@/components/data-display/KpiCard';
import { Funnel } from '@/components/data-display/Funnel';
import { HorizontalBars } from '@/components/data-display/HorizontalBars';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { KpiCardSkeleton } from '@/components/ui/Skeleton';
import { MetricLineChart } from '@/components/charts/MetricLineChart';
import {
  compactNumber,
  formatAffinity,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from '@/analytics/formatters';
import type { MetricKey } from '@/analytics/selectors/perf';
import {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_TONE,
} from '@/analytics/selectors/labels';
import { IconArrowUpRight } from '@/components/ui/icons';

const TREND_METRICS: { value: MetricKey; label: string; kind: 'money' | 'number' }[] = [
  { value: 'commission', label: 'Доход', kind: 'money' },
  { value: 'gmv', label: 'GMV', kind: 'money' },
  { value: 'views', label: 'Просмотры', kind: 'number' },
  { value: 'clicks', label: 'Переходы', kind: 'number' },
  { value: 'orders', label: 'Заказы', kind: 'number' },
];

export function OverviewPage() {
  const { params } = useGlobalFilters();
  const navigate = useNavigate();
  const [metric, setMetric] = useState<MetricKey>('commission');

  const overview = useQuery(() => repository.getOverview(params), [JSON.stringify(params)]);
  const seriesQ = useQuery(
    () => repository.getPerformanceSeries(params, metric),
    [JSON.stringify(params), metric],
  );

  const metricMeta = TREND_METRICS.find((m) => m.value === metric)!;
  const data = overview.data;

  return (
    <div className="space-y-5">
      <PageHeader title="Главная" subtitle="Аудитория, продажи и доход за период">
        <PeriodDropdown />
        <CompareToggle />
      </PageHeader>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {overview.status === 'loading' || !data
          ? Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)
          : data.kpis.map((k) => (
              <KpiCard
                key={k.key}
                label={k.label}
                value={k.value}
                kind={k.kind}
                growth={k.growth}
                sub={k.sub}
                tooltip={k.tooltip}
                accent={k.key === 'commission'}
              />
            ))}
      </div>

      {/* Funnel */}
      <Card className="p-5">
        <CardHeader
          title="Путь аудитории"
          subtitle="От просмотра публикации до выкупленного заказа"
        />
        <div className="mt-5">
          {data ? (
            <Funnel
              stages={data.funnel.stages}
              gmv={data.funnel.gmv}
              commission={data.funnel.commission}
            />
          ) : (
            <div className="skeleton h-40 w-full rounded-2xl" />
          )}
        </div>
      </Card>

      {/* Trend + channels */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <CardHeader
            title="Динамика"
            subtitle="Главная метрика по периоду"
            action={
              <SegmentedControl
                value={metric}
                onChange={(v) => setMetric(v)}
                size="sm"
                segments={TREND_METRICS.map((m) => ({ value: m.value, label: m.label }))}
              />
            }
          />
          <div className="mt-4">
            {seriesQ.status === 'loading' || !seriesQ.data ? (
              <div className="skeleton h-[280px] w-full rounded-2xl" />
            ) : (
              <MetricLineChart
                current={seriesQ.data.current}
                previous={seriesQ.data.previous}
                kind={metricMeta.kind}
              />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Где покупают" subtitle="Выкупленные заказы по каналам" />
          <div className="mt-5">
            {data ? (
              <HorizontalBars
                items={data.channels.map((c) => ({
                  key: c.key,
                  label: c.label,
                  value: c.share,
                  display: formatPercent(c.share),
                  color: c.color,
                  caption: (
                    <span className="tnum">
                      {compactNumber(c.purchasedOrders)} выкуплено · {formatMoneyCompact(c.gmv)}
                    </span>
                  ),
                }))}
                max={Math.max(...data.channels.map((c) => c.share), 0.01)}
              />
            ) : (
              <div className="skeleton h-40 w-full rounded-2xl" />
            )}
          </div>
        </Card>
      </div>

      {/* Top campaigns + audience interests */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <CardHeader
            title="Лучшие кампании"
            subtitle="По вкладу в GMV"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/campaigns')}>
                Все кампании
              </Button>
            }
          />
          <div className="mt-3 divide-y divide-border">
            {data?.topCampaigns.map((c) => (
              <Link
                key={c.id}
                to={`/campaigns/${c.id}`}
                className="group flex items-center gap-3 py-3 transition-colors hover:bg-surface-soft/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-text-primary">
                    {c.title}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-text-tertiary">
                    {c.sphereLabel} · {compactNumber(c.views)} просмотров
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-semibold text-text-primary tnum">
                    {formatMoneyCompact(c.gmv)}
                  </div>
                  <div className="text-[12.5px] text-success tnum">
                    {formatMoneyCompact(c.commission)} доход
                  </div>
                </div>
                <IconArrowUpRight
                  width={16}
                  height={16}
                  className="text-text-tertiary transition-colors group-hover:text-primary"
                />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader
            title="Интересы аудитории"
            subtitle="Топ сфер по охвату"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/audience?tab=interests')}>
                Подробнее
              </Button>
            }
          />
          <div className="mt-5">
            {data && (
              <HorizontalBars
                items={data.sphereAffinities.map((s) => ({
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
      </div>

      {/* Recent commissions */}
      <Card className="p-5">
        <CardHeader
          title="Последние начисления"
          subtitle="Свежие комиссии по заказам"
          action={
            <Button size="sm" variant="ghost" onClick={() => navigate('/earnings')}>
              К заработку
            </Button>
          }
        />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-text-tertiary">
                <th className="py-2.5 pr-3 font-medium">Товар</th>
                <th className="px-3 py-2.5 font-medium">Канал</th>
                <th className="px-3 py-2.5 text-right font-medium">Продажа</th>
                <th className="px-3 py-2.5 text-right font-medium">Комиссия</th>
                <th className="py-2.5 pl-3 text-right font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentCommissions.map((r) => (
                <tr key={r.id} className="border-b border-border/70 last:border-0">
                  <td className="py-3.5 pr-3">
                    <div className="text-[13.5px] font-medium text-text-primary">
                      {r.productLabel}
                    </div>
                    <div className="text-[12px] text-text-tertiary">{r.brand}</div>
                  </td>
                  <td className="px-3 py-3.5 text-[13.5px] text-text-secondary">{r.channel}</td>
                  <td className="px-3 py-3.5 text-right text-[13.5px] tnum">{formatMoney(r.amount)}</td>
                  <td className="px-3 py-3.5 text-right text-[13.5px] font-semibold text-text-primary tnum">
                    {formatMoney(r.commission)}
                  </td>
                  <td className="py-3.5 pl-3 text-right">
                    <Badge tone={COMMISSION_STATUS_TONE[r.status]} dot>
                      {COMMISSION_STATUS_LABEL[r.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
