import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { GRID_LINE, axisLabelStyle, axisValueShort, baseGrid, tooltipStyle } from './echartBase';
import { formatMoney, formatNumber, formatDateShort, formatMonth } from '@/analytics/formatters';

function xLabel(key: string): string {
  if (key.length === 7) return formatMonth(key).slice(0, 3);
  return formatDateShort(key).replace(' ', ' ');
}

export function SalesTrendChart({
  data,
  height = 300,
}: {
  data: { date: string; gmv: number; purchasedOrders: number }[];
  height?: number;
}) {
  const option = useMemo<EChartsOption>(() => {
    const labels = data.map((d) => xLabel(d.date));
    const compact = axisValueShort;
    return {
      grid: { ...baseGrid(50, 44), bottom: 54 },
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        formatter: (params: any) => {
          const gmv = params.find((p: any) => p.seriesName === 'GMV');
          const po = params.find((p: any) => p.seriesName === 'Выкуплено');
          return `${params[0].axisValue}<br/>${gmv ? `${gmv.marker} GMV <b>${formatMoney(gmv.value)}</b><br/>` : ''}${po ? `${po.marker} Выкуплено <b>${formatNumber(po.value)}</b>` : ''}`;
        },
      },
      legend: {
        data: ['GMV', 'Выкуплено'],
        bottom: 0,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#69707D', fontSize: 12, fontFamily: 'Inter, sans-serif' },
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...axisLabelStyle, hideOverlap: true },
      },
      yAxis: [
        {
          type: 'value',
          splitLine: { lineStyle: { color: GRID_LINE } },
          axisLabel: { ...axisLabelStyle, formatter: (v: number) => compact(v) },
        },
        {
          type: 'value',
          splitLine: { show: false },
          axisLabel: { ...axisLabelStyle, formatter: (v: number) => compact(v) },
        },
      ],
      series: [
        {
          name: 'GMV',
          type: 'bar',
          data: data.map((d) => d.gmv),
          barWidth: '46%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#4b7bf5' },
                { offset: 1, color: '#9cc0ff' },
              ],
            },
          },
        },
        {
          name: 'Выкуплено',
          type: 'line',
          yAxisIndex: 1,
          smooth: 0.35,
          showSymbol: false,
          data: data.map((d) => d.purchasedOrders),
          lineStyle: { width: 2.4, color: '#7357E8' },
          itemStyle: { color: '#7357E8' },
        },
      ],
      textStyle: { fontFamily: 'Inter, sans-serif' },
    };
  }, [data]);
  return <EChart option={option} height={height} />;
}
