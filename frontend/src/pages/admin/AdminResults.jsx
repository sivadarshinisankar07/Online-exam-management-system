import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminResults() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/results').then(r => setSubmissions(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const publish = async (id, val) => {
    await api.patch(`/admin/submissions/${id}/publish`, { publish: val });
    load();
  };

  const pending = submissions.filter(s => s.status === 'SUBMITTED' && !s.resultPublished);
  const published = submissions.filter(s => s.resultPublished);

  return (
    <div>
      <div className="page-header">
        <h1>Results</h1>
        <p>{pending.length} pending publication • {published.length} published</p>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Student</th>
                <th>Score</th>
                <th>%</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>
                  No submissions yet.
                </td></tr>
              )}
              {submissions.map(s => {
                const pct = s.percentage != null ? s.percentage.toFixed(1) : (s.totalMarks > 0 ? ((s.score / s.totalMarks) * 100).toFixed(1) : '—');
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight:600 }}>{s.examTitle || s.examId?.slice(-8)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight:600 }}>{s.studentName || s.studentId?.slice(-8)}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.studentEmail}</div>
                    </td>
                    <td><strong>{s.score ?? '—'}</strong> / {s.totalMarks ?? '—'}</td>
                    <td>
                      {s.score != null && s.totalMarks > 0 ? (
                        <span className={`badge ${+pct >= 60 ? 'badge-success' : 'badge-danger'}`}>{pct}%</span>
                      ) : '—'}
                    </td>
                    <td><span className={`badge ${s.status === 'EVALUATED' ? 'badge-success' : s.status === 'SUBMITTED' ? 'badge-warning' : 'badge-accent'}`}>{s.status}</span></td>
                    <td><span className={`badge ${s.resultPublished ? 'badge-success' : 'badge-muted'}`}>{s.resultPublished ? 'Yes' : 'No'}</span></td>
                    <td>
                      <button
                        className={`btn btn-sm ${s.resultPublished ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => publish(s.id, !s.resultPublished)}>
                        {s.resultPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
