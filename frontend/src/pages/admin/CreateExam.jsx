import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const STEPS = ['Basic Info', 'Duration & Marks', 'Settings', 'Review'];

export default function CreateExam() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title:'', description:'', subject:'',
    durationMinutes:60, totalMarks:100, passingMarks:40,
    startTime:'', endTime:'',
    shuffleQuestions:true, shuffleOptions:true,
    maxAttempts:1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = { ...form,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
      };
      const res = await api.post('/admin/exams', payload);
      navigate(`/admin/exams/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    // Step 0
    <div key="0">
      <div className="form-group">
        <label className="form-label">Exam Title *</label>
        <input className="form-control" placeholder="e.g. Full Stack Developer Assessment"
          value={form.title} onChange={e => set('title', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-control" placeholder="Describe what this exam covers…"
          value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
      </div>
      <div className="form-group">
        <label className="form-label">Subject / Category</label>
        <input className="form-control" placeholder="e.g. Programming, Mathematics…"
          value={form.subject} onChange={e => set('subject', e.target.value)} />
      </div>
    </div>,

    // Step 1
    <div key="1">
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Duration (minutes) *</label>
          <input className="form-control" type="number" min={1}
            value={form.durationMinutes} onChange={e => set('durationMinutes', +e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Total Marks</label>
          <input className="form-control" type="number" min={0}
            value={form.totalMarks} onChange={e => set('totalMarks', +e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Passing Marks</label>
          <input className="form-control" type="number" min={0}
            value={form.passingMarks} onChange={e => set('passingMarks', +e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Max Attempts</label>
          <input className="form-control" type="number" min={1}
            value={form.maxAttempts} onChange={e => set('maxAttempts', +e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Time</label>
          <input className="form-control" type="datetime-local"
            value={form.startTime} onChange={e => set('startTime', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">End Time</label>
          <input className="form-control" type="datetime-local"
            value={form.endTime} onChange={e => set('endTime', e.target.value)} />
        </div>
      </div>
    </div>,

    // Step 2
    <div key="2">
      {[
        { key:'shuffleQuestions', label:'Shuffle Questions', desc:'Randomly order questions for each student' },
        { key:'shuffleOptions', label:'Shuffle Options', desc:'Randomly order MCQ options' },
      ].map(item => (
        <div key={item.key} className="card" style={{ marginBottom:12, cursor:'pointer' }}
          onClick={() => set(item.key, !form[item.key])}>
          <div className="flex items-center gap-3">
            <div style={{
              width:20, height:20, borderRadius:4, border:`2px solid var(--primary)`,
              background: form[item.key] ? 'var(--primary)' : 'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontSize:12, flexShrink:0,
            }}>{form[item.key] ? '✓' : ''}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>{item.label}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{item.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>,

    // Step 3 — Review
    <div key="3">
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            ['Title', form.title || '—'],
            ['Subject', form.subject || '—'],
            ['Duration', `${form.durationMinutes} min`],
            ['Total Marks', form.totalMarks],
            ['Passing Marks', form.passingMarks],
            ['Max Attempts', form.maxAttempts],
          ].map(([k,v]) => (
            <div key={k}>
              <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{k}</div>
              <div style={{ fontWeight:600, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
    </div>,
  ];

  return (
    <div style={{ maxWidth:640, margin:'0 auto' }}>
      <div className="page-header">
        <h1>Create Exam</h1>
        <p>Follow the steps below to set up a new examination</p>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 items-center mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background: i <= step ? 'var(--primary)' : 'var(--card)',
              border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--border)'}`,
              color: i <= step ? 'white' : 'var(--text-muted)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, flexShrink:0,
              transition: 'all 0.2s ease',
            }}>{i < step ? '✓' : i + 1}</div>
            <span style={{ fontSize:12, color: i === step ? 'var(--text)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
            {i < STEPS.length - 1 && <div style={{ flex:1, height:1, background:'var(--border)', minWidth:20 }}/>}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        {stepContent[step]}
      </div>

      <div className="flex justify-between">
        <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary"
            onClick={() => { if(step === 0 && !form.title.trim()){setError('Title is required');return;} setError(''); setStep(s=>s+1); }}
            disabled={step === 0 && !form.title.trim()}>
            Next →
          </button>
        ) : (
          <button id="create-exam-submit" className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}}/> Creating…</> : '✓ Create Exam'}
          </button>
        )}
      </div>
    </div>
  );
}
