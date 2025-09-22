import { useParams, useNavigate } from 'react-router-dom';
import rawData from './AppData';

const DetailPage = () => {
  const { region, category, month } = useParams();
  const navigate = useNavigate();
  // Filter all matching entries from rawData
  const filtered = rawData.filter(
    (item) =>
      item.region === region &&
      item.category === category &&
      item.month === month
  );

  // Back button handler: pass month as query param
  const handleBack = () => {
    navigate(`/?month=${month}`);
  };

  return (
    <div style={{ padding: 40 }}>
      <button onClick={handleBack} style={{ marginBottom: 20, padding: '8px 16px', fontSize: 16, background: '#4285F4', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>← Back to Dashboard</button>
      <h2>📍 Details for {region}</h2>
      <p><strong>Category:</strong> {category}</p>
      <p><strong>Month:</strong> {month}</p>
      <h3>Sales Data</h3>
      {filtered.length > 0 ? (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Region</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Category</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Month</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Sales</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{row.region}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{row.category}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{row.month}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{row.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data found for this selection.</p>
      )}
    </div>
  );
};

export default DetailPage;