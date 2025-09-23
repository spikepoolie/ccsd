import React from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import '../chartConfig/chartJsSetup';
import { CHART_PALETTE } from '../chartConfig/colors';

const COLORS = CHART_PALETTE;

function CustomLegend({ data }) {
  return (
    <div className="legend-grid side-legend">
      {data.map((entry, index) => (
        <div key={`legend-${index}`} className="legend-card">
          <div className="legend-top">
            <div className="legend-label">{entry.race}</div>
          </div>
          <div className="legend-bottom legend-stack">
            <div className="legend-swatch" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <div className="legend-value">
              {entry.bookings.toLocaleString()} - {entry.percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartSwitcher({ chartType, demo, legendRight = false }) {
  const { labels, counts, percentages } = demo;
  const empty = !labels || labels.length === 0 || !counts || counts.length === 0;
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const isTwoCol = typeof window !== 'undefined' && window.matchMedia('(min-width: 600px)').matches;

  if (empty) {
    return (
      <div className={`chart-row ${legendRight ? 'legend-right' : ''}`}>
        <figure className={`chart-area ${chartType}-chart`}>
          <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', background: '#f9fafb', border: '1px dashed #e5e7eb', borderRadius: 8 }}>
            No data to display
          </div>
        </figure>
      </div>
    );
  }

  const chartData = labels.map((label, index) => ({
    race: label,
    bookings: counts[index] || 0,
    percentage: percentages[index] || 0,
  }));

  if (chartType === 'bar') {
    const maxVal = counts.length ? Math.max(...counts) : 0;
    const suggestedMax = Math.ceil(maxVal * 1.06);
    const data = {
      labels,
      datasets: [
        {
          label: 'Bookings',
          data: counts,
          backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
          borderColor: labels.map((_, i) => COLORS[i % COLORS.length]),
          hoverBackgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = Number(ctx.parsed.y || 0).toLocaleString();
              const i = ctx.dataIndex ?? 0;
              const pct = percentages[i] ?? 0;
              const base = `${v} - ${pct}%`;
              return ctx.dataset.label ? `${ctx.dataset.label}: ${base}` : base;
            },
          },
        },
        datalabels: {
          display: true,
          color: '#112540',
          formatter: (value, context) => {
            const i = context.dataIndex;
            const val = Number(value || 0).toLocaleString();
            const pct = percentages[i] ?? 0;
            return `${val} - ${pct}%`;
          },
          font: { size: (isTwoCol || isMobile) ? 8 : 10, weight: 'bold' },
          anchor: 'end',
          align: 'top',
          offset: 1,
          clip: false,
        },
      },
      scales: {
        x: { ticks: { autoSkip: false, maxRotation: 20, minRotation: 0, font: { size: 10 } } },
        y: { ticks: { callback: (v) => Number(v).toLocaleString(), font: { size: 10 } }, beginAtZero: true, suggestedMax },
      },
      layout: { padding: { top: 6, bottom: 8 } },
    };
    return (
      <div style={{ width: '100%', height: isMobile ? '320px' : (isTwoCol ? '380px' : '500px') }}>
        <Bar data={data} options={options} />
      </div>
    );
  }

  const data = {
    labels,
    datasets: [{ data: counts, backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 0 }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const i = ctx.dataIndex;
            const val = Number(ctx.parsed || 0).toLocaleString();
            const pct = percentages[i] ?? 0;
            return `${labels[i]}: ${val} (${pct}%)`;
          },
        },
      },
      datalabels: {
        display: !isMobile,
        color: '#ffffff',
        formatter: (value, context) => {
          const i = context.dataIndex;
          const race = labels[i] || '';
          const val = Number(value || 0).toLocaleString();
          const pct = percentages[i] ?? 0;
          return `${race}\n${val} - ${pct}%`;
        },
        font: { size: (isMobile || isTwoCol) ? 18 : 14, weight: '' },
        align: 'center',
        anchor: 'center',
        clip: false,
      },
    },
    layout: { padding: 2 },
  };

  return (
    <div className={`chart-row ${legendRight ? 'legend-right' : ''}`}>
      {chartType !== 'bar' && <CustomLegend data={chartData} />}
      <figure className={`chart-area ${chartType}-chart`}>
        <div style={{ width: '100%', height: isMobile ? '255px' : (isTwoCol ? '380px' : '520px') }}>
          {chartType === 'doughnut' ? (
            <Doughnut data={data} options={options} />
          ) : (
            <Pie data={data} options={options} />
          )}
        </div>
      </figure>
    </div>
  );
}

export default function RaceCensusChart({ dataUrl = '/data/arrests-bookings-census.json', chartType = 'bar' }) {
  const [payload, setPayload] = React.useState(null);
  const [selectedYear, setSelectedYear] = React.useState('');
  const [selectedCityId, setSelectedCityId] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(dataUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
        const json = await res.json();
        if (!cancelled) setPayload(json);
      } catch (e) {
        // swallow
      }
    };
    load();
    return () => { cancelled = true; };
  }, [dataUrl]);

  const hasByYear = !!(payload && payload.byYear);
  const availableYears = React.useMemo(
    () => hasByYear ? Object.keys(payload.byYear).sort() : [],
    [hasByYear, payload]
  );
  React.useEffect(() => {
    if (!hasByYear) return;
    const def = String(payload.defaultYear ?? availableYears[0] ?? '');
    setSelectedYear((prev) => prev || def);
  }, [hasByYear, payload, availableYears]);

  const dataRoot = React.useMemo(() => {
    if (!payload) return {};
    if (!hasByYear) return payload || {};
    const def = String(payload.defaultYear ?? availableYears[0] ?? '');
    return payload.byYear[selectedYear || def] || payload.byYear[def] || {};
  }, [payload, hasByYear, selectedYear, availableYears]);

  const normalizeCity = React.useCallback((name) => (name || '').toString().toLowerCase().replace(/\s+/g, ' ').trim(), []);

  const cityList = React.useMemo(() => {
    const b = dataRoot.bookings || [];
    const c = dataRoot['census-bookings'] || [];
    const byKey = new Map();
    const upsert = (row) => {
      if (!row) return;
      const raw = (row.city || '').toString();
      const name = raw.replace(/\s+/g, ' ').trim();
      const key = normalizeCity(raw);
      if (!key) return;
      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, { key, name });
      } else {
        const displayName = prev.name.length >= name.length ? prev.name : name;
        byKey.set(key, { key, name: displayName });
      }
    };
    b.forEach(upsert);
    c.forEach(upsert);
    return Array.from(byKey.values()).sort((a, d) => a.name.localeCompare(d.name));
  }, [dataRoot, normalizeCity]);

  React.useEffect(() => {
    const def = (cityList.find(x => /contra\s*costa/i.test(x.name))?.key) || (cityList[0]?.key || '');
    setSelectedCityId((prev) => prev || def);
  }, [cityList]);

  const bookingRows = React.useMemo(
    () => (dataRoot.bookings || []).filter(b => normalizeCity(b.city) === selectedCityId),
    [dataRoot, selectedCityId, normalizeCity]
  );
  const censusRows = React.useMemo(
    () => (dataRoot['census-bookings'] || []).filter(b => normalizeCity(b.city) === selectedCityId),
    [dataRoot, selectedCityId, normalizeCity]
  );

  const bLabels = React.useMemo(() => bookingRows.map(r => r.race), [bookingRows]);
  const bCounts = React.useMemo(() => bookingRows.map(r => Number(r.bookings) || 0), [bookingRows]);
  const bPercentages = React.useMemo(() => bookingRows.map(r => Number(r.percentage) || 0), [bookingRows]);

  const cLabels = React.useMemo(() => censusRows.map(r => r.race), [censusRows]);
  const cCounts = React.useMemo(() => censusRows.map(r => Number(r.bookings) || 0), [censusRows]);
  const cPercentages = React.useMemo(() => censusRows.map(r => Number(r.percentage) || 0), [censusRows]);

  const hasCensusForCity = React.useMemo(() => {
    if (bookingRows && bookingRows.length) {
      const anyTrue = bookingRows.some(r => r && r.hasCensus === true);
      const allFalse = bookingRows.every(r => r && r.hasCensus === false);
      if (anyTrue) return true;
      if (allFalse) return false;
    }
    return (censusRows && censusRows.length > 0);
  }, [bookingRows, censusRows]);

  const isPhone = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  const tightNonBarPhone = isPhone && chartType !== 'bar';
  const headingBottomMarginPx = tightNonBarPhone ? 2 : 8;
  const singleColNoCensus = !hasCensusForCity;
  const legendRight = !isPhone && chartType !== 'bar' && !hasCensusForCity;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
        {hasByYear && (
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
            <label htmlFor="yearSelectRC" style={{ marginBottom: 5, fontWeight: 700 }}>Year:</label>
            <select id="yearSelectRC" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: 8, fontSize: 16 }}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
          <label className="city-selector-label" style={{ marginBottom: 5, fontWeight: 700, fontSize: 14 }}>Select Agency</label>
          <div className="city-pills-container">
            {cityList.map(city => (
              <button key={city.key} onClick={() => setSelectedCityId(city.key)} className={`city-pill ${selectedCityId === city.key ? 'selected' : ''}`}>
                {city.name}
              </button>
            ))}
          </div>
          <select className="city-select-dropdown" value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)} style={{ padding: 8, fontSize: 16 }}>
            {cityList.map(city => <option key={city.key} value={city.key}>{city.name}</option>)}
          </select>
        </div>
      </div>

      <div className={`two-col-charts ${tightNonBarPhone ? 'tight-nonbar-phone' : ''} ${singleColNoCensus ? 'single-col' : ''}`}>
        <section className="chart-card">
          <h2 style={{ margin: `0 0 ${headingBottomMarginPx}px`, fontSize: 18, color: '#112540' }}>Bookings by Race</h2>
          <ChartSwitcher chartType={chartType} demo={{ labels: bLabels, counts: bCounts, percentages: bPercentages }} legendRight={legendRight} />
        </section>
        {hasCensusForCity && (
          <section className="chart-card">
            <h2 style={{ margin: `0 0 ${headingBottomMarginPx}px`, fontSize: 18, color: '#112540' }}>Census by Race</h2>
            <ChartSwitcher chartType={chartType} demo={{ labels: cLabels, counts: cCounts, percentages: cPercentages }} />
          </section>
        )}
      </div>
    </div>
  );
}
