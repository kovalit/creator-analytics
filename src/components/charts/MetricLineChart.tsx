import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { AXIS_TEXT, GRID_LINE, axisLabelStyle, axisValueShort, baseGrid, tooltipStyle } from './echartBase';
import { formatMoney, formatNumber, formatDateShort, formatMonth } from '@/analytics/formatters';

export interface LinePoint {
  date: string;
  value: number;
}

function xLabel(key: string): string {
  if (key.length === 7) return formatMonth(key).slice(0, 3);
  return formatDateShort(key).replace(' ', ' ');
}

export function MetricLineChart({
  current,
  previous,
  kind = 'number',
  color = '#356DF3',
  height = 280,
  area = true,
}: {
  current: LinePoint[];
  previous?: LinePoint[] | null;
  kind?: 'money' | 'number';
  color?: string;
  height?: number;
  area?: boolean;
}) {
  const option = useMemo<EChartsOption>(() => {
    const labels = current.map((p) => xLabel(p.date));
    const fmt = (v: number) => (kind === 'money' ? formatMoney(v) : formatNumber(v));
    const compact = axisValueShort;

    const series: EChartsOption['series'] = [
      {
        name: 'Текущий период',
        type: 'line',
        smooth: 0.35,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: false,
        lineStyle: { width: 2.4, color },
        itemStyle: { color, borderColor: '#fff', borderWidth: 2 },
        areaStyle: area
          ? {
              opacity: 0.12,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: `${color}33` },
                  { offset: 1, color: `${color}00` },
                ],
              },
            }
          : undefined,
        data: current.map((p) => p.value),
        emphasis: { focus: 'series' },
        z: 3,
      },
    ];

    if (previous && previous.length) {
      series.push({
        name: 'Предыдущий период',
        type: 'line',
        smooth: 0.35,
        showSymbol: false,
        lineStyle: { width: 2, color: '#C3CAD5', type: 'dashed' },
        itemStyle: { color: '#C3CAD5' },
        data: previous.map((p) => p.value),
        z: 2,
      });
    }

    return {
      color: [color, '#C3CAD5'],
      grid: baseGrid(48, 16),
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        axisPointer: { type: 'line', lineStyle: { color: '#D7DCE4', width: 1 } },
        valueFormatter: (v) => fmt(Number(v)),
      },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...axisLabelStyle, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: GRID_LINE } },
        axisLabel: { ...axisLabelStyle, formatter: (v: number) => compact(v) },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series,
      textStyle: { fontFamily: 'Inter, sans-serif', color: AXIS_TEXT },
    };
  }, [current, previous, kind, color, area]);

  return <EChart option={option} height={height} />;
}
