import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardApp from './components/DashboardApp';

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Password Recovery Handler Route (accessible via recovery email link) */}
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      {/* Protected Job Tracker Workspace */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
