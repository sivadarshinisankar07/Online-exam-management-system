import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const STATUS_META = {
  DRAFT:     { label:'Draft',     cls:'badge-muted'   },
  SCHEDULED: { label:'Scheduled', cls:'badge-accent'  },
  ACTIVE:    { label:'Active',    cls:'badge-success' },
  COMPLETED: { label:'Completed', cls:'badge-primary' },
  CANCELLED: { label:'Cancelled', cls:'badge-danger'  },
};

export default function AdminExams() {
  const [exams, setExams]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get('/admin/exams').then(r => setExams(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteExam = async (id) => {
    if (!confirm('Delete this exam?')) return;
    await api.delete(`/admin/exams/${id}`);
    load();
  };

  const changeStatus = async (id, status) => {
    await api.patch(`/admin/exams/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Exams</h1>
          <p>Manage your examination catalogue</p>
        </div>
        <Link to="/admin/exams/create" className="btn btn-primary">+ Create Exam</Link>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : exams.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No Exams Yet</div>
          <div className="empty-desc">Create your first exam to get started.</div>
          <Link to="/admin/exams/create" className="btn btn-primary" style={{ marginTop:16 }}>Create Exam</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Duration</th>
                <th>Questions</th>
                <th>Marks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => {
                const meta = STATUS_META[exam.status] || STATUS_META.DRAFT;
                return (
                  <tr key={exam.id}>
                    <td>
                      <div style={{ fontWeight:600 }}>{exam.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{exam.description?.slice(0,60)}</div>
                    </td>
                    <td>{exam.subject || '—'}</td>
                    <td>{exam.durationMinutes} min</td>
                    <td>{exam.questionCount}</td>
                    <td>{exam.totalMarks}</td>
                    <td><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-secondary"
                          onClick={() => navigate(`/admin/exams/${exam.id}`)}>View</button>
                        {exam.status === 'DRAFT' && (
                          <button className="btn btn-sm btn-success"
                            onClick={() => changeStatus(exam.id, 'ACTIVE')}>Activate</button>
                        )}
                        {exam.status === 'ACTIVE' && (
                          <button className="btn btn-sm btn-warning"
                            onClick={() => changeStatus(exam.id, 'COMPLETED')}>Complete</button>
                        )}
                        <button className="btn btn-sm btn-danger"
                          onClick={() => deleteExam(exam.id)}>Delete</button>
                      </div>
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
