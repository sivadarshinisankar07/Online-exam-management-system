import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function Register() {
  const [form, setForm]     = useState({ name:'', email:'', password:'', phone:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { ...form, role:'STUDENT' });
      login(res.data);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join thousands of students and start learning today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form id="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" name="name" type="text" className="form-control"
              placeholder="John Doe" value={form.name} onChange={handleChange} required autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" name="email" type="email" className="form-control"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="form-control"
                placeholder="Min 6 chars" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone (optional)</label>
              <input id="reg-phone" name="phone" type="tel" className="form-control"
                placeholder="+91 9999999999" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <button id="register-submit" type="submit"
            className="btn btn-primary btn-full btn-lg" style={{ marginTop:8 }} disabled={loading}>
            {loading
              ? <><span className="spinner" style={{width:16,height:16}} /> Creating Account…</>
              : 'Create Account →'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
