import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import ScoutLayout from '../components/layout/ScoutLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/DashboardPage';

// i18n initialiseren (side-effect import, één keer)
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
                  </div>div>
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
                                                                </PublicRoute>PublicRoute>
                                    }
                                            />
                                            <Route
                                                          path="/scout/register"
                                                          element={
                                                                          <PublicRoute>
                                                                                          <RegisterPage />
                                                                          </PublicRoute>PublicRoute>
                                              }
                                                      />
                                            
                                              {/* Protected routes with layout */}
                                                      <Route
                                                                    path="/scout"
                                                                    element={
                                                                                    <ProtectedRoute>
                                                                                                    <ScoutLayout />
                                                                                    </ProtectedRoute>ProtectedRoute>
                                                        }
                                                                >
                                                                  <Route index element={<Navigate to="/scout/dashboard" replace />} />
                                                                  <Route path="dashboard" element={<DashboardPage />} />
                                                      
                                                        {/* Fase 2 routes — placeholders */}
                                                                  <Route path="zoeken" element={<Placeholder titleKey="nav.search" />} />
                                                                  <Route path="spelers" element={<Placeholder titleKey="nav.players" />} />
                                                                  <Route path="rapporten" element={<Placeholder titleKey="nav.reports" />} />
                                                                  <Route path="videos" element={<Placeholder titleKey="nav.videos" />} />
                                                                  <Route path="watchlists" element={<Placeholder titleKey="nav.watchlists" />} />
                                                                  <Route path="vergelijken" element={<Placeholder titleKey="nav.compare" />} />
                                                                  <Route path="shadow-teams" element={<Placeholder titleKey="nav.shadowTeams" />} />
                                                                  <Route path="club" element={<Placeholder titleKey="nav.clubDashboard" />} />
                                                                  <Route path="club/taken" element={<Placeholder titleKey="nav.tasks" />} />
                                                      </Route>Route>
                                            
                                              {/* Catch-all redirect */}
                                                      <Route path="*" element={<Navigate to="/scout/login" replace />} />
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
                          </h2>h2>
                          <p style={{ color: 'var(--s4a-text-muted)', fontStyle: 'italic' }}>
                            {t('dashboard.availableInPhase2')}
                          </p>p>
                    </div>div>
                  );
                  };
                
                export default ScoutRouter;</div>
