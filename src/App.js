import React, { useState } from 'react';
import './chartConfig/chartJsSetup';
import SideDrawer from './components/SideDrawer';
import MdfBookingsChart from './components/MdfBookingsChart';
import RaceCensusChart from './components/RaceCensusChart';
import Header from './components/Header';
import sheriffLogo from './images/sheriff-logo.webp';
import { CHART_PALETTE } from './chartConfig/colors';
import drawerItems from './config/drawerItems';

// Define colors for charts
const COLORS = CHART_PALETTE;

const ChartFromDataJson = () => {
  const [chartType, setChartType] = useState('bar');
  const [view, setView] = useState('demographics');
  const [dashboard, setDashboard] = useState('bookings');
  const [dashboards, setDashboards] = useState([{ key: 'bookings', label: 'Persons Arrested/Booked / Census', component: 'RaceCensus', data: '/data/arrests-bookings-census.json' }]);
  const SAFE_DEFAULT_DASHBOARDS = React.useMemo(() => (
    [{ key: 'bookings', label: 'Persons Arrested/Booked / Census', component: 'RaceCensus', data: '/data/arrests-bookings-census.json' }]
  ), []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Registry: map manifest component names to React components
  const componentRegistry = React.useMemo(() => ({
    MdfBookingsChart: MdfBookingsChart,
    RaceCensus: (props) => <RaceCensusChart chartType={chartType} {...props} />,
  }), [chartType]);

  // Load dashboards (reports) for the selected SideDrawer view from public/reports/{view}.json
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/reports/${view}.json`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load /reports/${view}.json`);
        const json = await res.json();
        const list = Array.isArray(json.dashboards) ? json.dashboards : [];
        if (!cancelled) {
          const next = list.length ? list : SAFE_DEFAULT_DASHBOARDS;
          setDashboards(next);
          setDashboard(next[0]?.key || 'bookings');
        }
      } catch (e) {
        if (!cancelled) {
          setDashboards(SAFE_DEFAULT_DASHBOARDS);
          setDashboard(SAFE_DEFAULT_DASHBOARDS[0]?.key || 'bookings');
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [view, SAFE_DEFAULT_DASHBOARDS]);

  const sortedDrawerItems = React.useMemo(() => {
    const clone = drawerItems.map(it => ({
      ...it,
      children: Array.isArray(it.children)
        ? [...it.children].sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }))
        : undefined,
    }));
    clone.sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
    return clone;
  }, []);

  const isPhone = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  const headingBottomMarginPx = isPhone && chartType !== 'bar' ? 2 : 8;

  return (
    <>
      <Header logoSrc={sheriffLogo} title="Contra Costa County Sheriff" onMenuToggle={() => setDrawerOpen(v=>!v)} isMenuOpen={drawerOpen} />
      <div className="page-shell">
        <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'nowrap', width: '100%' }}>
          {drawerOpen && (
            <div className="drawer-backdrop show" role="presentation" onClick={() => setDrawerOpen(false)} aria-hidden={!drawerOpen} />
          )}
          <SideDrawer
            items={sortedDrawerItems}
            selected={view}
            onSelect={(k)=>{setView(k); setDrawerOpen(false);}}
            className={`app-drawer ${drawerOpen ? 'is-open' : ''}`}
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
          <main id="main" className="app-container" role="main" aria-live="polite" style={{ flex: '1 1 auto', minWidth: 0, margin: 0 }}>
            <div style={{ display: 'flex', gap: window.matchMedia('(max-width: 767px)').matches ? 12 : 24, alignItems: 'flex-end', justifyContent: 'flex-start', marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
                <label htmlFor="dashboardSelect" style={{ marginBottom: 5, fontWeight: 700 }}>Select Dashboard:</label>
                <select id="dashboardSelect" style={{ padding: 8, fontSize: 16, position: 'relative', zIndex: 1000 }} value={dashboard} onChange={(e) => setDashboard(e.target.value)}>
                  {dashboards.map(item => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                <label style={{ margin: '0 0 5px', fontWeight: 700 }}>Chart Type:</label>
                <div className="chart-type-pills" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['bar', 'pie', 'doughnut'].map(t => (
                    <button key={t} type="button" onClick={() => setChartType(t)} className={`city-pill ${chartType === t ? 'selected' : ''}`} aria-pressed={chartType === t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(() => {
              const selected = dashboards.find(d => d.key === dashboard) || dashboards[0];
              const Comp = componentRegistry[selected?.component] || MdfBookingsChart;
              return (
                <section className="chart-card" style={{ width: '100%' }}>
                  <h2 style={{ margin: `0 0 ${headingBottomMarginPx}px`, fontSize: 18, color: '#112540' }}>
                    {selected?.label || 'Report'}
                  </h2>
                  <Comp datasetKey={selected?.datasetKey || dashboard} dataUrl={selected?.data} />
                </section>
              );
            })()}
          </main>
        </div>
      </div>
    </>
  );
};

export default ChartFromDataJson;