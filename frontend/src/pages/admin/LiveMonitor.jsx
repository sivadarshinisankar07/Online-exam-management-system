import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';

export default function LiveMonitor() {
  const [data, setData]   = useState([]);
  const [examId, setExamId] = useState('');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    api.get('/admin/exams').then(r => setExams(r.data));
  }, []);

  const fetchLive = () => {
    setLoading(true);
    const url = examId ? `/admin/live-monitor?examId=${examId}` : '/admin/live-monitor';
    api.get(url).then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 10000);
    return () => clearInterval(intervalRef.current);
  }, [examId]);

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Live Monitor</h1>
          <p>Real-time view of ongoing exams — auto-refreshes every 10 seconds</p>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--success)', display:'inline-block', animation:'pulse 2s infinite' }}/>
          <span style={{ fontSize:12, color:'var(--success)' }}>Live</span>
          <select className="form-control" style={{ maxWidth:230 }} value={examId} onChange={e => setExamId(e.target.value)}>
            <option value="">All Active Exams</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetchLive}>↻ Refresh</button>
        </div>
      </div>

      <div className="stats-grid mb-6">
        {[
          { label:'In Progress', value: data.length, color:'var(--success)', bg:'var(--success-dim)', icon:'📡' },
          { label:'Tab Switches', value: data.reduce((a,s)=>a+s.tabSwitchCount,0), color:'var(--danger)', bg:'var(--danger-dim)', icon:'⚠️' },
          { label:'Avg. Answered', value: data.length > 0 ? Math.round(data.reduce((a,s)=>a+s.answeredCount,0)/data.length) : 0, color:'var(--accent)', bg:'var(--accent-dim)', icon:'✍️' },
        ].map((s,i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background:s.bg, color:s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📡</div>
          <div className="empty-title">No Active Sessions</div>
          <div className="empty-desc">No students are currently taking exams.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Answered</th>
                <th>Tab Switches</th>
                <th>Status</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.submissionId}>
                  <td>
                    <div style={{ fontWeight:600 }}>{s.studentName || s.studentId}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.studentEmail}</div>
                  </td>
                  <td>{s.answeredCount} questions</td>
                  <td>
                    <span className={`badge ${s.tabSwitchCount > 3 ? 'badge-danger' : s.tabSwitchCount > 0 ? 'badge-warning' : 'badge-success'}`}>
                      {s.tabSwitchCount} switch{s.tabSwitchCount !== 1 ? 'es' : ''}
                    </span>
                  </td>
                  <td><span className="badge badge-accent">In Progress</span></td>
                  <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {s.startedAt ? new Date(s.startedAt).toLocaleTimeString() : '—'}
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
