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
  // Default view will be replaced after views manifest loads
  const [view, setView] = useState('arrests-bookings-census');
  // Master list of dashboards across all views
  const [allDashboards, setAllDashboards] = useState([]);
  // Selected dashboard (composite id: `${viewKey}:${dashKey}`)
  const [selectedDashId, setSelectedDashId] = useState('');

  // Backward-compatible defaults if manifests fail
  const SAFE_DEFAULT_DASHBOARDS = React.useMemo(() => (
    [
      { id: 'arrests-bookings-census:bookings', viewKey: 'arrests-bookings-census', viewLabel: 'Persons Arrested/Booked & Census Data', key: 'bookings', label: 'Persons Arrested/Booked / Census', component: 'RaceCensus', data: '/data/arrests-bookings-census.json' },
      { id: 'custody-services-bureau:mdf-bookings', viewKey: 'custody-services-bureau', viewLabel: 'Custody Services Bureau', key: 'mdf-bookings', label: 'Total # of MDF Bookings', component: 'MdfBookingsChart', data: '/data/mdfBookings.json', datasetKey: 'mdf-bookings' },
      { id: 'custody-services-bureau:custody-alternative-bookings', viewKey: 'custody-services-bureau', viewLabel: 'Custody Services Bureau', key: 'custody-alternative-bookings', label: 'Total # of Custody Alternative Bookings', component: 'MdfBookingsChart', data: '/data/mdfBookings.json', datasetKey: 'custody-alternative-bookings' },
    ]
  ), []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  // Registry: map manifest component names to React components
  const componentRegistry = React.useMemo(() => ({
    MdfBookingsChart: MdfBookingsChart,
    RaceCensus: (props) => <RaceCensusChart chartType={chartType} {...props} />,
  }), [chartType]);

  // Load views and per-view dashboard manifests, aggregating into a master list
  React.useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      try {
        const res = await fetch('/reports/views.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('views.json not found');
        const vjson = await res.json();
        const views = Array.isArray(vjson.views) ? vjson.views : [];
        // Fetch each view's manifest in parallel
        const results = await Promise.all(views.map(async (v) => {
          try {
            const mr = await fetch(v.manifest, { cache: 'no-store' });
            if (!mr.ok) throw new Error('manifest load failed');
            const mj = await mr.json();
            const list = Array.isArray(mj.dashboards) ? mj.dashboards : [];
            return list.map(d => ({
              id: `${v.key}:${d.key}`,
              viewKey: v.key,
              viewLabel: v.label,
              key: d.key,
              label: d.label,
              component: d.component,
              data: d.data,
              datasetKey: d.datasetKey,
            }));
          } catch {
            return [];
          }
        }));
        const flat = results.flat();
        if (!cancelled) {
          const all = flat.length ? flat : SAFE_DEFAULT_DASHBOARDS;
          setAllDashboards(all);
          // Initialize selection: if current view has dashboards, pick first; else pick first overall
          const firstForView = all.find(d => d.viewKey === view) || all[0];
          setSelectedDashId(firstForView?.id || '');
        }
      } catch (e) {
        if (!cancelled) {
          setAllDashboards(SAFE_DEFAULT_DASHBOARDS);
          setSelectedDashId(SAFE_DEFAULT_DASHBOARDS[0].id);
        }
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, [SAFE_DEFAULT_DASHBOARDS, view]);

  // When SideDrawer view changes, select the first dashboard for that view in the dropdown
  React.useEffect(() => {
    if (!allDashboards.length) return;
    const match = allDashboards.find(d => d.viewKey === view);
    if (match) setSelectedDashId(match.id);
  }, [view, allDashboards]);

  // Compute sorted drawer items (leave as-is)
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

  // Current selected dashboard object
  const selectedDash = React.useMemo(() => allDashboards.find(d => d.id === selectedDashId) || allDashboards[0], [allDashboards, selectedDashId]);
  const SelectedComp = selectedDash ? (componentRegistry[selectedDash.component] || MdfBookingsChart) : MdfBookingsChart;

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
            onSelect={(k)=>{ setView(k); setDrawerOpen(false); }}
            className={`app-drawer ${drawerOpen ? 'is-open' : ''}`}
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
          <main id="main" className="app-container" role="main" aria-live="polite" style={{ flex: '1 1 auto', minWidth: 0, margin: 0 }}>
            <div style={{ display: 'flex', gap: window.matchMedia('(max-width: 767px)').matches ? 12 : 24, alignItems: 'flex-end', justifyContent: 'flex-start', marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 280 }}>
                <label htmlFor="dashboardSelect" style={{ marginBottom: 5, fontWeight: 700 }}>Select Dashboard:</label>
                <select
                  id="dashboardSelect"
                  style={{ padding: 8, fontSize: 16, position: 'relative', zIndex: 1000 }}
                  value={selectedDashId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedDashId(nextId);
                    const target = allDashboards.find(d => d.id === nextId);
                    if (target) setView(target.viewKey);
                  }}
                >
                  {allDashboards.map(item => (
                    <option key={item.id} value={item.id}>{item.label}</option>
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

            {selectedDash && (
              <section className="chart-card" style={{ width: '100%' }}>
                <h2 style={{ margin: `0 0 ${headingBottomMarginPx}px`, fontSize: 18, color: '#112540' }}>
                  {selectedDash.label}
                </h2>
                <SelectedComp datasetKey={selectedDash.datasetKey} dataUrl={selectedDash.data} />
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default ChartFromDataJson;