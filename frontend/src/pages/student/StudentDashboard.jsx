import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user }  = useAuth();
  const [stats, setStats]   = useState(null);
  const [exams, setExams]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/dashboard'),
      api.get('/student/exams'),
    ]).then(([sr, er]) => {
      setStats(sr.data);
      setExams(er.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  const cards = [
    { icon:'📋', label:'Total Attempts', value: stats?.totalAttempts ?? 0, color:'var(--primary)', bg:'var(--primary-dim)' },
    { icon:'✅', label:'Completed',      value: stats?.completed ?? 0, color:'var(--success)', bg:'var(--success-dim)' },
    { icon:'⏳', label:'In Progress',    value: stats?.inProgress ?? 0, color:'var(--warning)', bg:'var(--warning-dim)' },
    { icon:'⭐', label:'Avg. Score',     value: `${stats?.averageScore ?? 0}%`, color:'var(--accent)', bg:'var(--accent-dim)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's a summary of your exam activity</p>
      </div>

      <div className="stats-grid">
        {cards.map((c, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background:c.bg, color:c.color }}>{c.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color:c.color }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Available Exams</span>
          <Link to="/student/exams" style={{ fontSize:12, color:'var(--primary)' }}>View all →</Link>
        </div>
        {exams.length === 0 ? (
          <div style={{ textAlign:'center', padding:24, color:'var(--text-muted)', fontSize:13 }}>
            No exams scheduled right now. Check back later!
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {exams.map(e => (
              <div key={e.id} className="flex justify-between items-center"
                style={{ padding:'12px', background:'var(--surface)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{e.title}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                    {e.subject} • {e.durationMinutes} min • {e.totalMarks} marks
                  </div>
                </div>
                <Link to={`/student/exam/${e.id}/instructions`} className="btn btn-sm btn-primary">
                  Start →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
