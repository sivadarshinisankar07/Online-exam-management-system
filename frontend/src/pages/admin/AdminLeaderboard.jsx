import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminLeaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/leaderboard').then(r => setEntries(r.data)).finally(() => setLoading(false));
  }, []);

  const medals = ['🥇','🥈','🥉'];

  return (
    <div>
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>Top-performing students across all published results</p>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : entries.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🏆</div>
          <div className="empty-title">No Results Yet</div>
          <div className="empty-desc">Publish student results to populate the leaderboard.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Score</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td style={{ fontSize:18 }}>{medals[i] || `#${i+1}`}</td>
                  <td>
                    <div style={{ fontWeight:600 }}>{e.studentName || 'Unknown'}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{e.studentEmail}</div>
                  </td>
                  <td>{e.score}</td>
                  <td>{e.totalMarks}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="progress-bar" style={{ width:80 }}>
                        <div className="progress-fill" style={{ width:`${e.percentage}%` }}/>
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--primary)' }}>{e.percentage?.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
