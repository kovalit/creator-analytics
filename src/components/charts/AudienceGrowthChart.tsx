import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { GRID_LINE, axisLabelStyle, axisValueShort, baseGrid, tooltipStyle } from './echartBase';
import { formatMonth, formatNumber } from '@/analytics/formatters';

export function AudienceGrowthChart({
  months,
  series,
  height = 280,
}: {
  months: string[];
  series: { name: string; data: number[]; color: string; area?: boolean }[];
  height?: number;
}) {
  const option = useMemo<EChartsOption>(() => {
    return {
      color: series.map((s) => s.color),
      grid: { ...baseGrid(48, 16), bottom: 54 },
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        valueFormatter: (v) => formatNumber(Number(v)),
      },
      legend: {
        data: series.map((s) => s.name),
        bottom: 0,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#69707D', fontSize: 12, fontFamily: 'Inter, sans-serif' },
      },
      xAxis: {
        type: 'category',
        data: months.map((m) => formatMonth(m).slice(0, 3)),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: axisLabelStyle,
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: GRID_LINE } },
        axisLabel: { ...axisLabelStyle, formatter: (v: number) => axisValueShort(v) },
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: 0.35,
        showSymbol: false,
        lineStyle: { width: 2.4, color: s.color },
        itemStyle: { color: s.color },
        areaStyle: s.area
          ? {
              opacity: 0.1,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: `${s.color}33` },
                  { offset: 1, color: `${s.color}00` },
                ],
              },
            }
          : undefined,
        data: s.data,
      })),
      textStyle: { fontFamily: 'Inter, sans-serif' },
    };
  }, [months, series]);
  return <EChart option={option} height={height} />;
}
