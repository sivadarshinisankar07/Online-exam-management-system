import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const STATUS_META = {
  DRAFT:     { label:'Draft',     cls:'badge-muted'   },
  SCHEDULED: { label:'Scheduled', cls:'badge-accent'  },
  ACTIVE:    { label:'Active',    cls:'badge-success' },
  COMPLETED: { label:'Completed', cls:'badge-primary' },
  CANCELLED: { label:'Cancelled', cls:'badge-danger'  },
};

export default function StudentExams() {
  const [exams, setExams]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/exams').then(r => setExams(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Available Exams</h1>
        <p>{exams.length} exam{exams.length !== 1 ? 's' : ''} available for you</p>
      </div>

      {exams.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No Exams Available</div>
          <div className="empty-desc">Your admin hasn't scheduled any exams yet.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
          {exams.map(exam => {
            const meta = STATUS_META[exam.status] || STATUS_META.DRAFT;
            return (
              <div key={exam.id} className="card" style={{ display:'flex', flexDirection:'column' }}>
                <div className="flex justify-between items-center" style={{ marginBottom:12 }}>
                  <span className={`badge ${meta.cls}`}>{meta.label}</span>
                  {exam.subject && <span className="badge badge-muted">{exam.subject}</span>}
                </div>
                <h3 style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{exam.title}</h3>
                {exam.description && (
                  <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12, flex:1 }}>
                    {exam.description.slice(0,100)}{exam.description.length > 100 ? '…' : ''}
                  </p>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
                  {[
                    ['⏱', `${exam.durationMinutes} min`],
                    ['📋', `${exam.questionCount} Qs`],
                    ['⭐', `${exam.totalMarks} marks`],
                  ].map(([icon, label]) => (
                    <div key={label} style={{ textAlign:'center', background:'var(--surface)', borderRadius:'var(--radius-sm)', padding:'8px 4px' }}>
                      <div>{icon}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <Link
                  to={`/student/exam/${exam.id}/instructions`}
                  className="btn btn-primary btn-full"
                >
                  View Details & Start
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
