import { useState } from 'react';
import { dataset } from '@/data/dataset';
import { PageHeader } from '@/components/filters/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function SettingsPage() {
  const { creator, spheres } = dataset;
  const sphereMap = new Map(spheres.map((s) => [s.id, s]));

  return (
    <div className="space-y-5">
      <PageHeader title="Настройки" subtitle="Профиль креатора и параметры кабинета" />

      <Card className="p-5">
        <CardHeader title="Профиль" />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={creator.displayName} size={64} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-semibold text-text-primary">{creator.displayName}</h3>
              {creator.verified && <Badge tone="info">Проверенный</Badge>}
            </div>
            <div className="text-[13px] text-text-secondary">{creator.username}</div>
            <p className="mt-1 max-w-lg text-[13px] text-text-tertiary">{creator.bio}</p>
          </div>
          <Button variant="secondary" disabled>
            Редактировать
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {creator.categorySphereIds.map((id) => (
            <Badge key={id} tone="neutral">
              {sphereMap.get(id)?.label ?? id}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Уведомления" subtitle="Что присылать на почту" />
          <div className="mt-4 space-y-1">
            <ToggleRow label="Еженедельный отчёт по доходу" defaultOn />
            <ToggleRow label="Новые подходящие кампании" defaultOn />
            <ToggleRow label="Изменения статусов начислений" />
            <ToggleRow label="Всплески просмотров публикаций" defaultOn />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Параметры отчётов" subtitle="Валюта и часовой пояс demo" />
          <div className="mt-4 space-y-3 text-[13.5px]">
            <Row label="Валюта" value="Рубли (₽)" />
            <Row label="Часовой пояс" value="Europe/Moscow" />
            <Row label="Локаль" value="ru-RU" />
            <Row label="Период по умолчанию" value="30 дней" />
            <Row label="Окно атрибуции" value="30 дней" />
          </div>
          <p className="mt-4 text-[12.5px] text-text-tertiary">
            В demo параметры зафиксированы и недоступны для изменения.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 pb-3 last:border-0 last:pb-0">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}

function ToggleRow({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between rounded-xl px-1 py-2.5">
      <span className="text-[13.5px] text-text-primary">{label}</span>
      <button
        onClick={() => setOn((v) => !v)}
        role="switch"
        aria-checked={on}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          on ? 'bg-primary' : 'bg-[#D7DCE4]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all',
            on ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}
