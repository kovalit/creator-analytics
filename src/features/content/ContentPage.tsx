import { useMemo, useState } from 'react';
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
import { DataTable, type Column } from '@/components/data-display/DataTable';
import { PlatformTag } from '@/components/data-display/PlatformTag';
import { Card } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { SearchInput } from '@/components/ui/SearchInput';
import { KpiCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import {
  compactNumber,
  formatMoneyCompact,
  formatPercent,
} from '@/analytics/formatters';
import { FORMAT_LABEL } from '@/analytics/selectors/labels';
import type { PublicationRow } from '@/analytics/selectors/content';

export function ContentPage() {
  const { params } = useGlobalFilters();
  const navigate = useNavigate();
  const [format, setFormat] = useState<string>('__all__');
  const [search, setSearch] = useState('');

  const content = useQuery(() => repository.getContent(params), [JSON.stringify(params)]);

  const formats = useMemo(() => {
    const set = new Set(dataset.publications.map((p) => p.format));
    return [
      { value: '__all__', label: 'Все форматы' },
      ...[...set].map((f) => ({ value: f, label: FORMAT_LABEL[f] ?? f })),
    ];
  }, []);

  const rows = useMemo(() => {
    let r = content.data?.rows ?? [];
    if (format !== '__all__') r = r.filter((x) => x.format === format);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(
        (x) => x.title.toLowerCase().includes(q) || x.campaignTitle.toLowerCase().includes(q),
      );
    }
    return r;
  }, [content.data, format, search]);

  const columns: Column<PublicationRow>[] = [
    {
      key: 'title',
      header: 'Контент',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-medium text-text-primary">{r.title}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <PlatformTag platform={r.platform} />
              <span className="text-[12px] text-text-tertiary">{FORMAT_LABEL[r.format] ?? r.format}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'campaign',
      header: 'Кампания',
      render: (r) => <span className="text-[13px] text-text-secondary">{r.campaignTitle}</span>,
    },
    {
      key: 'views',
      header: 'Просмотры',
      align: 'right',
      sortValue: (r) => r.views,
      render: (r) => compactNumber(r.views),
    },
    {
      key: 'ctr',
      header: 'CTR',
      align: 'right',
      sortValue: (r) => r.ctr,
      render: (r) => formatPercent(r.ctr),
    },
    {
      key: 'addToCart',
      header: 'Корзины',
      align: 'right',
      sortValue: (r) => r.addToCart,
      render: (r) => compactNumber(r.addToCart),
    },
    {
      key: 'purchasedOrders',
      header: 'Выкуплено',
      align: 'right',
      sortValue: (r) => r.purchasedOrders,
      render: (r) => compactNumber(r.purchasedOrders),
    },
    {
      key: 'gmv',
      header: 'GMV',
      align: 'right',
      sortValue: (r) => r.gmv,
      render: (r) => <span className="font-medium">{formatMoneyCompact(r.gmv)}</span>,
    },
    {
      key: 'commission',
      header: 'Доход',
      align: 'right',
      sortValue: (r) => r.commission,
      render: (r) => <span className="font-semibold text-success">{formatMoneyCompact(r.commission)}</span>,
    },
  ];

  const h = content.data?.header;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Контент"
        subtitle="Какой контент не только смотрят, но и покупают после перехода"
      >
        <PeriodDropdown />
        <CampaignDropdown campaigns={dataset.campaigns} />
        <PlatformDropdown />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {content.status === 'loading' || !h
          ? Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)
          : [
              <KpiCard key="pub" label="Публикаций" value={h.publications} kind="number" />,
              <KpiCard key="views" label="Просмотры" value={h.views} kind="number" growth={h.growth.views} />,
              <KpiCard key="ctr" label="CTR" value={h.ctr} kind="percent" />,
              <KpiCard key="purch" label="Выкуплено" value={h.purchasedOrders} kind="number" />,
              <KpiCard key="gmv" label="GMV" value={h.gmv} kind="money" growth={h.growth.gmv} />,
              <KpiCard key="comm" label="Доход" value={h.commission} kind="money" accent />,
            ]}
      </div>

      {content.status === 'loading' ? (
        <TableSkeleton rows={8} />
      ) : (
        <Card className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[15px] font-semibold text-text-primary">Публикации</h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Поиск по названию"
                className="w-full sm:w-56"
              />
              <Dropdown
                value={format}
                options={formats}
                onChange={setFormat}
                minWidth={180}
              />
            </div>
          </div>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/content/${r.id}`)}
            initialSort={{ key: 'gmv', dir: 'desc' }}
            pageSize={12}
            emptyLabel="Нет публикаций по заданным фильтрам"
          />
        </Card>
      )}
    </div>
  );
}
