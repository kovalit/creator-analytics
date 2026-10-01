// Форматтеры чисел, валюты, процентов и дат (ru-RU).

const LOCALE = 'ru-RU';
const NBSP = ' ';

const compactFmt = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const intFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const decFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

/** 100000 → «100 тыс.» */
export function compactNumber(n: number): string {
  if (Math.abs(n) < 1000) return intFmt.format(n);
  return compactFmt.format(n);
}

/** Точное целое: 3 800 000 */
export function formatNumber(n: number): string {
  return intFmt.format(Math.round(n));
}

export function formatDecimal(n: number): string {
  return decFmt.format(n);
}

/** 3 800 000 → «3,8 млн ₽» */
export function formatMoneyCompact(n: number): string {
  if (Math.abs(n) < 1000) return `${intFmt.format(Math.round(n))}${NBSP}₽`;
  return `${compactFmt.format(n)}${NBSP}₽`;
}

/** Точная сумма: «3 800 000 ₽» */
export function formatMoney(n: number): string {
  return `${intFmt.format(Math.round(n))}${NBSP}₽`;
}

/** 0.184 → «18,4%» */
export function formatPercent(ratio: number, digits = 1): string {
  const fmt = new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
  return fmt.format(ratio);
}

/** Рост со знаком: +19,5% / −4,2% / «—» если базы нет */
export function formatGrowth(ratio: number | null, digits = 1): string {
  if (ratio === null) return '—';
  const sign = ratio > 0 ? '+' : ratio < 0 ? '−' : '';
  const abs = Math.abs(ratio);
  const fmt = new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
  return `${sign}${fmt.format(abs)}`;
}

export function growthTone(ratio: number | null): 'up' | 'down' | 'flat' {
  if (ratio === null || ratio === 0) return 'flat';
  return ratio > 0 ? 'up' : 'down';
}

/** Аффинити: 168 → «×1.68» */
export function formatAffinity(index: number): string {
  return `×${(index / 100).toFixed(2).replace('.', ',')}`;
}

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_FULL = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function parse(dateStr: string): Date {
  // ожидается 'YYYY-MM-DD' или ISO
  return new Date(dateStr.length <= 10 ? `${dateStr}T00:00:00` : dateStr);
}

/** 2026-09-18 → «18 сен» */
export function formatDateShort(dateStr: string): string {
  const d = parse(dateStr);
  return `${d.getDate()}${NBSP}${MONTHS_SHORT[d.getMonth()]}`;
}

/** 2026-09-18 → «18 сентября 2026» */
export function formatDateLong(dateStr: string): string {
  const d = parse(dateStr);
  return `${d.getDate()}${NBSP}${MONTHS_FULL[d.getMonth()]}${NBSP}${d.getFullYear()}`;
}

/** 2026-09-18T14:21 → «18 сен, 14:21» */
export function formatDateTime(dateStr: string): string {
  const d = parse(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()}${NBSP}${MONTHS_SHORT[d.getMonth()]}, ${hh}:${mm}`;
}

/** '2026-09' → «Сентябрь» */
export function formatMonth(monthStr: string): string {
  const m = Number(monthStr.split('-')[1]) - 1;
  return MONTHS_NOM[m] ?? monthStr;
}

/** '2026-09' → «сен» */
export function formatMonthShort(monthStr: string): string {
  const m = Number(monthStr.split('-')[1]) - 1;
  return MONTHS_SHORT[m] ?? monthStr;
}

/** Диапазон: «1–30 сен 2026» */
export function formatDateRange(from: string, to: string): string {
  const a = parse(from);
  const b = parse(to);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()}${NBSP}${MONTHS_SHORT[b.getMonth()]}${NBSP}${b.getFullYear()}`;
  }
  return `${formatDateShort(from)} — ${formatDateShort(to)} ${b.getFullYear()}`;
}
