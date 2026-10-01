import type { EChartsOption } from 'echarts';

export const CHART_COLORS = ['#356DF3', '#7357E8', '#1F9D70', '#D79527', '#9AA1AC'];

export const AXIS_TEXT = '#9AA1AC';
export const GRID_LINE = '#EEF1F6';

export const tooltipStyle = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E8EBF0',
  borderWidth: 1,
  padding: [10, 12] as [number, number],
  textStyle: { color: '#171A22', fontSize: 13, fontFamily: 'Inter, sans-serif' },
  extraCssText:
    'border-radius:12px; box-shadow:0 4px 12px rgba(15,23,42,.06),0 16px 48px rgba(15,23,42,.10);',
};

export function baseGrid(left = 44, right = 16): EChartsOption['grid'] {
  return { left, right, top: 16, bottom: 28, containLabel: false };
}

export const axisLabelStyle = {
  color: AXIS_TEXT,
  fontSize: 12,
  fontFamily: 'Inter, sans-serif',
};

/** Короткая подпись оси: 180000 → «180к», 3800000 → «3,8м». */
export function axisValueShort(n: number): string {
  const abs = Math.abs(n);
  const fmt = (v: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(v);
  if (abs >= 1_000_000) return `${fmt(n / 1_000_000)}м`;
  if (abs >= 1_000) return `${fmt(n / 1_000)}к`;
  return fmt(n);
}
