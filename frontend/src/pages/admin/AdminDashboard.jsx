import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  const cards = [
    { icon:'📋', label:'Total Exams',    value: stats?.totalExams     ?? 0, color:'var(--primary)', bg:'var(--primary-dim)' },
    { icon:'⚡', label:'Active Exams',   value: stats?.activeExams    ?? 0, color:'var(--accent)',  bg:'var(--accent-dim)' },
    { icon:'👥', label:'Students',       value: stats?.totalStudents  ?? 0, color:'var(--success)', bg:'var(--success-dim)' },
    { icon:'📊', label:'Submissions',    value: stats?.totalSubmissions ?? 0, color:'var(--warning)', bg:'var(--warning-dim)' },
    { icon:'⭐', label:'Avg. Score',     value: `${(stats?.averageScore ?? 0).toFixed(1)}%`, color:'var(--accent)', bg:'var(--accent-dim)' },
    { icon:'⏳', label:'Pending Eval.',  value: stats?.pendingEvaluations ?? 0, color:'var(--danger)', bg:'var(--danger-dim)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of the exam platform.</p>
      </div>

      <div className="stats-grid">
        {cards.map((c, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <a href="/admin/exams/create" className="btn btn-primary">📝 Create New Exam</a>
            <a href="/admin/question-bank" className="btn btn-secondary">❓ Add Questions to Bank</a>
            <a href="/admin/monitor" className="btn btn-secondary">📡 Open Live Monitor</a>
            <a href="/admin/results" className="btn btn-secondary">📊 Review Pending Results</a>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Platform Stats</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label:'Average Score', value: stats?.averageScore ?? 0, max: 100 },
              { label:'Active Exams', value: stats?.activeExams ?? 0, max: Math.max(1, stats?.totalExams ?? 1) },
              { label:'Pending Evaluations', value: stats?.pendingEvaluations ?? 0, max: Math.max(1, stats?.totalSubmissions ?? 1) },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm" style={{ marginBottom:4 }}>
                  <span>{item.label}</span>
                  <span style={{ color:'var(--primary)' }}>{typeof item.value === 'number' ? item.value.toFixed(item.label.includes('Score') ? 1 : 0) : item.value}{item.label.includes('Score') ? '%' : ''}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${Math.min(100, (item.value / item.max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
