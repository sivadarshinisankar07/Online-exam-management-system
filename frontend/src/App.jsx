import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminLayout, StudentLayout } from './components/ProtectedRoute';
import './index.css';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminExams      from './pages/admin/AdminExams';
import CreateExam      from './pages/admin/CreateExam';
import ExamDetail      from './pages/admin/ExamDetail';
import QuestionBank    from './pages/admin/QuestionBank';
import AdminStudents   from './pages/admin/AdminStudents';
import LiveMonitor     from './pages/admin/LiveMonitor';
import AdminResults    from './pages/admin/AdminResults';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';

// Student
import StudentDashboard  from './pages/student/StudentDashboard';
import StudentExams      from './pages/student/StudentExams';
import ExamInstructions  from './pages/student/ExamInstructions';
import ExamAttempt       from './pages/student/ExamAttempt';
import StudentResults    from './pages/student/StudentResults';
import ExamHistory       from './pages/student/ExamHistory';
import StudentLeaderboard from './pages/student/StudentLeaderboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"      element={<AdminDashboard />} />
            <Route path="exams"          element={<AdminExams />} />
            <Route path="exams/create"   element={<CreateExam />} />
            <Route path="exams/:id"      element={<ExamDetail />} />
            <Route path="question-bank"  element={<QuestionBank />} />
            <Route path="students"       element={<AdminStudents />} />
            <Route path="monitor"        element={<LiveMonitor />} />
            <Route path="results"        element={<AdminResults />} />
            <Route path="leaderboard"    element={<AdminLeaderboard />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"   element={<StudentDashboard />} />
            <Route path="exams"       element={<StudentExams />} />
            <Route path="results"     element={<StudentResults />} />
            <Route path="history"     element={<ExamHistory />} />
            <Route path="leaderboard" element={<StudentLeaderboard />} />
          </Route>

          {/* Exam Attempt (full-screen, no sidebar) */}
          <Route path="/student/exam/:id/instructions" element={<ExamInstructions />} />
          <Route path="/student/exam/:id/attempt"      element={<ExamAttempt />} />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
