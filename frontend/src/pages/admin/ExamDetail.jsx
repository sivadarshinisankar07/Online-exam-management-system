import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';

const DIFF = { EASY:'badge-success', MEDIUM:'badge-warning', HARD:'badge-danger' };

export default function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam]         = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [qForm, setQForm] = useState({
    text:'', type:'MCQ', options:[
      {id:'a',text:''},{id:'b',text:''},{id:'c',text:''},{id:'d',text:''}
    ], correctAnswer:'a', marks:1, difficulty:'MEDIUM', subject:'', topic:'', explanation:'', addToQuestionBank:false
  });
  const [qLoading, setQLoading] = useState(false);
  const [error, setError]       = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/admin/exams/${id}`),
      api.get(`/admin/exams/${id}/questions`),
    ]).then(([er,qr]) => {
      setExam(er.data);
      setQuestions(qr.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const setQ = (k,v) => setQForm(f => ({ ...f, [k]:v }));
  const setOpt = (idx, val) => setQForm(f => { const o=[...f.options]; o[idx].text=val; return {...f,options:o}; });

  const addQuestion = async e => {
    e.preventDefault();
    setQLoading(true);
    setError('');
    try {
      await api.post(`/admin/exams/${id}/questions`, qForm);
      setShowAdd(false);
      setQForm({ text:'', type:'MCQ', options:[{id:'a',text:''},{id:'b',text:''},{id:'c',text:''},{id:'d',text:''}], correctAnswer:'a', marks:1, difficulty:'MEDIUM', subject:'', topic:'', explanation:'', addToQuestionBank:false });
      load();
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to add question');
    } finally {
      setQLoading(false);
    }
  };

  const deleteQ = async (qid) => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/admin/questions/${qid}`);
    load();
  };

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;
  if (!exam) return <div className="alert alert-error">Exam not found</div>;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>{exam.title}</h1>
          <p style={{ color:'var(--text-muted)' }}>{exam.subject} • {exam.durationMinutes} min • {exam.totalMarks} marks • <span className={`badge ${exam.status === 'ACTIVE' ? 'badge-success':'badge-muted'}`}>{exam.status}</span></p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/exams" className="btn btn-secondary">← Back</Link>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Question</button>
        </div>
      </div>

      {/* Question List */}
      {questions.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">❓</div>
          <div className="empty-title">No Questions Yet</div>
          <div className="empty-desc">Add questions to this exam to make it available.</div>
          <button className="btn btn-primary mt-4" onClick={() => setShowAdd(true)}>Add First Question</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {questions.map((q, idx) => (
            <div className="card" key={q.id}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight:700, color:'var(--text-muted)', fontSize:12 }}>Q{idx+1}</span>
                  <span className={`badge ${DIFF[q.difficulty] || 'badge-muted'}`}>{q.difficulty}</span>
                  <span className="badge badge-primary">{q.type}</span>
                  <span className="badge badge-muted">{q.marks} mark{q.marks !== 1 ? 's':''}</span>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => deleteQ(q.id)}>Delete</button>
              </div>
              <p style={{ fontSize:14, fontWeight:500, marginBottom:12 }}>{q.text}</p>
              {q.options && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {q.options.map(opt => (
                    <div key={opt.id} style={{
                      padding:'8px 12px', borderRadius:'var(--radius-sm)', fontSize:13,
                      background: opt.id === q.correctAnswer ? 'var(--success-dim)' : 'var(--surface)',
                      border: `1px solid ${opt.id === q.correctAnswer ? 'var(--success)' : 'var(--border)'}`,
                      color: opt.id === q.correctAnswer ? 'var(--success)' : 'var(--text)',
                    }}>
                      <strong>{opt.id})</strong> {opt.text} {opt.id === q.correctAnswer && ' ✓'}
                    </div>
                  ))}
                </div>
              )}
              {q.explanation && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'var(--accent-dim)', borderRadius:'var(--radius-sm)', fontSize:12, color:'var(--accent)' }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Question Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal" style={{ maxWidth:600 }}>
            <div className="modal-header">
              <span className="modal-title">Add Question</span>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <form onSubmit={addQuestion}>
              <div className="modal-body">
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Question Text *</label>
                  <textarea className="form-control" rows={3} required
                    value={qForm.text} onChange={e => setQ('text',e.target.value)} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-control" value={qForm.type} onChange={e => setQ('type',e.target.value)}>
                      <option>MCQ</option>
                      <option>MULTI_SELECT</option>
                      <option>DESCRIPTIVE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select className="form-control" value={qForm.difficulty} onChange={e => setQ('difficulty',e.target.value)}>
                      <option>EASY</option><option>MEDIUM</option><option>HARD</option>
                    </select>
                  </div>
                </div>

                {qForm.type !== 'DESCRIPTIVE' && (
                  <>
                    <label className="form-label">Options</label>
                    {qForm.options.map((opt, i) => (
                      <div key={opt.id} className="flex items-center gap-2" style={{ marginBottom:6 }}>
                        <span style={{ width:20, textAlign:'center', fontWeight:700, color:'var(--text-muted)' }}>{opt.id})</span>
                        <input className="form-control" placeholder={`Option ${opt.id}`}
                          value={opt.text} onChange={e => setOpt(i, e.target.value)} />
                      </div>
                    ))}
                    <div className="form-group mt-2">
                      <label className="form-label">Correct Answer</label>
                      <select className="form-control" value={qForm.correctAnswer} onChange={e => setQ('correctAnswer',e.target.value)}>
                        {qForm.options.map(o => <option key={o.id} value={o.id}>{o.id}) {o.text}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Marks</label>
                    <input className="form-control" type="number" min={1}
                      value={qForm.marks} onChange={e => setQ('marks',+e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-control" placeholder="Optional"
                      value={qForm.subject} onChange={e => setQ('subject',e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Explanation (shown after result)</label>
                  <input className="form-control" placeholder="Why is this the correct answer?"
                    value={qForm.explanation} onChange={e => setQ('explanation',e.target.value)} />
                </div>

                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13 }}>
                  <input type="checkbox" checked={qForm.addToQuestionBank}
                    onChange={e => setQ('addToQuestionBank',e.target.checked)} />
                  Also add to Question Bank
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={qLoading}>
                  {qLoading ? 'Adding…' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
