import React, { useState } from 'react';
import bookings from './data/bookings.json';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import './chartConfig/chartJsSetup';
import SideDrawer from './components/SideDrawer';
import Header from './components/Header';
import sheriffLogo from './images/sheriff-logo.webp';
import { CHART_PALETTE } from './chartConfig/colors';

// Define colors for charts
const COLORS = CHART_PALETTE;

// Custom legend component for all charts (now placed left via CSS on tablet/desktop)
const CustomLegend = ({ data, chartType }) => {
  // We now show the legend for bar, pie, and doughnut
  return (
    <div className="legend-grid side-legend">
      {data.map((entry, index) => (
        <div key={`legend-${index}`} className="legend-card">
          <div className="legend-top">
            <div className="legend-label">{entry.race}</div>
          </div>
          <div className="legend-bottom legend-stack">
            <div
              className="legend-swatch"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="legend-value">
              {entry.bookings.toLocaleString()} - {entry.percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ChartFromDataJson = () => {
  const [chartType, setChartType] = useState('bar');
  const [view, setView] = useState('demographics'); // SideDrawer section selection
  const [dashboard, setDashboard] = useState('bookings'); // Top-level dashboard selector (future expansion)
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Helper to normalize city names for deduplication and filtering
  const normalizeCity = React.useCallback((name) => (name || '').toString().toLowerCase().replace(/\s+/g, ' ').trim(), []);
  // Build deduplicated city list using normalized city name as key
  const cityList = React.useMemo(() => {
    const b = bookings.bookings || [];
    const c = bookings['census-bookings'] || [];
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
        // prefer the longer, more descriptive name
        const displayName = prev.name.length >= name.length ? prev.name : name;
        byKey.set(key, { key, name: displayName });
      }
    };
    b.forEach(upsert);
    c.forEach(upsert);
    return Array.from(byKey.values()).sort((a, d) => a.name.localeCompare(d.name));
  }, [normalizeCity]);
  const defaultCityKey = (cityList.find(x => /contra\s*costa/i.test(x.name))?.key) || (cityList[0]?.key || '');
  const [selectedCityId, setSelectedCityId] = useState(defaultCityKey);
  
  // Build datasets for the selected city from both sources
  const bookingRows = React.useMemo(
    () => (bookings.bookings || []).filter(b => normalizeCity(b.city) === selectedCityId),
    [selectedCityId, normalizeCity]
  );
  const censusRows = React.useMemo(
    () => (bookings['census-bookings'] || []).filter(b => normalizeCity(b.city) === selectedCityId),
    [selectedCityId, normalizeCity]
  );

  const bLabels = React.useMemo(() => bookingRows.map(r => r.race), [bookingRows]);
  const bCounts = React.useMemo(() => bookingRows.map(r => Number(r.bookings) || 0), [bookingRows]);
  const bPercentages = React.useMemo(() => bookingRows.map(r => Number(r.percentage) || 0), [bookingRows]);

  const cLabels = React.useMemo(() => censusRows.map(r => r.race), [censusRows]);
  const cCounts = React.useMemo(() => censusRows.map(r => Number(r.bookings) || 0), [censusRows]);
  const cPercentages = React.useMemo(() => censusRows.map(r => Number(r.percentage) || 0), [censusRows]);
  // Dashboard options (census removed; add more later)
  const dashboards = [
    { key: 'bookings', label: 'Persons Arrested/Booked / Census' },
  ];
  // Labels for SideDrawer views retained for future use

  // Ensure selectedCity is valid if city list changes
  React.useEffect(() => {
    if (!cityList.some(x => x.key === selectedCityId)) {
      setSelectedCityId(defaultCityKey);
    }
  }, [cityList, selectedCityId, defaultCityKey]);

  // Lock body scroll when the mobile drawer is open
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const original = document.body.style.overflow;
    if (drawerOpen && mq.matches) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original || '';
    }
    return () => { document.body.style.overflow = original || ''; };
  }, [drawerOpen]);

  // Ensure drawer closes automatically when switching to desktop widths
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 961px)');
    const handle = () => {
      if (mq.matches) setDrawerOpen(false);
    };
    handle();
    mq.addEventListener?.('change', handle);
    return () => mq.removeEventListener?.('change', handle);
  }, []);


  const drawerItems = [
    { key: 'demographics', label: 'Demographics' },
    { key: 'ice', label: 'ICE ACCESS INFORMATION' },
    { key: 'arrests', label: 'Arrest Data by City of Residence' },
    { key: 'adp', label: 'Average Daily Population' },
    { key: 'requests', label: 'Total Requests made' },
  ];

  
  return (
    <>
      <Header logoSrc={sheriffLogo} title="Contra Costa County Sheriff" onMenuToggle={() => setDrawerOpen(v=>!v)} isMenuOpen={drawerOpen} />
      <div className="page-shell">
        <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'nowrap', width: '100%' }}>
        {/* Backdrop for mobile overlay (rendered only when open) */}
        {drawerOpen && (
          <div
            className="drawer-backdrop show"
            role="presentation"
            onClick={() => setDrawerOpen(false)}
            aria-hidden={!drawerOpen}
          />
        )}
        <SideDrawer
          items={drawerItems}
          selected={view}
          onSelect={(k)=>{setView(k); setDrawerOpen(false);}}
          className={`app-drawer ${drawerOpen ? 'is-open' : ''}`}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <main id="main" className="app-container" role="main" aria-live="polite" style={{ flex: '1 1 auto', minWidth: 0, margin: 0 }}>
          {/* Dashboard, City and Chart Type selectors */}
          <div style={{ 
            display: 'flex', 
            gap: window.matchMedia('(max-width: 767px)').matches ? 12 : 24, 
            alignItems: 'flex-end', 
            justifyContent: 'flex-start', 
            marginBottom: 20, 
            flexWrap: 'wrap' 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
              <label htmlFor="dashboardSelect" style={{ marginBottom: 5, fontWeight: 700 }}>Select Dashboard:</label>
              <select
                id="dashboardSelect"
                style={{ padding: 8, fontSize: 16, position: 'relative', zIndex: 1000 }}
                value={dashboard}
                onChange={(e) => setDashboard(e.target.value)}
              >
                {dashboards.map(item => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Chart Type pills to the right of the Select Dashboard dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
              <label style={{ margin: '0 0 5px', fontWeight: 700 }}>Chart Type:</label>
              <div className="chart-type-pills" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['bar', 'pie', 'doughnut'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setChartType(t)}
                    className={`city-pill ${chartType === t ? 'selected' : ''}`}
                    aria-pressed={chartType === t}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* City selector (applies to both charts) */}
            {true && (
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                <h3 className="city-selector-label" style={{ marginBottom: 5, fontWeight: 700, fontSize: 14 }} />
                
                {/* Pills for tablet/desktop */}
                <div className="city-pills-container">
                  {cityList.map(city => (
                    <button
                      key={city.key}
                      onClick={() => setSelectedCityId(city.key)}
                      className={`city-pill ${selectedCityId === city.key ? 'selected' : ''}`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
                
                {/* Select dropdown for mobile */}
                <select 
                  className="city-select-dropdown"
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  style={{ padding: 8, fontSize: 16 }}
                >
                  {cityList.map(city => (
                    <option key={city.key} value={city.key}>{city.name}</option>
                  ))}
                </select>
              </div>
            )}
            
          </div>
          
          <div className="two-col-charts">
            <section className="chart-card">
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#112540' }}>Bookings by Race</h2>
              <ChartSwitcher
                view={view}
                chartType={chartType}
                demo={{ labels: bLabels, counts: bCounts, percentages: bPercentages }}
                viewLabel={'Bookings'}
              />
            </section>
            <section className="chart-card">
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#112540' }}>Census by Race</h2>
              <ChartSwitcher
                view={view}
                chartType={chartType}
                demo={{ labels: cLabels, counts: cCounts, percentages: cPercentages }}
                viewLabel={'Census'}
              />
            </section>
          </div>
        </main>
        </div>
      </div>
    </>
  );
};

function ChartSwitcher({ view, chartType, demo, viewLabel }) {
  const { labels, counts, percentages } = demo;
  
  // Unified data structure for legend and charts
  const chartData = labels.map((label, index) => ({
    race: label,
    bookings: counts[index] || 0,
    percentage: percentages[index] || 0
  }));
  // Media query for responsive label decisions
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const isTwoCol = window.matchMedia('(min-width: 600px)').matches; // matches our CSS breakpoint

  if (chartType === 'bar') {
    const maxVal = counts.length ? Math.max(...counts) : 0;
  const suggestedMax = Math.ceil(maxVal * 1.06); // tighter headroom for shorter height
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
              const pct = (percentages[i] ?? 0);
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
        x: {
          ticks: { autoSkip: false, maxRotation: 20, minRotation: 0, font: { size: 10 } },
        },
        y: {
          ticks: { callback: (v) => Number(v).toLocaleString(), font: { size: 10 } },
          beginAtZero: true,
          suggestedMax,
        },
      },
      layout: { padding: { top: 6, bottom: 8 } },
    };
    return (
      <div style={{ width: '100%', height: isMobile ? '320px' : (isTwoCol ? '380px' : '500px') }}>
        <Bar data={data} options={options} />
      </div>
    );
  }

  // For pie and doughnut charts
  // isMobile already computed above
  const data = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 0,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // Keep built-in legend hidden; we render our own external legend
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
        // Increase non-bar chart label font sizes for better readability
        font: { size: (isMobile || isTwoCol) ? 18 : 14, weight: '' },
        align: 'center',
        anchor: 'center',
        clip: false,
      },
    },
    layout: { padding: 2 },
  };

  return (
    <div className="chart-row">
      {/* Place legend first so it occupies the left column on phones */}
      <CustomLegend data={chartData} chartType={chartType} />
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

export default ChartFromDataJson;