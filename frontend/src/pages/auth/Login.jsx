import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate(res.data.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎯</div>
          <div className="auth-logo-text">Exam<span>Portal</span></div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" style={{ width:16,height:16 }} /> Signing in…</>
            ) : 'Sign In →'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register as a student</Link>
        </div>

        <div className="auth-divider">Demo Credentials</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div className="card" style={{ padding:'10px 12px', fontSize:12 }}>
            <div style={{ fontWeight:700, marginBottom:4 }}>🔑 Admin</div>
            <div style={{ color:'var(--text-muted)' }}>admin@exam.com</div>
            <div style={{ color:'var(--text-muted)' }}>admin123</div>
          </div>
          <div className="card" style={{ padding:'10px 12px', fontSize:12 }}>
            <div style={{ fontWeight:700, marginBottom:4 }}>👤 Student</div>
            <div style={{ color:'var(--text-muted)' }}>student@exam.com</div>
            <div style={{ color:'var(--text-muted)' }}>student123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
