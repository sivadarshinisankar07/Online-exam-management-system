import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function ExamHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/results').then(r => setResults(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Exam History</h1>
        <p>Timeline of all your exam attempts</p>
      </div>

      {results.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">⏱</div>
          <div className="empty-title">No History Yet</div>
          <div className="empty-desc">Your completed exams will appear here in a timeline.</div>
        </div>
      ) : (
        <div style={{ position:'relative', paddingLeft:24 }}>
          <div style={{ position:'absolute', left:8, top:0, bottom:0, width:2, background:'var(--border)', borderRadius:1 }}/>
          {results.map((r, i) => {
            const pct = r.totalMarks > 0 ? ((r.score/r.totalMarks)*100).toFixed(1) : 0;
            const passed = parseFloat(pct) >= 60;
            return (
              <div key={r.id} style={{ position:'relative', marginBottom:24, paddingLeft:24 }}>
                <div style={{
                  position:'absolute', left:-8, top:4,
                  width:18, height:18, borderRadius:'50%',
                  background: passed ? 'var(--success)' : 'var(--danger)',
                  border:'3px solid var(--bg)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:8, color:'white', fontWeight:700,
                }}>{passed ? '✓' : '✗'}</div>

                <div className="card">
                  <div className="flex justify-between items-center" style={{ flexWrap:'wrap', gap:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{r.examTitle || r.examId}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}
                        {r.autoSubmitted && <span className="badge badge-warning" style={{ marginLeft:8 }}>Auto-submitted</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontWeight:800, fontSize:20, color: passed ? 'var(--success)' : 'var(--danger)' }}>{pct}%</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{r.score} / {r.totalMarks}</div>
                      </div>
                      <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                        {passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
