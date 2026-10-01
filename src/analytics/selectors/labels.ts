import type { Platform, SalesChannelType } from '@/data/types';

export const PLATFORM_LABEL: Record<Platform, string> = {
  vk: 'VK',
  telegram: 'Telegram',
  youtube: 'YouTube',
  rutube: 'RUTUBE',
};

export const PLATFORM_COLOR: Record<Platform, string> = {
  vk: '#356DF3',
  telegram: '#2AA3E0',
  youtube: '#D75B66',
  rutube: '#7357E8',
};

export const CHANNEL_LABEL: Record<SalesChannelType, string> = {
  whatsbetter: 'Whatsbetter',
  manufacturer_external: 'Сайт производителя',
  manufacturer_ecosystem: 'Производитель в экосистеме',
  marketplace: 'Маркетплейсы',
};

export const CHANNEL_SHORT: Record<SalesChannelType, string> = {
  whatsbetter: 'Whatsbetter',
  manufacturer_external: 'Внешний сайт',
  manufacturer_ecosystem: 'Экосистема',
  marketplace: 'Маркетплейс',
};

export const CHANNEL_COLOR: Record<SalesChannelType, string> = {
  whatsbetter: '#356DF3',
  manufacturer_ecosystem: '#7357E8',
  manufacturer_external: '#1F9D70',
  marketplace: '#D79527',
};

export const FORMAT_LABEL: Record<string, string> = {
  video: 'Видео',
  short_video: 'Shorts',
  story: 'Сторис',
  post: 'Пост',
  stream: 'Стрим',
  article: 'Статья',
  telegram_post: 'Пост в Telegram',
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  created: 'Создан',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  returned: 'Возврат',
};

export const ORDER_STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  created: 'neutral',
  paid: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'warning',
};

export const COMMISSION_STATUS_LABEL: Record<string, string> = {
  estimated: 'Предварительно',
  pending: 'Ожидает подтверждения',
  available: 'Доступно',
  paid: 'Выплачено',
  reversed: 'Отменено',
};

export const COMMISSION_STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  estimated: 'neutral',
  pending: 'warning',
  available: 'success',
  paid: 'info',
  reversed: 'danger',
};

export const COMMISSION_STATUS_COLOR: Record<string, string> = {
  estimated: '#9AA1AC',
  pending: '#D79527',
  available: '#1F9D70',
  paid: '#356DF3',
};

export const PAYOUT_STATUS_LABEL: Record<string, string> = {
  paid: 'Выплачено',
  scheduled: 'Запланировано',
  processing: 'В обработке',
};
