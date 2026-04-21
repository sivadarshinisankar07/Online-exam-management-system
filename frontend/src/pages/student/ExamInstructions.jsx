import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function ExamInstructions() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [exam, setExam]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [agreed, setAgreed]   = useState(false);

  useEffect(() => {
    api.get(`/student/exams/${id}`).then(r => setExam(r.data)).finally(() => setLoading(false));
  }, [id]);

  const start = async () => {
    if (!agreed) return;
    setStarting(true);
    try {
      const res = await api.post(`/student/exams/${id}/start`);
      navigate(`/student/exam/${id}/attempt`, { state: { submission: res.data } });
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to start exam');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;
  if (!exam)   return <div className="alert alert-error">Exam not found</div>;

  return (
    <div style={{ maxWidth:640, margin:'0 auto' }}>
      <div className="page-header">
        <h1>{exam.title}</h1>
        <p>Read all instructions before starting</p>
      </div>

      {/* Exam Meta */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          ['⏱', `${exam.durationMinutes} min`, 'Duration'],
          ['📋', exam.questionCount, 'Questions'],
          ['⭐', `${exam.totalMarks} / ${exam.passingMarks}`, 'Total / Passing'],
        ].map(([icon, val, label]) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background:'var(--primary-dim)', color:'var(--primary)', fontSize:20 }}>{icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ fontSize:20, color:'var(--primary)' }}>{val}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {exam.description && (
        <div className="card mb-4">
          <div className="card-title mb-3">About this Exam</div>
          <p style={{ fontSize:13, lineHeight:1.7, color:'var(--text-muted)' }}>{exam.description}</p>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-title mb-3">📋 Instructions</div>
        <ul style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            'The exam timer starts as soon as you click "Start Exam".',
            'Do not switch tabs or minimize the browser — this will be recorded as a violation.',
            'Your answers are auto-saved every 10 seconds.',
            'If you lose connection, your progress will be restored when you return.',
            'You may mark questions for review and come back to them.',
            `Passing score is ${exam.passingMarks} marks out of ${exam.totalMarks}.`,
            'Submit before the timer runs out — the exam will auto-submit when time expires.',
          ].map((item, i) => (
            <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:13 }}>
              <span style={{ color:'var(--primary)', fontWeight:700, marginTop:1, flexShrink:0 }}>{i+1}.</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card mb-6" style={{ cursor:'pointer' }} onClick={() => setAgreed(a => !a)}>
        <div className="flex items-center gap-3">
          <div style={{
            width:22, height:22, borderRadius:4, border:`2px solid var(--primary)`,
            background: agreed ? 'var(--primary)' : 'transparent',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontSize:14, flexShrink:0,
          }}>{agreed ? '✓' : ''}</div>
          <span style={{ fontSize:13, fontWeight:500 }}>
            I have read all instructions and agree to the examination policies.
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <button
          id="start-exam-btn"
          className="btn btn-primary btn-lg"
          style={{ flex:1, justifyContent:'center' }}
          onClick={start}
          disabled={!agreed || starting}
        >
          {starting ? <><span className="spinner" style={{width:16,height:16}}/> Starting…</> : '🚀 Start Exam'}
        </button>
      </div>
    </div>
  );
}
