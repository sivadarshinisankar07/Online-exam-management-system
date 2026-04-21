import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_LINKS = [
  { to: '/admin/dashboard',       icon: '⬡', label: 'Dashboard' },
  { to: '/admin/exams',           icon: '📋', label: 'Exams' },
  { to: '/admin/question-bank',   icon: '❓', label: 'Question Bank' },
  { to: '/admin/students',        icon: '👥', label: 'Students' },
  { to: '/admin/monitor',         icon: '📡', label: 'Live Monitor' },
  { to: '/admin/results',         icon: '📊', label: 'Results' },
  { to: '/admin/leaderboard',     icon: '🏆', label: 'Leaderboard' },
];

const STUDENT_LINKS = [
  { to: '/student/dashboard',   icon: '⬡',  label: 'Dashboard' },
  { to: '/student/exams',       icon: '📋', label: 'My Exams' },
  { to: '/student/results',     icon: '📊', label: 'Results' },
  { to: '/student/history',     icon: '⏱', label: 'History' },
  { to: '/student/leaderboard', icon: '🏆', label: 'Leaderboard' },
];

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'ADMIN' ? ADMIN_LINKS : STUDENT_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎯</div>
        <div>
          <span>ExamPortal</span>
          <small>{role === 'ADMIN' ? 'Administrator' : 'Student Portal'}</small>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Unknown'}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button
            id="logout-btn"
            className="logout-btn"
            title="Logout"
            onClick={handleLogout}
          >↩</button>
        </div>
      </div>
    </aside>
  );
}
