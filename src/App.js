import React, { useState } from 'react';
import bookings from './data/bookings.json';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import './chartConfig/chartJsSetup';
import SideDrawer from './components/SideDrawer';
import Header from './components/Header';
import sheriffLogo from './images/sheriff-logo.webp';

// Define colors for charts
const COLORS = ['#4285F4','#DB4437','#F4B400','#0F9D58','#AB47BC','#00ACC1','#FF7043'];

// Using react-chartjs-2; tooltips/labels configured in options and datalabels plugin

// Custom legend component for pie charts
const CustomLegend = ({ data, chartType }) => {
  const isCircular = chartType === 'pie' || chartType === 'doughnut';

  if (!isCircular) {
    return null; // No custom legend for bar charts
  }

  return (
    <div id="legend-container" className="side-legend">
      {data.map((entry, index) => (
        <div key={`legend-${index}`} className="legend-card">
          <div className="legend-top">
            <div className="legend-label">{entry.race}</div>
          </div>
          <div className="legend-bottom">
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
  const [view, setView] = useState('demographics'); // kept for UI compatibility; charts now show both datasets regardless
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Build stable city list using ids, and a display name for pills/dropdowns
  const cityList = React.useMemo(() => {
    const b = bookings.bookings || [];
    const c = bookings['census-bookings'] || [];
    const byId = new Map();
    const upsert = (row) => {
      if (!row || !row.id) return;
      const name = (row.city || '').toString().replace(/\s+/g, ' ').trim();
      const prev = byId.get(row.id) || { id: row.id, name };
      // prefer a non-empty, trimmed name if available
      const displayName = (prev.name && prev.name.length >= name.length) ? prev.name : name;
      byId.set(row.id, { id: row.id, name: displayName });
    };
    b.forEach(upsert);
    c.forEach(upsert);
    return Array.from(byId.values()).sort((a, d) => a.name.localeCompare(d.name));
  }, []);
  const defaultCityId = (cityList.find(x => /contra\s*costa/i.test(x.name))?.id) || (cityList[0]?.id || '');
  const [selectedCityId, setSelectedCityId] = useState(defaultCityId);
  
  // Build datasets for the selected city from both sources
  const bookingRows = React.useMemo(() => (bookings.bookings || []).filter(b => b.id === selectedCityId), [selectedCityId]);
  const censusRows = React.useMemo(() => (bookings['census-bookings'] || []).filter(b => b.id === selectedCityId), [selectedCityId]);

  const bLabels = React.useMemo(() => bookingRows.map(r => r.race), [bookingRows]);
  const bCounts = React.useMemo(() => bookingRows.map(r => Number(r.bookings) || 0), [bookingRows]);
  const bPercentages = React.useMemo(() => bookingRows.map(r => Number(r.percentage) || 0), [bookingRows]);

  const cLabels = React.useMemo(() => censusRows.map(r => r.race), [censusRows]);
  const cCounts = React.useMemo(() => censusRows.map(r => Number(r.bookings) || 0), [censusRows]);
  const cPercentages = React.useMemo(() => censusRows.map(r => Number(r.percentage) || 0), [censusRows]);
  // Labels for SideDrawer views retained for future use

  // Ensure selectedCity is valid if city list changes
  React.useEffect(() => {
    if (!cityList.some(x => x.id === selectedCityId)) {
      setSelectedCityId(defaultCityId);
    }
  }, [cityList, selectedCityId, defaultCityId]);

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
          {/* City and Chart Type selectors */}
          <div style={{ 
            display: 'flex', 
            gap: window.matchMedia('(max-width: 767px)').matches ? 12 : 24, 
            alignItems: 'flex-end', 
            justifyContent: 'flex-start', 
            marginBottom: 20, 
            flexWrap: 'wrap' 
          }}>
            
            {/* City selector (applies to both charts) */}
            {true && (
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                <h3 className="city-selector-label" style={{ marginBottom: 5, fontWeight: 700, fontSize: 14 }}>Cities</h3>
                
                {/* Pills for tablet/desktop */}
                <div className="city-pills-container">
                  {cityList.map(city => (
                    <button
                      key={city.id}
                      onClick={() => setSelectedCityId(city.id)}
                      className={`city-pill ${selectedCityId === city.id ? 'selected' : ''}`}
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
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 150 }}>
              <label style={{ marginBottom: 5, fontWeight: 700 }}>Chart Type:</label>
              <select style={{ padding: 8, fontSize: 16, position: 'relative', zIndex: 1000 }} value={chartType} onChange={e => setChartType(e.target.value)}>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
                <option value="doughnut">Doughnut</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
            <section>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#112540' }}>Bookings by Race</h2>
              <ChartSwitcher
                view={view}
                chartType={chartType}
                demo={{ labels: bLabels, counts: bCounts, percentages: bPercentages }}
                viewLabel={'Bookings'}
              />
            </section>
            <section>
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

  if (chartType === 'bar') {
    const maxVal = counts.length ? Math.max(...counts) : 0;
    const suggestedMax = Math.ceil(maxVal * 1.12); // headroom for labels above bars
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
          font: { size: 11, weight: 'bold' },
          anchor: 'end',
          align: 'top',
          offset: 4,
          clip: false,
        },
      },
      scales: {
        x: {
          ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
        },
        y: {
          ticks: { callback: (v) => Number(v).toLocaleString() },
          beginAtZero: true,
          suggestedMax,
        },
      },
      layout: { padding: { top: 18, bottom: 20 } },
    };
    return (
      <div style={{ width: '100%', height: '500px' }}>
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
        display: true,
        color: '#112540',
        formatter: (value, context) => {
          const i = context.dataIndex;
          const race = labels[i] || '';
          const val = Number(value || 0).toLocaleString();
          const pct = percentages[i] ?? 0;
          return `${race}\n${val} - ${pct}%`;
        },
        font: { size: isMobile ? 10 : 11, weight: 'bold' },
        align: 'center',
        anchor: 'center',
        clip: false,
      },
    },
    layout: { padding: 6 },
  };

  return (
    <div className="chart-row">
      <CustomLegend data={chartData} chartType={chartType} />
      <figure className={`chart-area ${chartType}-chart`}>
        <div style={{ width: '100%', height: isMobile ? '400px' : '580px' }}>
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