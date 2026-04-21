import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return null;
}

export function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/student/dashboard" replace />;

  return (
    <div className="app-layout">
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export function StudentLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'STUDENT') return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="app-layout">
      <Sidebar role="STUDENT" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
