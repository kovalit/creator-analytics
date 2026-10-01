import { useNavigate } from 'react-router-dom';
import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { useGlobalFilters } from '@/app/filters';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import { PeriodDropdown } from '@/components/filters/FiltersBar';
import { Card } from '@/components/ui/Card';
import { Badge, type Tone } from '@/components/ui/Badge';
import { compactNumber, formatDateRange, formatMoneyCompact } from '@/analytics/formatters';
import type { CampaignSummary } from '@/analytics/selectors/campaigns';
import { IconArrowUpRight, IconCampaigns } from '@/components/ui/icons';

const STATUS: Record<string, { label: string; tone: Tone }> = {
  active: { label: 'Активна', tone: 'success' },
  completed: { label: 'Завершена', tone: 'neutral' },
  draft: { label: 'Черновик', tone: 'warning' },
};

export function CampaignsPage() {
  const { params } = useGlobalFilters();
  const navigate = useNavigate();
  const q = useQuery(() => repository.getCampaignSummaries(params), [JSON.stringify(params)]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Кампании"
        subtitle="Шоу «Что лучше» по сферам: от охвата до дохода"
      >
        <PeriodDropdown />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {q.status === 'loading'
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-56 rounded-card" />
            ))
          : q.data?.map((c) => <CampaignCard key={c.id} c={c} onClick={() => navigate(`/campaigns/${c.id}`)} />)}
      </div>
    </div>
  );
}

function CampaignCard({ c, onClick }: { c: CampaignSummary; onClick: () => void }) {
  const status = STATUS[c.status] ?? STATUS.completed;
  return (
    <Card
      as="article"
      className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-card-hover"
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="relative flex h-24 items-end bg-gradient-to-br from-primary to-secondary px-4 pb-3">
          <div className="absolute right-3 top-3">
            <Badge tone={status.tone} dot className="bg-white/90">
              {status.label}
            </Badge>
          </div>
          <IconCampaigns className="absolute right-4 bottom-3 text-white/25" width={56} height={56} />
          <div className="relative text-white">
            <div className="text-[11.5px] font-medium uppercase tracking-wide text-white/80">
              {c.sphereLabel}
            </div>
            <div className="mt-0.5 line-clamp-1 text-[16px] font-semibold">{c.title}</div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between text-[12.5px] text-text-tertiary">
            <span>{formatDateRange(c.startDate, c.endDate)}</span>
            <span>{c.publications} публ.</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Просмотры" value={compactNumber(c.views)} />
            <Stat label="Выкуплено" value={compactNumber(c.purchasedOrders)} />
            <Stat label="GMV" value={formatMoneyCompact(c.gmv)} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[13px] text-text-secondary">Мой доход</span>
            <span className="flex items-center gap-1.5 text-[15px] font-bold text-success tnum">
              {formatMoneyCompact(c.commission)}
              <IconArrowUpRight
                width={16}
                height={16}
                className="text-text-tertiary transition-colors group-hover:text-primary"
              />
            </span>
          </div>
        </div>
      </button>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-soft px-2.5 py-2">
      <div className="text-[11.5px] text-text-tertiary">{label}</div>
      <div className="mt-0.5 text-[14px] font-semibold text-text-primary tnum">{value}</div>
    </div>
  );
}
