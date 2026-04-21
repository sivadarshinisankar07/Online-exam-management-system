import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function StudentLeaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/leaderboard').then(r => setEntries(r.data)).finally(() => setLoading(false));
  }, []);

  const medals = ['🥇','🥈','🥉'];

  return (
    <div>
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>Top performers across all completed exams</p>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : entries.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🏆</div>
          <div className="empty-title">No Rankings Yet</div>
          <div className="empty-desc">Complete an exam to appear on the leaderboard!</div>
        </div>
      ) : (
        <div>
          {/* Top 3 Podium */}
          {entries.length >= 3 && (
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:16, marginBottom:32 }}>
              {[entries[1], entries[0], entries[2]].map((e, rawIdx) => {
                const rank = rawIdx === 0 ? 2 : rawIdx === 1 ? 1 : 3;
                const heights = { 1: 120, 2: 90, 3: 70 };
                return (
                  <div key={rank} style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <div style={{ fontSize:28 }}>{medals[rank-1]}</div>
                    <div className="user-avatar" style={{ width:50, height:50, fontSize:18, margin:'0 auto' }}>
                      {e?.studentName?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?'}
                    </div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{e?.studentName || '—'}</div>
                    <div style={{ fontWeight:800, color:'var(--primary)', fontSize:16 }}>{e?.percentage?.toFixed(1)}%</div>
                    <div style={{
                      width:80, height:heights[rank],
                      background: rank===1 ? 'linear-gradient(0deg,var(--warning),#fde68a)' : rank===2 ? 'linear-gradient(0deg,var(--text-muted),#cbd5e1)' : 'linear-gradient(0deg,#b45309,#d97706)',
                      borderRadius:'8px 8px 0 0',
                      opacity:0.85,
                    }}/>
                  </div>
                );
              })}
            </div>
          )}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Rank</th><th>Student</th><th>Score</th><th>Total</th><th>Percentage</th></tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} style={{ background: i < 3 ? 'rgba(124,110,240,0.04)' : undefined }}>
                    <td style={{ fontSize:18, fontWeight:700 }}>{medals[i] || `#${i+1}`}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="user-avatar" style={{ width:28, height:28, fontSize:11 }}>
                          {e.studentName?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight:600 }}>{e.studentName || 'Unknown'}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{e.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight:700 }}>{e.score}</td>
                    <td style={{ color:'var(--text-muted)' }}>{e.totalMarks}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar" style={{ width:80 }}>
                          <div className="progress-fill" style={{ width:`${e.percentage}%` }}/>
                        </div>
                        <span style={{ fontWeight:700, color:'var(--primary)', fontSize:13 }}>{e.percentage?.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
