import React from 'react';
import '../styles/chart.css';

export default function ChartControls({ chartType, onChange, threshold, onThresholdChange, showPercentOnlySmall, onTogglePercentOnlySmall }) {
  return (
    <div className="controls">
      <div className="control-group">
        <label className="label">Chart Type:</label>
        <select className="select" value={chartType} onChange={e => onChange(e.target.value)}>
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
          <option value="doughnut">Doughnut</option>
        </select>
      </div>
      <div className="control-group">
        <label className="label">Small slice threshold (%)</label>
        <input className="input" type="number" min="0" max="20" step="1" value={threshold} onChange={e => onThresholdChange(Number(e.target.value))} />
      </div>
      <div className="control-group">
        <label className="label">
          <input className="checkbox" type="checkbox" checked={showPercentOnlySmall} onChange={e => onTogglePercentOnlySmall(e.target.checked)} /> Show % only for small slices
        </label>
      </div>
    </div>
  );
}
