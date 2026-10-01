// Обёртка над echarts-for-react с ленивой инициализацией нужных модулей.

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

export function EChart({
  option,
  height = 260,
  className,
}: {
  option: EChartsOption;
  height?: number;
  className?: string;
}) {
  const opt = useMemo(() => option, [option]);
  return (
    <ReactECharts
      echarts={echarts}
      option={opt}
      style={{ height, width: '100%' }}
      className={className}
      notMerge
      lazyUpdate
      opts={{ renderer: 'canvas' }}
    />
  );
}
