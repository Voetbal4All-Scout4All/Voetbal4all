import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import GlowDivider from '../components/ui/GlowDivider';

const DashboardPage = () => {
    const { t } = useTranslation();
    const { user, plan } = useAuthContext();

    return (
          <div>
                <div style={{ marginBottom: 'var(--s4a-space-6)' }}>
                        <h2
                                    style={{
                                                  fontFamily: 'var(--s4a-font-display)',
                                                  fontSize: '1.4rem',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.04em',
                                                  marginBottom: 'var(--s4a-space-2)',
                                    }}
                                  >
                          {t('dashboard.welcome', { name: user?.first_name || 'Scout' })}
                        </h2>h2>
                        <p style={{ color: 'var(--s4a-text-secondary)', fontSize: '0.9rem' }}>
                          {t('dashboard.welcomeSubtitle')}
                        </p>p>
                </div>div>
          
                <GlowDivider />
          
                <div
                          style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                      gap: 'var(--s4a-space-4)',
                          }}
                        >
                        <Card hoverable glowColor="blue">
                                  <div
                                                style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 'var(--s4a-space-3)',
                                                }}
                                              >
                                              <span
                                                              style={{
                                                                                fontFamily: 'var(--s4a-font-display)',
                                                                                textTransform: 'uppercase',
                                                                                fontSize: '0.85rem',
                                                                                color: 'var(--s4a-text-muted)',
                                                              }}
                                                            >
                                                {t('dashboard.reports')}
                                              </span>span>
                                              <Badge variant="position">0 / {plan?.max_reports || 10}</Badge>Badge>
                                  </div>div>
                                  <span style={{ fontFamily: 'var(--s4a-font-mono)', fontSize: '2rem', fontWeight: 700 }}>
                                              0
                                  </span>span>
                        </Card>Card>
                
                        <Card hoverable glowColor="orange">
                                  <div
                                                style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 'var(--s4a-space-3)',
                                                }}
                                              >
                                              <span
                                                              style={{
                                                                                fontFamily: 'var(--s4a-font-display)',
                                                                                textTransform: 'uppercase',
                                                                                fontSize: '0.85rem',
                                                                                color: 'var(--s4a-text-muted)',
                                                              }}
                                                            >
                                                {t('dashboard.players')}
                                              </span>span>
                                              <Badge variant="orange">0 / {plan?.max_players || 25}</Badge>Badge>
                                  </div>div>
                                  <span style={{ fontFamily: 'var(--s4a-font-mono)', fontSize: '2rem', fontWeight: 700 }}>
                                              0
                                  </span>span>
                        </Card>Card>
                
                        <Card hoverable glowColor="purple">
                                  <div
                                                style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 'var(--s4a-space-3)',
                                                }}
                                              >
                                              <span
                                                              style={{
                                                                                fontFamily: 'var(--s4a-font-display)',
                                                                                textTransform: 'uppercase',
                                                                                fontSize: '0.85rem',
                                                                                color: 'var(--s4a-text-muted)',
                                                              }}
                                                            >
                                                {t('dashboard.plan')}
                                              </span>span>
                                              <Badge variant="plan">{plan?.slug || 'free'}</Badge>Badge>
                                  </div>div>
                                  <span
                                                style={{
                                                                fontFamily: 'var(--s4a-font-mono)',
                                                                fontSize: '1.2rem',
                                                                fontWeight: 700,
                                                                textTransform: 'capitalize',
                                                }}
                                              >
                                    {plan?.slug || 'Free'}
                                  </span>span>
                        </Card>Card>
                </div>div>
          
                <div
                          style={{
                                      marginTop: 'var(--s4a-space-8)',
                                      padding: 'var(--s4a-space-6)',
                                      background: 'var(--s4a-bg-surface)',
                                      borderRadius: 'var(--s4a-radius-lg)',
                                      border: '1px solid var(--s4a-border)',
                          }}
                        >
                        <p style={{ color: 'var(--s4a-text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                          {t('dashboard.dashboardExpandPhase2')}
                        </p>p>
                </div>div>
          </div>div>
        );
};

export default DashboardPage;</div>
