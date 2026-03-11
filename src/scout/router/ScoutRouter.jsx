import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import ScoutLayout from '../components/layout/ScoutLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import PlayerListPage from '../pages/players/PlayerListPage';
import PlayerDetailPage from '../pages/players/PlayerDetailPage';
import AddPlayerPage from '../pages/players/AddPlayerPage';
import AddReportPage from '../pages/reports/AddReportPage';
import ReportDetailPage from '../pages/reports/ReportDetailPage';

// i18n initialiseren (side-effect import)
import '../i18n/index.js';

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
                          <div
                                      style={{
                                                    width: 40,
                                                    height: 40,
                                                    border: '3px solid var(--s4a-border)',
                                                    borderTopColor: 'var(--s4a-blue)',
                                                    borderRadius: '50%',
                                                    animation: 'spin 0.6s linear infinite',
                                      }}
                                    />
                  </div>
                );
    }
  
    if (!isAuthenticated) {
          return <Navigate to="/login" replace />;
    }
  
    return children;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuthContext();
    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return children;
};

const ScoutRouter = () => {
    return (
          <BrowserRouter basename="/scout">
                <AuthProvider>
                        <Routes>
                          {/* Public routes */}
                                  <Route
                                                path="/login"
                                                element={
                                                                <PublicRoute>
                                                                                <LoginPage />
                                                                </PublicRoute>
                                    }
                                            />
                                            <Route
                                                          path="/register"
                                                          element={
                                                                          <PublicRoute>
                                                                                          <RegisterPage />
                                                                          </PublicRoute>
                                              }
                                                      />
                                            
                                              {/* Protected routes with layout */}
                                                      <Route
                                                                    path="/"
                                                                    element={
                                                                                    <ProtectedRoute>
                                                                                                    <ScoutLayout />
                                                                                    </ProtectedRoute>
                                                        }
                                                                >
                                                                  <Route index element={<Navigate to="/dashboard" replace />} />
                                                                  <Route path="dashboard" element={<DashboardPage />} />
                                                      
                                                        {/* Fase 2 — Players */}
                                                                  <Route path="players" element={<PlayerListPage />} />
                                                                  <Route path="players/add" element={<AddPlayerPage />} />
                                                                  <Route path="players/:id" element={<PlayerDetailPage />} />
                                                      
                                                        {/* Fase 2 — Reports */}
                                                                  <Route path="reports/add" element={<AddReportPage />} />
                                                                  <Route path="reports/:id" element={<ReportDetailPage />} />
                                                      
                                                        {/* Fase 2 routes — placeholders */}
                                                                  <Route path="zoeken" element={<Placeholder titleKey="nav.search" />} />
                                                                  <Route path="spelers" element={<Navigate to="/players" replace />} />
                                                                  <Route path="rapporten" element={<Navigate to="/reports/add" replace />} />
                                                                  <Route path="videos" element={<Placeholder titleKey="nav.videos" />} />
                                                                  <Route path="watchlists" element={<Placeholder titleKey="nav.watchlists" />} />
                                                                  <Route path="vergelijken" element={<Placeholder titleKey="nav.compare" />} />
                                                                  <Route path="shadow-teams" element={<Placeholder titleKey="nav.shadowTeams" />} />
                                                                  <Route path="club" element={<Placeholder titleKey="nav.clubDashboard" />} />
                                                                  <Route path="club/taken" element={<Placeholder titleKey="nav.tasks" />} />
                                                      </Route>
                                            
                                              {/* Catch-all redirect */}
                                                      <Route path="*" element={<Navigate to="/login" replace />} />
                                            </Route>Routes>
                                  </Route>AuthProvider>
                        </Routes>BrowserRouter>
                  );
                  };
                
                const Placeholder = ({ titleKey }) => {
                    const { t } = useTranslation();
                  return (
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
                            {t(titleKey)}
                          </h2>
                          <p style={{ color: 'var(--s4a-text-muted)', fontStyle: 'italic' }}>
                            {t('dashboard.availableInPhase2')}
                          </p>
                    </div>
                  );
                  };
                
                export default ScoutRouter;</div>
