import React, { useState } from 'react';
import SideDrawer from './components/SideDrawer';
import MdfBookingsChart from './components/MdfBookingsChart';
import RaceCensusChart from './components/RaceCensusChart';
import Header from './components/Header';
import sheriffLogo from './images/sheriff-logo.webp';
import { CHART_PALETTE } from './chartConfig/colors';

const ChartFromDataJson = () => {
  const [chartType, setChartType] = useState('bar');
  const [view, setView] = useState('bookings'); // SideDrawer section selection
  const [dashboard, setDashboard] = useState('bookings'); // Selected report within current view
  const [dashboards, setDashboards] = useState([{ key: 'bookings', label: 'Persons Arrested/Booked / Census' }]);
  const SAFE_DEFAULT_DASHBOARDS = React.useMemo(() => (
    [{ key: 'bookings', label: 'Persons Arrested/Booked / Census' }]
  ), []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Registry: map manifest component names to React components
  const componentRegistry = React.useMemo(() => ({
    MdfBookingsChart: MdfBookingsChart,
    RaceCensus: RaceCensusChart,
  }), []);
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
          // Fallback if file not present or failed to load: always show safe default
          setDashboards(SAFE_DEFAULT_DASHBOARDS);
          setDashboard(SAFE_DEFAULT_DASHBOARDS[0]?.key || 'bookings');
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [view]);
  // Labels for SideDrawer views retained for future use

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
    {
      id: 1,
      key: 'custody-services-bureau',
      label: 'Custody Services Bureau',
      children: [
        { key: 'mdf-bookings', label: '# MDF Bookings' },
        { key: 'custody-alternative-bookings', label: '# Custody Alternative Bookings' },
      ],
    },
    { id: 2,key: 'arrests-bookings-census', label: 'Persons Arrested/Booked & Census Data' },
    { id: 3, key: 'felony-race-percentage', label: 'Prior Felony by Race & % of Jail Pop.' },
    { id: 4, key: 'custody-alternative', label: 'Custody Alternative Facility' },
    { id: 5, key: 'operating-costs', label: 'FY 23/24 Operating Costs vs Detention' },
    {
      id: 6,
      key: 'custody-services-bureau',
      label: '# Custody Services Bureau',
      children: [
        { key: 'number-bookings-agency', label: 'Total Number of Bookings by Agency' },
        { key: 'bookings-by-gender', label: 'Bookings by Gender' },
        { key: 'average-daily-population', label: 'Average Daily Population' },
        { key: 'average-pre-post-trial', label: 'Average Pre and Post Trial Population' },
        { key: 'in-custody-deaths', label: 'In-Custody Deaths' },
        { key: 'norcan-deployments', label: 'Norcan Deployments' },
        { key: 'assaults-on-staff', label: 'Assaults on Staff' },
        { key: 'notification-received-results', label: 'Total Requests for Notification Received' },
        { key: 'notification-made-results', label: 'Total Requests for Notification Made' },
        { key: 'notification-same-person-results', label: 'Notificaion on the Same Person' },
        { key: 'net-notification', label: 'Net Notification Made' },
      ],
    },
    { id: 7, key: 'field-operation-bureau', label: 'Field Operation Bureau',
    children: [
        { key: 'total-dispatch-call-service', label: 'Total Number of Dispatch Calls for Service' },
        { key: 'total-office-sheriff', label: 'Total Office of the Sheriff Personnel' },
        { key: 'assaults-staff', label: 'Assaults on Staff' },
        { key: 'a3', label: 'A3 (Anyone, Anywhere, Anytime) Requests' },
        { key: 'a3-responses', label: 'A3 Responses' },
        { key: 'mental-health-evaluation', label: 'Mental Health Evaluation Team Deployments' },
        { key: 'welfare-institutions-code-5150', label: 'Total Welfare & Institutions Code 5150 Calls' },
        { key: 'non-violent-welfare', label: 'Non-Violent Welfare & Institutions Code 5150 Calls' },
        { key: 'violent-welfare', label: 'Violent Welfare & Institutions Code 5150 Calls' },
        { key: 'writ-possession', label: 'Writ of Possession of Real Property with Tenant Removal' },
        { key: 'tenant-removal', label: 'Tenant Removal' },
    ] },
    { id: 8, key: 'support-bureau', label: 'Support Bureau',
       children: [
        { key: 'total-coroners-cases', label: 'Total Number of Coroners Cases' },
        { key: 'total-autopsies', label: 'Total Number of Autopsies' },
        { key: 'fentanyl-deaths', label: 'Total Number of Fentanul Related Deaths' },
        { key: 'suicide-deaths', label: 'Total Number of Suicide Deaths' },
    ] },
    { id: 9, key: 'administration-services-bureau', label: 'Administration Bureau',
      children: [
        { key: 'internal-affairs', label: 'Internal Affairs Investigations Initiated' },
        { key: 'use-of-force', label: 'Total Number of Use of Force Incidents reported to State DOJ*' },
        { key: 'number-ccw', label: 'Number of CCW Processed' },
    ] },
  ];

  // Alphabetically sort drawer items and their children by label
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

  // Determine spacing for local headings
  const isPhone = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  const headingBottomMarginPx = (isPhone && chartType !== 'bar') ? 2 : 8;
  
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
          items={sortedDrawerItems}
          selected={view}
          onSelect={(k)=>{setView(k); setDrawerOpen(false);}}
          className={`app-drawer ${drawerOpen ? 'is-open' : ''}`}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        <main id="main" className="app-container" role="main" aria-live="polite" style={{ flex: '1 1 auto', minWidth: 0, margin: 0 }}>
          {/* Dashboard and Chart Type selectors */}
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
            
          </div>
          {(() => {
            const selected = dashboards.find(d => d.key === dashboard) || dashboards[0];
            const Comp = componentRegistry[selected?.component] || MdfBookingsChart;
            return (
              <section className="chart-card" style={{ width: '100%' }}>
                <h2 style={{ margin: `0 0 ${headingBottomMarginPx}px`, fontSize: 18, color: '#112540' }}>
                  {selected?.label || 'Report'}
                </h2>
                <Comp datasetKey={selected?.datasetKey || dashboard} dataUrl={selected?.data} chartType={chartType} />
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