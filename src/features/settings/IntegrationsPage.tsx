import { repository } from '@/data/repositories/MockCreatorAnalyticsRepository';
import { useQuery } from '@/app/useQuery';
import { PageHeader } from '@/components/filters/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PlatformTag } from '@/components/data-display/PlatformTag';
import { compactNumber } from '@/analytics/formatters';

export function IntegrationsPage() {
  const q = useQuery(() => repository.getIntegrations(), []);
  const d = q.data;

  return (
    <div className="space-y-5">
      <PageHeader title="Интеграции" subtitle="Подключённые соцсети и каналы продаж" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Социальные сети" subtitle="Источники контента и переходов" />
          <div className="mt-4 space-y-2.5">
            {d?.social.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                <PlatformTag platform={s.platform} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-text-primary">{s.handle}</div>
                  <div className="text-[12px] text-text-tertiary">{compactNumber(s.followers)} подписчиков</div>
                </div>
                <Badge tone="success" dot>
                  Подключено
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Каналы продаж" subtitle="Источники данных о покупках" />
          <div className="mt-4 space-y-2.5">
            {d?.commerce.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-[12px] font-bold text-primary">
                  {c.label.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-text-primary">{c.label}</div>
                  <div className="text-[12px] text-text-tertiary">{c.note}</div>
                </div>
                <Badge tone={c.status === 'active' ? 'success' : 'info'} dot>
                  {c.status === 'active' ? 'Активно' : 'Данные доступны'}
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] text-text-tertiary">
            В demo-кабинете подключение каналов отключено — данные уже загружены.
          </p>
          <div className="mt-3">
            <Button variant="soft" disabled>
              Подключить канал
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
