import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../lib/api';

export default function StudentResults() {
  const location  = useLocation();
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [latest, setLatest]     = useState(location.state?.result || null);

  useEffect(() => {
    api.get('/student/results').then(r => setResults(r.data)).finally(() => setLoading(false));
  }, []);

  const percent = (score, total) => total > 0 ? ((score/total)*100).toFixed(1) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>My Results</h1>
        <p>View your exam scores and performance breakdown</p>
      </div>

      {/* Latest Result Card */}
      {latest && (
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--primary-dim), var(--accent-dim))', border:'1px solid var(--primary)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
            {/* Score Circle */}
            <div style={{ width:100, height:100, position:'relative', flexShrink:0 }}>
              <svg width="100" height="100" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="8"/>
                <circle cx="50" cy="50" r="44" fill="none"
                  stroke="var(--primary)" strokeWidth="8"
                  strokeDasharray={`${2*Math.PI*44}`}
                  strokeDashoffset={`${2*Math.PI*44 * (1 - percent(latest.score,latest.totalMarks)/100)}`}
                  strokeLinecap="round"
                  style={{ transition:'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:20, fontWeight:800, color:'var(--primary)' }}>{percent(latest.score,latest.totalMarks)}%</span>
              </div>
            </div>

            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Latest Result</div>
              <div style={{ fontSize:18, fontWeight:700, marginTop:4 }}>{latest.examTitle || 'Exam'}</div>
              <div style={{ display:'flex', gap:16, marginTop:8 }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, color:'var(--primary)' }}>{latest.score ?? '—'}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Score</div>
                </div>
                <div>
                  <div style={{ fontSize:24, fontWeight:800 }}>{latest.totalMarks ?? '—'}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Total Marks</div>
                </div>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, color: latest.tabSwitchCount > 3 ? 'var(--danger)' : 'var(--text)' }}>{latest.tabSwitchCount ?? 0}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Tab Switches</div>
                </div>
              </div>
            </div>

            <span className={`badge ${parseFloat(percent(latest.score,latest.totalMarks)) >= 60 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize:14, padding:'8px 16px' }}>
              {parseFloat(percent(latest.score,latest.totalMarks)) >= 60 ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>
        </div>
      )}

      {/* All Results */}
      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : results.length === 0 && !latest ? (
        <div className="empty-state card">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No Published Results</div>
          <div className="empty-desc">Your results will appear here once they are published by the admin.</div>
          <Link to="/student/exams" className="btn btn-primary" style={{ marginTop:16 }}>Take an Exam</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {results.map(r => {
            const pct = percent(r.score, r.totalMarks);
            const passed = parseFloat(pct) >= 60;
            return (
              <div className="card flex justify-between items-center" key={r.id} style={{ flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{r.examTitle || r.examId}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'Submitted'} &nbsp;•&nbsp;
                    {r.tabSwitchCount} tab switch{r.tabSwitchCount!==1?'es':''}
                    {r.autoSubmitted && ' • Auto-submitted'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, fontSize:18 }}>{r.score} <span style={{ color:'var(--text-muted)', fontWeight:400 }}>/ {r.totalMarks}</span></div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{pct}%</div>
                  </div>
                  <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                    {passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
