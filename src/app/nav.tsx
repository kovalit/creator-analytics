import type { ComponentType, SVGProps } from 'react';
import {
  IconAudience,
  IconCampaigns,
  IconContent,
  IconEarnings,
  IconHome,
  IconIntegrations,
  IconOpportunities,
  IconSales,
  IconSettings,
} from '@/components/ui/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Главная', icon: IconHome, end: true },
  { to: '/content', label: 'Контент', icon: IconContent },
  { to: '/campaigns', label: 'Кампании', icon: IconCampaigns },
  { to: '/audience', label: 'Аудитория', icon: IconAudience },
  { to: '/sales', label: 'Продажи', icon: IconSales },
  { to: '/earnings', label: 'Заработок', icon: IconEarnings },
  { to: '/opportunities', label: 'Возможности', icon: IconOpportunities },
];

export const SECONDARY_NAV: NavItem[] = [
  { to: '/integrations', label: 'Интеграции', icon: IconIntegrations },
  { to: '/settings', label: 'Настройки', icon: IconSettings },
];
