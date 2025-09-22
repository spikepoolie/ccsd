import React, { useMemo, useRef } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { registerBaseChartJS, htmlLegendPlugin } from '../chartConfig/chartJsSetup';
import { CHART_PALETTE } from '../chartConfig/colors';
import '../styles/chart.css';

registerBaseChartJS();

export default function DemographicsChart({ labels, counts, percentages, chartType, threshold = 5, percentOnlySmall = false }) {
  const legendRef = useRef(null);
  const isPieLike = chartType === 'pie' || chartType === 'doughnut';
  const smallSliceThreshold = threshold; // configurable

  const barData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Count',
        data: counts,
        backgroundColor: '#4285F4',
      }
    ]
  }), [labels, counts]);

  const pieData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Count',
        data: counts,
        backgroundColor: CHART_PALETTE,
      }
    ]
  }), [labels, counts]);

  const baseOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 64, bottom: 12 }
    },
    plugins: {
      legend: {
        display: !isPieLike,
        position: 'top',
        labels: { padding: 20 }
      },
      title: {
        display: true,
        text: 'Demographics Chart from data.json',
        padding: { top: 8, bottom: 12 }
      },
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
        anchor: (ctx) => {
          if (chartType === 'bar') return 'center';
          const meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
          const el = meta?.data?.[ctx.dataIndex];
          const props = el?.getProps(['x','y'], true) || {};
          const nearTop = props.y != null && props.y < (ctx.chart.chartArea.top + 36);
          return nearTop ? 'center' : 'end';
        },
        align: (ctx) => {
          if (chartType === 'bar') return 'center';
          const meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
          const el = meta?.data?.[ctx.dataIndex];
          const props = el?.getProps(['x','y'], true) || {};
          const nearTop = props.y != null && props.y < (ctx.chart.chartArea.top + 36);
          return nearTop ? 'center' : 'end';
        },
        offset: (ctx) => {
          if (chartType === 'bar') return 0;
          const meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
          const el = meta?.data?.[ctx.dataIndex];
          const props = el?.getProps(['x','y'], true) || {};
          const nearTop = props.y != null && props.y < (ctx.chart.chartArea.top + 36);
          return nearTop ? 0 : 16;
        },
        // Increase font size for non-bar charts (pie/doughnut)
        font: (ctx) => ({ weight: 'bold', size: chartType === 'bar' ? 11 : 14 }),
        formatter: (value, ctx) => {
          const idx = ctx.dataIndex ?? 0;
          const pct = typeof percentages[idx] === 'number' ? `${percentages[idx]}%` : '';
          return `${value} - ${pct}`.trim();
        },
        display: (ctx) => {
          // Always display for bar; for pie/doughnut hide small slices to reduce clutter
          if (!isPieLike) return true;
          const idx = ctx.dataIndex ?? 0;
          const pct = percentages[idx];
          if (typeof pct === 'number' && pct < smallSliceThreshold) return false;
          return true;
        },
        clip: false,
      },
      htmlLegend: {
        container: isPieLike ? null : null,
        percentages,
      }
    },
  }), [isPieLike, chartType, percentages]);

  return (
    <>
  {isPieLike && <div ref={legendRef} className="html-legend" />}
      <div className="chart-wrapper">
        {chartType === 'bar' && <Bar data={barData} options={baseOptions} />}
        {chartType === 'pie' && (
          <Pie data={pieData} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false }, htmlLegend: { container: legendRef, percentages } } }} />
        )}
        {chartType === 'doughnut' && (
          <Doughnut data={pieData} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false }, htmlLegend: { container: legendRef, percentages } } }} />
        )}
      </div>
    </>
  );
}
