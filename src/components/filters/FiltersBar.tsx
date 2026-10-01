import { useGlobalFilters } from '@/app/filters';
import { PERIOD_OPTIONS } from '@/analytics/selectors/period';
import { Dropdown, type DropdownOption } from '../ui/Dropdown';
import { IconCalendar, IconCheck } from '../ui/icons';
import { PLATFORM_LABEL } from '@/analytics/selectors/labels';
import { cn } from '@/lib/cn';
import type { Campaign, PeriodKey, Platform } from '@/data/types';

export function CompareToggle() {
  const { compare, setCompare } = useGlobalFilters();
  return (
    <button
      onClick={() => setCompare(!compare)}
      aria-pressed={compare}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors',
        compare
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-border bg-surface text-text-secondary hover:bg-surface-soft',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-[5px] border',
          compare ? 'border-primary bg-primary text-white' : 'border-border-strong',
        )}
      >
        {compare && <IconCheck width={12} height={12} />}
      </span>
      Сравнить
    </button>
  );
}

export function PeriodDropdown() {
  const { periodKey, setPeriod } = useGlobalFilters();
  const options: DropdownOption<PeriodKey>[] = PERIOD_OPTIONS.filter(
    (o) => o.key !== 'custom',
  ).map((o) => ({ value: o.key, label: o.label }));
  return (
    <Dropdown
      value={periodKey === 'custom' ? '30d' : periodKey}
      options={options}
      onChange={(v) => setPeriod(v)}
      icon={<IconCalendar width={16} height={16} />}
      minWidth={170}
    />
  );
}

export function CampaignDropdown({ campaigns }: { campaigns: Campaign[] }) {
  const { campaignId, setCampaign } = useGlobalFilters();
  const options: DropdownOption<string>[] = [
    { value: '__all__', label: 'Все кампании' },
    ...campaigns.map((c) => ({ value: c.id, label: c.title })),
  ];
  return (
    <Dropdown
      value={campaignId ?? '__all__'}
      options={options}
      onChange={(v) => setCampaign(v === '__all__' ? null : v)}
      label="Кампания"
      minWidth={240}
    />
  );
}

export function PlatformDropdown() {
  const { platform, setPlatform } = useGlobalFilters();
  const platforms: Platform[] = ['vk', 'telegram', 'youtube', 'rutube'];
  const options: DropdownOption<string>[] = [
    { value: '__all__', label: 'Все площадки' },
    ...platforms.map((p) => ({ value: p, label: PLATFORM_LABEL[p] })),
  ];
  return (
    <Dropdown
      value={platform ?? '__all__'}
      options={options}
      onChange={(v) => setPlatform(v === '__all__' ? null : (v as Platform))}
      label="Площадка"
      minWidth={200}
    />
  );
}
