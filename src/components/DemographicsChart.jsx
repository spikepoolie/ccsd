import React, { useMemo, useRef } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { registerBaseChartJS } from '../chartConfig/chartJsSetup';
import { CHART_PALETTE } from '../chartConfig/colors';
import '../styles/chart.css';

registerBaseChartJS();

export default function DemographicsChart({ labels, counts, percentages, chartType, threshold = 5 }) {
  const legendRef = useRef(null);
  const isPieLike = chartType === 'pie' || chartType === 'doughnut';
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  const smallSliceThreshold = threshold;

  const barData = useMemo(() => ({
    labels,
    datasets: [
      { label: 'Count', data: counts, backgroundColor: '#4285F4' }
    ]
  }), [labels, counts]);

  const pieData = useMemo(() => ({
    labels,
    datasets: [
      { label: 'Count', data: counts, backgroundColor: CHART_PALETTE }
    ]
  }), [labels, counts]);

  const baseOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 64, bottom: 12 } },
    plugins: {
      legend: { display: !isPieLike, position: 'top', labels: { padding: 20 } },
      title: { display: true, text: 'Demographics Chart from data.json', padding: { top: 8, bottom: 12 } },
      datalabels: {
        color: (ctx) => {
          if (chartType === 'bar') return '#fff';
          const meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
          const el = meta?.data?.[ctx.dataIndex];
          const props = el?.getProps(['x','y'], true) || {};
          const nearTop = props.y != null && props.y < (ctx.chart.chartArea.top + 36);
          if (nearTop) return '#fff';
          const ds = ctx.chart.data?.datasets?.[ctx.datasetIndex] || {};
          const bg = ds.backgroundColor;
          if (Array.isArray(bg)) return bg[ctx.dataIndex] || '#222';
          return bg || '#222';
        },
        anchor: (ctx) => (chartType === 'bar' ? 'center' : 'end'),
        align: (ctx) => (chartType === 'bar' ? 'center' : 'end'),
        offset: (ctx) => (chartType === 'bar' ? 0 : 16),
        font: (ctx) => ({ weight: 'bold', size: chartType === 'bar' ? 11 : 14 }),
        formatter: (value, ctx) => {
          const idx = ctx.dataIndex ?? 0;
          const pct = typeof percentages[idx] === 'number' ? `${percentages[idx]}%` : '';
          return `${value} - ${pct}`.trim();
        },
        display: (ctx) => {
          if (!isPieLike) return true;
          // Hide all datalabels for pie/doughnut on phones
          if (isMobile) return false;
          const idx = ctx.dataIndex ?? 0;
          const pct = percentages[idx];
          if (typeof pct === 'number' && pct < smallSliceThreshold) return false;
          return true;
        },
        clip: false,
      },
      htmlLegend: { container: null, percentages },
    },
  }), [isPieLike, chartType, isMobile, percentages, smallSliceThreshold]);

  return (
    <div className={`chart-row ${isMobile && isPieLike ? 'no-legend' : ''}`}>
      {isPieLike && !isMobile && (
        <div ref={legendRef} className="html-legend legend-grid side-legend" />
      )}
      <div className="chart-wrapper" style={{ height: isMobile && isPieLike ? 220 : undefined }}>
        {chartType === 'bar' && <Bar data={barData} options={baseOptions} />}
        {chartType === 'pie' && (
          <Pie
            data={pieData}
            options={{
              ...baseOptions,
              plugins: {
                ...baseOptions.plugins,
                legend: { display: false },
                htmlLegend: { container: isMobile ? null : legendRef, percentages },
              },
            }}
          />
        )}
        {chartType === 'doughnut' && (
          <Doughnut
            data={pieData}
            options={{
              ...baseOptions,
              plugins: {
                ...baseOptions.plugins,
                legend: { display: false },
                htmlLegend: { container: isMobile ? null : legendRef, percentages },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
