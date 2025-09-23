import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../chartConfig/chartJsSetup';
import { CHART_PALETTE } from '../chartConfig/colors';
import staticData from '../data/mdfBookings.json';

const COLORS = CHART_PALETTE;

export default function MdfBookingsChart({ datasetKey, dataUrl }) {
  const [payload, setPayload] = React.useState(staticData);
  const [selectedKey, setSelectedKey] = React.useState(
    datasetKey || staticData.datasets?.[0]?.key || 'mdf-bookings'
  );

  // Optionally fetch data from a URL provided by the manifest; fallback to static import
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!dataUrl) return;
      try {
        const res = await fetch(dataUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
        const json = await res.json();
        if (!cancelled) setPayload(json);
      } catch (e) {
        // keep static data on failure
      }
    };
    load();
    return () => { cancelled = true; };
  }, [dataUrl]);

  // Keep internal selection in sync if parent changes the datasetKey
  React.useEffect(() => {
    if (!datasetKey) return;
    const exists = (payload.datasets || staticData.datasets).some(d => d.key === datasetKey);
    if (exists) setSelectedKey(datasetKey);
  }, [datasetKey, payload]);

  const datasetsBag = payload?.datasets || staticData.datasets;
  const current = React.useMemo(
    () => datasetsBag.find((d) => d.key === selectedKey) || datasetsBag[0],
    [selectedKey, datasetsBag]
  );

  const labels = current?.periods || [];
  const datasets = (current?.series || []).map((s, i) => ({
    label: s.name,
    data: s.data,
    backgroundColor: COLORS[i % COLORS.length],
    borderColor: COLORS[i % COLORS.length],
    borderWidth: 0,
    borderRadius: 4,
  }));

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y || 0).toLocaleString()}`,
        },
      },
      datalabels: {
        display: true,
        color: '#112540',
        formatter: (value) => Number(value || 0).toLocaleString(),
        font: { size: 10, weight: 'bold' },
        anchor: 'end',
        align: 'top',
        offset: 1,
        clip: false,
      },
    },
    scales: {
      x: { ticks: { font: { size: 10 } } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => Number(v).toLocaleString(), font: { size: 10 } },
      },
    },
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
          <label htmlFor="datasetSelect" style={{ marginBottom: 4, fontWeight: 700 }}>
            Select Dataset:
          </label>
          <select
            id="datasetSelect"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            style={{ padding: 8, fontSize: 14 }}
          >
            {datasetsBag.map((d) => (
              <option key={d.key} value={d.key}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ width: '100%', height: '360px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
