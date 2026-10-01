import { useMemo, useState } from 'react';
import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from '@/analytics/formatters';
import type {
  OpportunityCard as Card_,
  OpportunitySort,
} from '@/analytics/selectors/opportunities';
import { IconInfo, IconOpportunities } from '@/components/ui/icons';

const SORTS: { value: OpportunitySort; label: string }[] = [
  { value: 'match', label: 'По совпадению' },
  { value: 'revenue', label: 'Доход на 1000 просм.' },
  { value: 'commission', label: 'По комиссии' },
  { value: 'newest', label: 'Сначала новые' },
];

export function OpportunitiesPage() {
  const [sphereId, setSphereId] = useState<string>('__all__');
  const [sort, setSort] = useState<OpportunitySort>('match');
  const [minMatch, setMinMatch] = useState<string>('0');

  const spheresQ = useQuery(() => repository.getOpportunitySpheres(), []);
  const q = useQuery(
    () =>
      repository.getOpportunities({
        sphereId: sphereId === '__all__' ? null : sphereId,
        sort,
        minMatch: Number(minMatch),
      }),
    [sphereId, sort, minMatch],
  );

  const sphereOptions = useMemo(
    () => [
      { value: '__all__', label: 'Все сферы' },
      ...(spheresQ.data ?? []).map((s) => ({ value: s.id, label: s.label })),
    ],
    [spheresQ.data],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Возможности"
        subtitle="Новые кампании, которые подходят вашей аудитории"
      >
        <Dropdown value={sphereId} options={sphereOptions} onChange={setSphereId} minWidth={190} />
        <Dropdown
          value={minMatch}
          options={[
            { value: '0', label: 'Любое совпадение' },
            { value: '0.8', label: 'Совпадение ≥ 80%' },
            { value: '0.9', label: 'Совпадение ≥ 90%' },
          ]}
          onChange={setMinMatch}
          minWidth={190}
        />
        <Dropdown value={sort} options={SORTS} onChange={(v) => setSort(v as OpportunitySort)} minWidth={210} />
      </PageHeader>

      <div className="flex items-start gap-3 rounded-card border border-border bg-surface-soft px-4 py-3">
        <IconInfo width={18} height={18} className="mt-0.5 shrink-0 text-text-tertiary" />
        <p className="text-[13px] text-text-secondary">
          Прогноз — это оценка по вашей прошлой аудитории и результатам в смежных сферах, а не
          гарантированный доход.
        </p>
      </div>

      {q.status === 'ready' && q.data && q.data.length === 0 ? (
        <EmptyState
          title="Нет подходящих возможностей"
          description="Измените фильтры, чтобы увидеть больше кампаний."
          icon={<IconOpportunities width={22} height={22} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {q.status === 'loading'
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-card" />)
            : q.data?.map((o) => <OfferCard key={o.id} o={o} />)}
        </div>
      )}
    </div>
  );
}

function OfferCard({ o }: { o: Card_ }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge tone="primary">{o.sphereLabel}</Badge>
          <h3 className="mt-2.5 text-[16px] font-semibold text-text-primary">{o.title}</h3>
          <p className="mt-1 text-[12.5px] text-text-tertiary">
            {o.partnerLabels.slice(0, 3).join(' · ')}
            {o.partnerLabels.length > 3 ? ` +${o.partnerLabels.length - 3}` : ''}
          </p>
        </div>
        <div className="shrink-0 text-center">
          <ProgressRing value={o.audienceMatch} size={58} stroke={5} />
          <div className="mt-1 text-[11px] text-text-tertiary">совпадение</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
        <Metric label="Комиссия" value={formatPercent(o.commission.value)} accent />
        <Metric label="Ожид. AOV" value={formatMoneyCompact(o.estimated.expectedAov)} />
        <Metric label="Доход / 1К" value={formatMoney(o.estimated.revenuePer1000Views)} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12.5px] text-text-tertiary">
          {o.status === 'upcoming' ? 'Скоро' : 'Доступно'} · старт {formatStart(o.startsAt)}
        </span>
        <Button size="sm" variant="soft" disabled>
          Подробнее
        </Button>
      </div>
    </Card>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11.5px] text-text-tertiary">{label}</div>
      <div className={`mt-0.5 text-[14px] font-semibold tnum ${accent ? 'text-primary' : 'text-text-primary'}`}>
        {value}
      </div>
    </div>
  );
}

function formatStart(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const m = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${d.getDate()} ${m[d.getMonth()]}`;
}
