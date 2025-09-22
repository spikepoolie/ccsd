import React, { useMemo, useState } from 'react';
import bookings from './data/bookings.json';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SideDrawer from './components/SideDrawer';
import Header from './components/Header';
import sheriffLogo from './images/sheriff-logo.webp';

// Define colors for charts
const COLORS = ['#4285F4','#DB4437','#F4B400','#0F9D58','#AB47BC','#00ACC1','#FF7043'];

// Custom tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="recharts-tooltip" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        border: '1px solid #ccc', 
        borderRadius: '6px', 
        padding: '10px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)' 
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px' }}>{label}</p>
        <p style={{ margin: 0, color: '#333' }}>
          Bookings: {payload[0].value.toLocaleString()}
        </p>
        {data.percentage !== undefined && (
          <p style={{ margin: 0, color: '#666' }}>
            Percentage: {data.percentage}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom legend component for pie charts
const CustomLegend = ({ data, chartType }) => {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const isCircular = chartType === 'pie' || chartType === 'doughnut';
  
  if (isMobile && isCircular) {
    return null; // Hide legend on mobile for pie/doughnut charts
  }

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
  const [view, setView] = useState('bookings');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Get data based on selected dashboard
  const currentData = React.useMemo(() => {
    if (view === 'census') {
      return bookings['census-bookings'] || [];
    }
    return bookings.bookings || [];
  }, [view]);
  
  // Get unique cities from current data
  const uniqueCities = React.useMemo(() => Array.from(new Set(currentData.map(b => b.city))), [currentData]);
  const defaultCity = uniqueCities.includes('Contra Costa County') ? 'Contra Costa County' : 
                     (uniqueCities.includes('Contra Costa') ? 'Contra Costa' : (uniqueCities[0] || ''));
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  
  // Build demographics dataset from current data for the selected city
  const cityRows = React.useMemo(() => currentData.filter(b => b.city === selectedCity), [currentData, selectedCity]);
  const labels = React.useMemo(() => cityRows.map(r => r.race), [cityRows]);
  const counts = React.useMemo(() => cityRows.map(r => Number(r.bookings) || 0), [cityRows]);
  const percentages = React.useMemo(() => cityRows.map(r => Number(r.percentage) || 0), [cityRows]);
  const viewLabels = {
    demographics: 'Demographics',
    ice: 'ICE ACCESS INFORMATION',
    arrests: 'Arrest Data by City of Residence',
    adp: 'Average Daily Population',
    requests: 'Total Requests made',
  };

  const dashboards = [
    { key: 'bookings', label: 'Persons Arrested/Booked' },
    { key: 'census', label: 'Census Data' },
  ]

  // Reset selected city when dashboard changes
  React.useEffect(() => {
    const newDefaultCity = uniqueCities.includes('Contra Costa County') ? 'Contra Costa County' : 
                          (uniqueCities.includes('Contra Costa') ? 'Contra Costa' : (uniqueCities[0] || ''));
    setSelectedCity(newDefaultCity);
  }, [view, uniqueCities]);

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
              <label htmlFor="viewSelect" style={{ marginBottom: 5, fontWeight: 700 }}>Select Dashboard:</label>
              <select
                id="viewSelect"
                style={{ padding: 8, fontSize: 16, position: 'relative', zIndex: 1000 }}
                value={view}
                onChange={(e) => setView(e.target.value)}
              >
                {dashboards.map(item => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </div>
            
            {/* City selector moved here for better mobile dropdown positioning */}
            {(view === 'bookings' || view === 'census') && (
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                <h3 className="city-selector-label" style={{ marginBottom: 5, fontWeight: 700, fontSize: 14 }}></h3>
                
                {/* Pills for tablet/desktop */}
                <div className="city-pills-container">
                  {uniqueCities.map(city => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`city-pill ${selectedCity === city ? 'selected' : ''}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                
                {/* Select dropdown for mobile */}
                <select 
                  className="city-select-dropdown"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{ padding: 8, fontSize: 16 }}
                >
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
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
          
          <div style={{ minHeight: 560 }}>
            <ChartSwitcher
              view={view}
              chartType={chartType}
              demo={{ labels, counts, percentages }}
              viewLabel={viewLabels[view] || view}
            />
          </div>
        </main>
        </div>
      </div>
    </>
  );
};

function ChartSwitcher({ view, chartType, demo, viewLabel }) {
  const { labels, counts, percentages } = demo;
  
  // Transform data for Recharts format
  const chartData = labels.map((label, index) => ({
    race: label,
    bookings: counts[index] || 0,
    percentage: percentages[index] || 0
  }));

  if (chartType === 'bar') {
    return (
      <div style={{ width: '100%', height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="race" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="bookings" fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // For pie and doughnut charts
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  
  return (
    <div className="chart-row">
      <CustomLegend data={chartData} chartType={chartType} />
      <figure className={`chart-area ${chartType}-chart`}>
        <div style={{ 
          width: '100%', 
          height: isMobile ? '400px' : '580px'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ race, bookings, percentage }) => 
                  isMobile ? null : `${race}\n${bookings.toLocaleString()}\n${percentage}%`
                }
                outerRadius={chartType === 'doughnut' ? 120 : 140}
                innerRadius={chartType === 'doughnut' ? 60 : 0}
                fill="#8884d8"
                dataKey="bookings"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}

export default ChartFromDataJson;