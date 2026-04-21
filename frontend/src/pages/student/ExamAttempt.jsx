import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function ExamAttempt() {
  const { id }    = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [exam, setExam]               = useState(null);
  const [questions, setQuestions]     = useState([]);
  const [answers, setAnswers]         = useState({});
  const [marked, setMarked]           = useState([]);
  const [current, setCurrent]         = useState(0);
  const [submissionId, setSubmissionId] = useState(null);
  const [timeLeft, setTimeLeft]       = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [showTabWarn, setShowTabWarn] = useState(false);

  const tabSwitchRef  = useRef(0);
  const autoSaveTimer = useRef(null);
  const timerRef      = useRef(null);

  // ── Initialize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        let sub = location.state?.submission;
        if (!sub) {
          const sr = await api.post(`/student/exams/${id}/start`);
          sub = sr.data;
        }

        const [er, qr] = await Promise.all([
          api.get(`/student/exams/${id}`),
          api.get(`/student/exams/${id}/questions`),
        ]);

        setSubmissionId(sub.submissionId);
        setExam(er.data);
        setQuestions(qr.data);

        // Restore saved answers
        if (sub.savedAnswers) setAnswers(sub.savedAnswers);
        if (sub.markedForReview) setMarked(sub.markedForReview);

        // Compute remaining time (duration - elapsed)
        const elapsed = sub.startedAt
          ? Math.floor((Date.now() - new Date(sub.startedAt).getTime()) / 1000)
          : 0;
        const totalSec = er.data.durationMinutes * 60;
        setTimeLeft(Math.max(0, totalSec - elapsed));
      } catch(err) {
        alert('Failed to load exam: ' + (err.response?.data?.error || err.message));
        navigate('/student/exams');
      } finally {
        setLoading(false);
      }
    };

    init();

    // Full-screen request
    document.documentElement.requestFullscreen?.().catch(() => {});

    return () => {
      clearInterval(autoSaveTimer.current);
      clearInterval(timerRef.current);
      document.exitFullscreen?.().catch(() => {});
    };
  }, [id]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(true); return; }

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft === null ? null : 'started']);

  // ── Auto-Save ──────────────────────────────────────────────────────────────
  const doAutoSave = useCallback(() => {
    if (!submissionId) return;
    api.put(`/student/submissions/${submissionId}/autosave`, {
      answers,
      markedForReview: marked,
      tabSwitchCount: tabSwitchRef.current,
    }).catch(() => {});
  }, [submissionId, answers, marked]);

  useEffect(() => {
    if (!submissionId) return;
    autoSaveTimer.current = setInterval(doAutoSave, 10000);
    return () => clearInterval(autoSaveTimer.current);
  }, [doAutoSave, submissionId]);

  // ── Tab Switch Detection ───────────────────────────────────────────────────
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchRef.current += 1;
        setTabSwitches(tabSwitchRef.current);
        setShowTabWarn(true);
        setTimeout(() => setShowTabWarn(false), 4000);
      }
    };
    const onBlur = () => {
      tabSwitchRef.current += 1;
      setTabSwitches(tabSwitchRef.current);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    if (!auto && !confirm('Are you sure you want to submit the exam?')) return;
    setSubmitting(true);
    clearInterval(autoSaveTimer.current);
    clearInterval(timerRef.current);
    try {
      const res = await api.post(`/student/submissions/${submissionId}/submit`, {
        answers,
        markedForReview: marked,
        tabSwitchCount: tabSwitchRef.current,
        autoSubmitted: auto,
      });
      navigate('/student/results', { state: { result: res.data } });
    } catch(err) {
      alert('Submission failed: ' + (err.response?.data?.error || err.message));
      setSubmitting(false);
    }
  }, [submitting, submissionId, answers, marked]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2,'0');
    const s = (secs % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  };

  const answerCurrent = (val) => {
    setAnswers(a => ({ ...a, [questions[current].id]: val }));
  };

  const toggleMark = () => {
    const qid = questions[current].id;
    setMarked(m => m.includes(qid) ? m.filter(x => x!==qid) : [...m, qid]);
  };

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div className="spinner" style={{ width:40, height:40 }}/>
    </div>
  );

  if (!exam || questions.length === 0) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48 }}>📋</div>
      <div style={{ fontSize:18, fontWeight:700 }}>Exam Has No Questions</div>
      <button className="btn btn-secondary" onClick={() => navigate('/student/exams')}>← Back to Exams</button>
    </div>
  );

  const q   = questions[current];
  const sel = answers[q.id];

  return (
    <div className="exam-layout">
      <div className="exam-main">
        {/* Header */}
        <div className="exam-header">
          <div className="exam-title-area">
            <h2>{exam.title}</h2>
            <p>Question {current+1} of {questions.length} &nbsp;•&nbsp; {Object.keys(answers).length} answered</p>
          </div>
          <div className="timer-display">
            <span>⏱</span>
            <span className={`timer-text ${timeLeft !== null && timeLeft < 300 ? 'danger' : ''}`}>
              {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </span>
          </div>
          <button
            id="submit-exam-btn"
            className="btn btn-primary"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Exam'}
          </button>
        </div>

        {/* Tab Switch Warning */}
        {showTabWarn && (
          <div className="tab-warning-banner">
            ⚠️ Tab switch detected! This is violation #{tabSwitches}. Repeated violations may lead to disqualification.
          </div>
        )}
        {tabSwitches > 0 && !showTabWarn && (
          <div style={{ background:'var(--warning-dim)', borderBottom:'1px solid rgba(251,191,36,0.2)', padding:'4px 16px', fontSize:11, color:'var(--warning)' }}>
            ⚠️ {tabSwitches} tab switch{tabSwitches>1?'es':''} recorded
          </div>
        )}

        {/* Body */}
        <div className="exam-body">
          {/* Question Area */}
          <div className="question-area">
            <div className="question-card">
              <div className="question-meta">
                <span className="badge badge-muted">Q{current+1}</span>
                {q.difficulty && <span className={`badge ${q.difficulty==='EASY'?'badge-success':q.difficulty==='HARD'?'badge-danger':'badge-warning'}`}>{q.difficulty}</span>}
                <span className="badge badge-accent">{q.marks} mark{q.marks!==1?'s':''}</span>
                {q.subject && <span style={{ fontSize:11, color:'var(--text-muted)' }}>{q.subject}</span>}
              </div>

              <p className="question-text">{q.text}</p>

              {q.type === 'DESCRIPTIVE' ? (
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Type your answer here…"
                  value={sel || ''}
                  onChange={e => answerCurrent(e.target.value)}
                />
              ) : (
                <div className="option-list">
                  {(q.options || []).map(opt => {
                    const isSelected = q.type === 'MCQ'
                      ? sel === opt.id
                      : sel?.split(',').includes(opt.id);

                    const choose = () => {
                      if (q.type === 'MCQ') {
                        answerCurrent(opt.id);
                      } else {
                        const current = sel ? sel.split(',') : [];
                        const next = current.includes(opt.id)
                          ? current.filter(x => x !== opt.id)
                          : [...current, opt.id];
                        answerCurrent(next.join(','));
                      }
                    };

                    return (
                      <div
                        key={opt.id}
                        className={`option-item${isSelected ? ' selected' : ''}`}
                        onClick={choose}
                      >
                        <div className={`option-radio${isSelected ? ' filled' : ''}`}
                          style={q.type === 'MULTI_SELECT' ? { borderRadius:4 } : {}} />
                        <span><strong>{opt.id})</strong> {opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrent(c => Math.max(0, c-1))}
                disabled={current === 0}
              >← Previous</button>

              <div className="flex gap-2">
                <button
                  className={`btn ${marked.includes(q.id) ? 'btn-warning' : 'btn-ghost'}`}
                  onClick={toggleMark}
                  style={{ border: marked.includes(q.id) ? '1px solid var(--warning)' : undefined }}
                >
                  {marked.includes(q.id) ? '🚩 Marked' : '🚩 Mark for Review'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setAnswers(a => { const n={...a}; delete n[q.id]; return n; });
                  }}
                  disabled={!sel}
                >Clear</button>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setCurrent(c => Math.min(questions.length-1, c+1))}
                disabled={current === questions.length-1}
              >Next →</button>
            </div>
          </div>

          {/* Question Palette */}
          <div className="question-palette">
            <div className="palette-title">Question Palette</div>
            <div className="palette-grid">
              {questions.map((qu, idx) => {
                const isAnswered = !!answers[qu.id];
                const isMarked   = marked.includes(qu.id);
                const isCurrent  = idx === current;
                let cls = '';
                if (isCurrent)  cls = 'current';
                else if (isMarked)   cls = 'marked';
                else if (isAnswered) cls = 'answered';
                return (
                  <button
                    key={qu.id}
                    className={`palette-btn ${cls}`}
                    onClick={() => setCurrent(idx)}
                    title={`Q${idx+1}`}
                  >{idx+1}</button>
                );
              })}
            </div>

            <div className="palette-legend">
              {[
                ['var(--success)', 'Answered'],
                ['var(--warning)', 'Marked'],
                ['var(--primary)', 'Current'],
                ['var(--border)',  'Unanswered'],
              ].map(([c, label]) => (
                <div className="legend-item" key={label}>
                  <div className="legend-dot" style={{ background:c }} />
                  {label}
                </div>
              ))}
            </div>

            <div style={{ marginTop:16, padding:'10px 0', borderTop:'1px solid var(--border)' }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>Auto-save active ✓</div>
              <div style={{ fontSize:11, color: tabSwitches > 3 ? 'var(--danger)' : 'var(--text-muted)' }}>
                Tab switches: {tabSwitches}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
