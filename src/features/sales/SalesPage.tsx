import { useNavigate } from 'react-router-dom';
import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { dataset } from '@/data/dataset';
import { useGlobalFilters } from '@/app/filters';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import {
  CampaignDropdown,
  PeriodDropdown,
  PlatformDropdown,
} from '@/components/filters/FiltersBar';
import { KpiCard } from '@/components/data-display/KpiCard';
import { HorizontalBars, LegendRow } from '@/components/data-display/HorizontalBars';
import { DataTable, type Column } from '@/components/data-display/DataTable';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { KpiCardSkeleton } from '@/components/ui/Skeleton';
import { SalesTrendChart } from '@/components/charts/SalesTrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import {
  compactNumber,
  formatDateTime,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from '@/analytics/formatters';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/analytics/selectors/labels';
import type { SalesData } from '@/analytics/selectors/sales';

export function SalesPage() {
  const { params } = useGlobalFilters();
  const navigate = useNavigate();
  const q = useQuery(() => repository.getSales(params), [JSON.stringify(params)]);
  const d = q.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Продажи"
        subtitle="Единая аналитика продаж независимо от места покупки"
      >
        <PeriodDropdown />
        <CampaignDropdown campaigns={dataset.campaigns} />
        <PlatformDropdown />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {!d
          ? Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)
          : d.kpis.map((k) => (
              <KpiCard
                key={k.key}
                label={k.label}
                value={k.value}
                kind={k.kind}
                growth={k.growth}
                accent={k.key === 'gmv'}
              />
            ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <CardHeader title="Динамика продаж" subtitle="GMV и выкупленные заказы" />
          <div className="mt-4">
            {d ? (
              <SalesTrendChart data={d.trend} />
            ) : (
              <div className="skeleton h-[300px] rounded-2xl" />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Каналы продаж" subtitle="Где покупает аудитория" />
          {d && (
            <div className="mt-2">
              <DonutChart
                height={190}
                kind="money"
                data={d.channels.map((c) => ({ name: c.label, value: c.gmv, color: c.color }))}
                centerValue={formatMoneyCompact(d.channels.reduce((a, c) => a + c.gmv, 0))}
                centerLabel="GMV"
              />
              <div className="mt-3 space-y-0.5">
                {d.channels.map((c) => (
                  <LegendRow
                    key={c.key}
                    color={c.color}
                    label={c.label}
                    value={formatMoneyCompact(c.gmv)}
                    sub={formatPercent(c.share)}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <CardHeader title="Товары-лидеры" subtitle="Топ товаров по GMV" />
          <div className="mt-3">
            {d && <ProductsTable products={d.products} />}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <CardHeader title="Маркетплейсы" subtitle="GMV по площадкам" />
            <div className="mt-4 space-y-2.5">
              {d?.marketplaces.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2.5">
                  <div>
                    <div className="text-[13.5px] font-medium text-text-primary">{m.label}</div>
                    <div className="text-[12px] text-text-tertiary">{compactNumber(m.purchasedOrders)} выкуплено</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-semibold text-text-primary tnum">{formatMoneyCompact(m.gmv)}</div>
                    <div className="text-[12px] text-text-tertiary tnum">AOV {formatMoneyCompact(m.aov)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title="Вклад кампаний"
              subtitle="Доля в GMV"
              action={
                <button onClick={() => navigate('/campaigns')} className="text-[13px] font-medium text-primary hover:underline">
                  Все
                </button>
              }
            />
            <div className="mt-4">
              {d && (
                <HorizontalBars
                  items={d.campaignContribution.slice(0, 5).map((c) => ({
                    key: c.id,
                    label: c.title,
                    value: c.share,
                    display: formatPercent(c.share),
                    caption: formatMoneyCompact(c.gmv),
                  }))}
                  max={Math.max(...(d.campaignContribution.map((c) => c.share) ?? [0.01]), 0.01)}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <CardHeader title="Последние заказы" subtitle="Детальные заказы за период" />
        <div className="mt-3">
          {d && <OrdersTable orders={d.recentOrders} />}
        </div>
      </Card>
    </div>
  );
}

function ProductsTable({ products }: { products: SalesData['products'] }) {
  const columns: Column<SalesData['products'][number]>[] = [
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
    { key: 'channel', header: 'Канал', render: (r) => <span className="text-[13px] text-text-secondary">{r.channel}</span> },
    { key: 'purchased', header: 'Выкуплено', align: 'right', sortValue: (r) => r.purchasedOrders, render: (r) => compactNumber(r.purchasedOrders) },
    { key: 'gmv', header: 'GMV', align: 'right', sortValue: (r) => r.gmv, render: (r) => <span className="font-medium">{formatMoneyCompact(r.gmv)}</span> },
    { key: 'aov', header: 'AOV', align: 'right', sortValue: (r) => r.aov, render: (r) => formatMoneyCompact(r.aov) },
    { key: 'commission', header: 'Комиссия', align: 'right', sortValue: (r) => r.commission, render: (r) => <span className="font-semibold text-success">{formatMoneyCompact(r.commission)}</span> },
  ];
  return <DataTable columns={columns} rows={products} rowKey={(r) => r.entityId} initialSort={{ key: 'gmv', dir: 'desc' }} pageSize={8} />;
}

function OrdersTable({ orders }: { orders: SalesData['recentOrders'] }) {
  const columns: Column<SalesData['recentOrders'][number]>[] = [
    { key: 'order', header: 'Заказ', render: (r) => <span className="font-medium text-text-primary">{r.orderNumber}</span> },
    { key: 'product', header: 'Товар', render: (r) => (
      <div>
        <div className="text-[13.5px] text-text-primary">{r.productLabel}</div>
        <div className="text-[12px] text-text-tertiary">{r.brand}</div>
      </div>
    ) },
    { key: 'channel', header: 'Источник', render: (r) => <span className="text-[13px] text-text-secondary">{r.channel}</span> },
    { key: 'date', header: 'Дата', sortValue: (r) => r.createdAt, render: (r) => <span className="text-[13px] text-text-secondary">{formatDateTime(r.createdAt)}</span> },
    { key: 'amount', header: 'Сумма', align: 'right', sortValue: (r) => r.amount, render: (r) => formatMoney(r.amount) },
    { key: 'commission', header: 'Комиссия', align: 'right', sortValue: (r) => r.commission, render: (r) => <span className="font-medium text-success">{formatMoney(r.commission)}</span> },
    {
      key: 'status',
      header: 'Статус',
      align: 'right',
      render: (r) => (
        <Badge tone={ORDER_STATUS_TONE[r.status]} dot>
          {ORDER_STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
  ];
  return <DataTable columns={columns} rows={orders} rowKey={(r) => r.id} initialSort={{ key: 'date', dir: 'desc' }} pageSize={12} emptyLabel="Нет заказов за период" />;
}
