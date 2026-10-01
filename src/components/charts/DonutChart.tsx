import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { tooltipStyle } from './echartBase';
import { formatMoneyCompact, compactNumber, formatPercent } from '@/analytics/formatters';

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  kind = 'number',
  height = 220,
  centerLabel,
  centerValue,
}: {
  data: DonutDatum[];
  kind?: 'money' | 'number';
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const option = useMemo<EChartsOption>(() => {
    return {
      tooltip: {
        trigger: 'item',
        ...tooltipStyle,
        formatter: (p: any) => {
          const val = kind === 'money' ? formatMoneyCompact(p.value) : compactNumber(p.value);
          return `${p.marker} ${p.name}<br/><b>${val}</b> · ${formatPercent(p.value / (total || 1))}`;
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['62%', '86%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 6 },
          data: data.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color },
          })),
        },
      ],
    };
  }, [data, kind, total]);

  return (
    <div className="relative">
      <EChart option={option} height={height} />
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-[20px] font-bold text-text-primary tnum">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="mt-0.5 text-[12px] text-text-tertiary">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
