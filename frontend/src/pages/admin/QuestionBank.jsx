import { useState, useEffect } from 'react';
import api from '../../lib/api';

const DIFF = { EASY:'badge-success', MEDIUM:'badge-warning', HARD:'badge-danger' };

const emptyForm = () => ({
  text:'', type:'MCQ',
  options:[{id:'a',text:''},{id:'b',text:''},{id:'c',text:''},{id:'d',text:''}],
  correctAnswer:'a', marks:1, difficulty:'MEDIUM',
  subject:'', topic:'', explanation:'', addToQuestionBank: true,
});

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState({ subject:'', difficulty:'' });
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/question-bank').then(r => setQuestions(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = questions.filter(q => {
    if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
    if (filter.subject && !q.subject?.toLowerCase().includes(filter.subject.toLowerCase())) return false;
    return true;
  });

  const deleteQ = async (id) => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/admin/questions/${id}`);
    setQuestions(qs => qs.filter(q => q.id !== id));
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setOpt = (idx, val) => setForm(f => {
    const o = [...f.options]; o[idx].text = val; return { ...f, options: o };
  });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/questions', { ...form, addToQuestionBank: true });
      setShowAdd(false);
      setForm(emptyForm());
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Question Bank</h1>
          <p>Reusable questions library — {questions.length} question{questions.length !== 1 ? 's' : ''} stored</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setError(''); }}>
          + Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-3 items-center">
          <input className="form-control" style={{ maxWidth:240 }}
            placeholder="Filter by subject…" value={filter.subject}
            onChange={e => setFilter(f => ({ ...f, subject: e.target.value }))} />
          <select className="form-control" style={{ maxWidth:180 }}
            value={filter.difficulty} onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}>
            <option value="">All Difficulties</option>
            <option>EASY</option><option>MEDIUM</option><option>HARD</option>
          </select>
          <span style={{ fontSize:13, color:'var(--text-muted)', marginLeft:'auto' }}>
            Showing {filtered.length} of {questions.length}
          </span>
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="loading-center"><div className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">❓</div>
          <div className="empty-title">No Questions Found</div>
          <div className="empty-desc">Add questions directly using the button above, or check "Add to Question Bank" when adding questions to an exam.</div>
          <button className="btn btn-primary mt-4" onClick={() => setShowAdd(true)}>+ Add First Question</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map((q, i) => (
            <div className="card" key={q.id}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight:700, color:'var(--text-muted)', fontSize:12 }}>#{i+1}</span>
                  <span className={`badge ${DIFF[q.difficulty] || 'badge-muted'}`}>{q.difficulty}</span>
                  <span className="badge badge-primary">{q.type}</span>
                  {q.subject && <span className="badge badge-muted">{q.subject}</span>}
                  <span className="badge badge-accent">{q.marks} mk</span>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => deleteQ(q.id)}>Delete</button>
              </div>
              <p style={{ fontSize:14, fontWeight:500 }}>{q.text}</p>
              {q.options && q.options.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:10 }}>
                  {q.options.map(opt => (
                    <div key={opt.id} style={{
                      padding:'6px 10px', borderRadius:'var(--radius-sm)', fontSize:12,
                      background: opt.id === q.correctAnswer ? 'var(--success-dim)' : 'var(--surface)',
                      border: `1px solid ${opt.id === q.correctAnswer ? 'var(--success)' : 'var(--border)'}`,
                      color: opt.id === q.correctAnswer ? 'var(--success)' : 'var(--text)',
                    }}>
                      <strong>{opt.id})</strong> {opt.text} {opt.id === q.correctAnswer && '✓'}
                    </div>
                  ))}
                </div>
              )}
              {q.explanation && (
                <div style={{ marginTop:8, fontSize:12, color:'var(--accent)' }}>💡 {q.explanation}</div>
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
              <span className="modal-title">Add Question to Bank</span>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                {error && <div className="alert alert-error mb-4">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Question Text *</label>
                  <textarea className="form-control" rows={3} required
                    value={form.text} onChange={e => setF('text', e.target.value)} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-control" value={form.type} onChange={e => setF('type', e.target.value)}>
                      <option>MCQ</option>
                      <option>MULTI_SELECT</option>
                      <option>DESCRIPTIVE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select className="form-control" value={form.difficulty} onChange={e => setF('difficulty', e.target.value)}>
                      <option>EASY</option><option>MEDIUM</option><option>HARD</option>
                    </select>
                  </div>
                </div>

                {form.type !== 'DESCRIPTIVE' && (
                  <>
                    <div className="form-label mb-2">Options</div>
                    {form.options.map((opt, i) => (
                      <div key={opt.id} className="flex items-center gap-2" style={{ marginBottom:6 }}>
                        <span style={{ width:20, textAlign:'center', fontWeight:700, color:'var(--text-muted)' }}>{opt.id})</span>
                        <input className="form-control" placeholder={`Option ${opt.id.toUpperCase()}`}
                          value={opt.text} onChange={e => setOpt(i, e.target.value)} />
                      </div>
                    ))}
                    <div className="form-group mt-2">
                      <label className="form-label">Correct Answer</label>
                      <select className="form-control" value={form.correctAnswer} onChange={e => setF('correctAnswer', e.target.value)}>
                        {form.options.map(o => (
                          <option key={o.id} value={o.id}>{o.id.toUpperCase()}) {o.text || `Option ${o.id.toUpperCase()}`}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Marks</label>
                    <input className="form-control" type="number" min={1}
                      value={form.marks} onChange={e => setF('marks', +e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-control" placeholder="e.g. Mathematics"
                      value={form.subject} onChange={e => setF('subject', e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Topic (optional)</label>
                  <input className="form-control" placeholder="e.g. Algebra"
                    value={form.topic} onChange={e => setF('topic', e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Explanation (shown to student after result)</label>
                  <input className="form-control" placeholder="Why is this the correct answer?"
                    value={form.explanation} onChange={e => setF('explanation', e.target.value)} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : '+ Add to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
