import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import ScoutLayout from '../components/layout/ScoutLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/DashboardPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div
        className="s4a-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--s4a-border)',
          borderTopColor: 'var(--s4a-blue)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/scout/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/scout/dashboard" replace />;

  return children;
};

const ScoutRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/scout/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/scout/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected routes with layout */}
          <Route
            path="/scout"
            element={
              <ProtectedRoute>
                <ScoutLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/scout/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {/* Fase 2 routes — placeholders */}
            <Route path="zoeken" element={<Placeholder title="Zoeken" />} />
            <Route path="spelers" element={<Placeholder title="Spelers" />} />
            <Route path="rapporten" element={<Placeholder title="Rapporten" />} />
            <Route path="videos" element={<Placeholder title="Video's" />} />
            <Route path="watchlists" element={<Placeholder title="Watchlists" />} />
            <Route path="vergelijken" element={<Placeholder title="Vergelijken" />} />
            <Route path="shadow-teams" element={<Placeholder title="Shadow Teams" />} />
            <Route path="club" element={<Placeholder title="Club Dashboard" />} />
            <Route path="club/taken" element={<Placeholder title="Taken" />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/scout/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

const Placeholder = ({ title }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: 'var(--s4a-space-4)',
    }}
  >
    <h2
      style={{
        fontFamily: 'var(--s4a-font-display)',
        fontSize: '1.3rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'var(--s4a-text-muted)',
      }}
    >
      {title}
    </h2>
    <p style={{ color: 'var(--s4a-text-muted)', fontStyle: 'italic' }}>
      Beschikbaar in Fase 2
    </p>
  </div>
);

export default ScoutRouter;
