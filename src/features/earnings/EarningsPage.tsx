import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { useGlobalFilters } from '@/app/filters';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import { CompareToggle, PeriodDropdown } from '@/components/filters/FiltersBar';
import { HorizontalBars } from '@/components/data-display/HorizontalBars';
import { SegmentBar } from '@/components/data-display/SegmentBar';
import { DataTable, type Column } from '@/components/data-display/DataTable';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MetricLineChart } from '@/components/charts/MetricLineChart';
import {
  formatDateLong,
  formatDateRange,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from '@/analytics/formatters';
import {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_TONE,
  PAYOUT_STATUS_LABEL,
} from '@/analytics/selectors/labels';
import type { EarningsData } from '@/analytics/selectors/earnings';
import type { Payout } from '@/data/types';

export function EarningsPage() {
  const { params } = useGlobalFilters();
  const q = useQuery(() => repository.getEarnings(params), [JSON.stringify(params)]);
  const d = q.data;

  return (
    <div className="space-y-5">
      <PageHeader title="Заработок" subtitle="Комиссии, статусы начислений и выплаты">
        <PeriodDropdown />
        <CompareToggle />
      </PageHeader>

      {/* Hero + status tiles */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="flex flex-col justify-between bg-gradient-to-br from-primary to-[#4b7bf5] p-5 text-white lg:col-span-2">
          <div className="text-[13px] font-medium text-white/80">Заработано за период</div>
          <div className="mt-2 text-[38px] font-bold leading-none tracking-tight tnum">
            {d ? formatMoney(d.earned) : '—'}
          </div>
          <div className="mt-3">
            {d && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-2.5 py-1 text-[12.5px] font-semibold">
                {d.earnedGrowth === null
                  ? 'нет базы сравнения'
                  : `${d.earnedGrowth > 0 ? '+' : ''}${formatPercent(d.earnedGrowth)} к пред. периоду`}
              </span>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-3">
          <StatusTile label="Доступно" value={d?.statusTotals.available} tone="success" />
          <StatusTile label="Ожидает подтверждения" value={d?.statusTotals.pending} tone="warning" />
          <StatusTile label="Предварительно" value={d?.statusTotals.estimated} tone="neutral" />
          <StatusTile label="Выплачено" value={d?.statusTotals.paid} tone="info" />
        </div>
      </div>

      {/* Trend + status */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <CardHeader title="Динамика дохода" subtitle="Комиссия по периоду" />
          <div className="mt-4">
            {d ? (
              <MetricLineChart current={d.trend} kind="money" color="#1F9D70" />
            ) : (
              <div className="skeleton h-[280px] rounded-2xl" />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Статусы начислений" subtitle="Структура комиссии по статусам" />
          {d && (
            <div className="mt-5">
              <SegmentBar segments={d.statusBars.map((b) => ({ key: b.key, label: b.label, value: b.value, color: b.color }))} />
              <div className="mt-5 space-y-2">
                {d.statusBars.map((b) => (
                  <div key={b.key} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13.5px] text-text-secondary">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
                      {b.label}
                    </span>
                    <span className="text-[13.5px] font-semibold text-text-primary tnum">
                      {formatMoneyCompact(b.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Income by campaign */}
      <Card className="p-5">
        <CardHeader title="Доход по кампаниям" subtitle="Вклад кампаний в комиссию" />
        <div className="mt-5">
          {d && (
            <HorizontalBars
              barColor="#1F9D70"
              items={d.byCampaign.map((c) => ({
                key: c.id,
                label: c.title,
                value: c.share,
                display: formatMoneyCompact(c.commission),
                caption: formatPercent(c.share),
              }))}
              max={Math.max(...(d.byCampaign.map((c) => c.share) ?? [0.01]), 0.01)}
            />
          )}
        </div>
      </Card>

      {/* Recent commissions */}
      <Card className="p-5">
        <CardHeader title="Последние начисления" subtitle="Комиссии по заказам" />
        <div className="mt-3">{d && <CommissionsTable rows={d.recentCommissions} />}</div>
      </Card>

      {/* Payouts */}
      <Card className="p-5">
        <CardHeader title="Выплаты" subtitle="История и запланированные выплаты" />
        <div className="mt-3">{d && <PayoutsTable rows={d.payouts} />}</div>
      </Card>
    </div>
  );
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string;
  value?: number;
  tone: 'success' | 'warning' | 'neutral' | 'info';
}) {
  const color =
    tone === 'success' ? '#1F9D70' : tone === 'warning' ? '#D79527' : tone === 'info' ? '#356DF3' : '#9AA1AC';
  return (
    <Card size="sm" className="p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[12.5px] font-medium text-text-secondary">{label}</span>
      </div>
      <div className="mt-2 text-[22px] font-bold text-text-primary tnum">
        {value === undefined ? '—' : formatMoneyCompact(value)}
      </div>
    </Card>
  );
}

function CommissionsTable({ rows }: { rows: EarningsData['recentCommissions'] }) {
  const columns: Column<EarningsData['recentCommissions'][number]>[] = [
    { key: 'date', header: 'Дата', sortValue: (r) => r.date, render: (r) => <span className="text-[13px] text-text-secondary">{formatDateLong(r.date)}</span> },
    { key: 'campaign', header: 'Кампания', render: (r) => <span className="text-[13px] text-text-secondary">{r.campaignTitle}</span> },
    { key: 'product', header: 'Товар', render: (r) => <span className="text-[13.5px] text-text-primary">{r.productLabel}</span> },
    { key: 'channel', header: 'Канал', render: (r) => <span className="text-[13px] text-text-secondary">{r.channel}</span> },
    { key: 'amount', header: 'Сумма', align: 'right', sortValue: (r) => r.amount, render: (r) => formatMoney(r.amount) },
    { key: 'rate', header: 'Ставка', align: 'right', sortValue: (r) => r.rate, render: (r) => formatPercent(r.rate) },
    { key: 'commission', header: 'Комиссия', align: 'right', sortValue: (r) => r.commission, render: (r) => <span className="font-semibold text-success">{formatMoney(r.commission)}</span> },
    {
      key: 'status',
      header: 'Статус',
      align: 'right',
      render: (r) => (
        <Badge tone={COMMISSION_STATUS_TONE[r.status]} dot>
          {COMMISSION_STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
  ];
  return <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} initialSort={{ key: 'date', dir: 'desc' }} pageSize={10} emptyLabel="Нет начислений за период" />;
}

function PayoutsTable({ rows }: { rows: Payout[] }) {
  const columns: Column<Payout>[] = [
    { key: 'date', header: 'Дата', render: (r) => <span className="text-[13px] text-text-secondary">{r.paidAt ? formatDateLong(r.paidAt) : '—'}</span> },
    { key: 'period', header: 'Период', render: (r) => <span className="text-[13px] text-text-secondary">{formatDateRange(r.period.from, r.period.to)}</span> },
    { key: 'amount', header: 'Сумма', align: 'right', sortValue: (r) => r.amount, render: (r) => <span className="font-semibold text-text-primary">{formatMoney(r.amount)}</span> },
    { key: 'method', header: 'Способ', render: () => <span className="text-[13px] text-text-secondary">Банковский счёт</span> },
    {
      key: 'status',
      header: 'Статус',
      align: 'right',
      render: (r) => (
        <Badge tone={r.status === 'paid' ? 'success' : r.status === 'scheduled' ? 'info' : 'warning'} dot>
          {PAYOUT_STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
  ];
  return <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />;
}
