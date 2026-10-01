import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { axisLabelStyle, tooltipStyle } from './echartBase';

export function HeatmapChart({
  labels,
  matrix,
  height = 320,
}: {
  labels: string[];
  matrix: number[][]; // matrix[y][x] 0..100
  height?: number;
}) {
  const option = useMemo<EChartsOption>(() => {
    const data: [number, number, number][] = [];
    for (let y = 0; y < labels.length; y++) {
      for (let x = 0; x < labels.length; x++) {
        data.push([x, y, matrix[y][x]]);
      }
    }
    return {
      grid: { left: 110, right: 16, top: 10, bottom: 90, containLabel: false },
      tooltip: {
        ...tooltipStyle,
        formatter: (p: any) =>
          `${labels[p.data[1]]} × ${labels[p.data[0]]}<br/><b>${p.data[2]}</b> индекс пересечения`,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...axisLabelStyle, rotate: 35, interval: 0 },
        splitArea: { show: false },
      },
      yAxis: {
        type: 'category',
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...axisLabelStyle, interval: 0 },
      },
      visualMap: {
        min: 0,
        max: 100,
        show: false,
        inRange: { color: ['#EEF4FF', '#9cc0ff', '#356DF3'] },
      },
      series: [
        {
          type: 'heatmap',
          data,
          label: {
            show: true,
            color: '#3a4254',
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            formatter: (p: any) => (p.data[2] >= 1 ? p.data[2] : ''),
          },
          itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 6 },
          emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(53,109,243,.3)' } },
        },
      ],
    };
  }, [labels, matrix]);
  return <EChart option={option} height={height} />;
}
