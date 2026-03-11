import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import playerService from '../services/playerService';
import reportService from '../services/reportService';
import Button from '../components/ui/Button';
import styles from './DashboardPage.module.css';

const StatCard = ({ label, value, icon, accent }) => (
    <div className={`${styles.statCard} ${accent ? styles['accent_' + accent] : ''}`}>
          <span className={styles.statIcon}>{icon}</span>
          <span className={styles.statValue}>{value ?? '\u2014'}</span>
          <span className={styles.statLabel}>{label}</span>
    </div>
  );

const DashboardPage = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ players: null, reports: null, drafts: null });
    const [recentReports, setRecentReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
          const load = async () => {
                  try {
                            const [playersData, reportsData] = await Promise.all([
                                        playerService.getPlayers({ limit: 1 }),
                                        reportService.getMyRecentReports(5),
                                      ]);
                            setStats({
                                        players: playersData.total ?? playersData.length ?? 0,
                                        reports: reportsData.total ?? reportsData.length ?? 0,
                                        drafts: reportsData.filter?.(r => r.status === 'draft').length ?? 0,
                            });
                            setRecentReports(Array.isArray(reportsData) ? reportsData : reportsData.data ?? []);
                  } catch {
                            // Toon lege staat bij API-fout
                  } finally {
                            setLoading(false);
                  }
          };
          load();
    }, []);

    const firstName = user?.first_name || user?.email?.split('@')[0] || 'Scout';

    return (
          <div className={styles.page}>
            {/* Header */}
                  <div className={styles.header}>
                            <div>
                                      <h1 className={styles.greeting}>Welkom terug, {firstName} </h1>
                                      <p className={styles.subtitle}>Hier is een overzicht van je scoutingactiviteit.</p>
                            </div>
                          <div className={styles.headerActions}>
                                    <Button variant="secondary" onClick={() => navigate('/players/add')}>
                                                + Nieuwe speler
                                    </Button>
                                    <Button variant="primary" onClick={() => navigate('/reports/add')}>
                                                + Nieuw rapport
                                    </Button>
                          </div>
                  </div>
          
            {/* Stat cards */}
                <div className={styles.statsGrid}>
                        <StatCard label="Spelers in database" value={loading ? '\u2026' : stats.players} icon="\uD83D\uDC65" accent="blue" />
                        <StatCard label="Rapporten" value={loading ? '\u2026' : stats.reports} icon="\uD83D\uDCCB" />
                        <StatCard label="Drafts" value={loading ? '\u2026' : stats.drafts} icon="\u270F\uFE0F" accent="orange" />
                        <StatCard label="Actief plan" value={user?.subscription_plan ?? 'Free'} icon="\u2B50" />
                </div>
          
            {/* Recente rapporten */}
                <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                                  <h2 className={styles.sectionTitle}>Recente rapporten</h2>
                                  <button className={styles.seeAll} onClick={() => navigate('/players')}>
                                              Alle spelers &rarr;
                                  </button>
                        </div>
                  {loading ? (
                      <div className={styles.loading}>Laden&hellip;</div>
                    ) : recentReports.length === 0 ? (
                      <div className={styles.empty}>
                                  <p>Nog geen rapporten. Start met scouten!</p>
                                  <Button variant="primary" onClick={() => navigate('/players/add')}>
                                                Eerste speler toevoegen
                                  </Button>
                      </div>
                    ) : (
                      <div className={styles.reportsList}>
                        {recentReports.map(report => (
                                      <div
                                                        key={report.id}
                                                        className={styles.reportRow}
                                                        onClick={() => navigate(`/reports/${report.id}`)}
                                                      >
                                                      <div className={styles.reportInfo}>
                                                                        <span className={styles.reportPlayer}>
                                                                          {report.player_first_name} {report.player_last_name}
                                                                        </span>
                                                                        <span className={styles.reportMeta}>
                                                                          {report.match_date
                                                                                                  ? new Date(report.match_date).toLocaleDateString('nl-BE')
                                                                                                  : 'Geen datum'}{' '}
                                                                                            &middot; {report.match_competition || 'Onbekende competitie'}
                                                                        </span>
                                                      </div>
                                                      <div className={styles.reportRight}>
                                                        {report.score_overall != null && (
                                                                            <span className={styles.score}>{Number(report.score_overall).toFixed(1)}</span>
                                                                        )}
                                                                        <span className={`${styles.badge} ${styles['badge_' + report.status]}`}>
                                                                          {report.status === 'draft' ? 'Draft' : 'Voltooid'}
                                                                        </span>
                                                                        <span className={styles.reportArrow}>&rsaquo;</span>
                                                      </div>
                                      </div>
                                    ))}
                      </div>
                        )}
                </div>
          
            {/* Upgrade CTA (alleen bij Free plan) */}
            {(user?.subscription_plan === 'free' || !user?.subscription_plan) && (
                    <div className={styles.upgradeCta}>
                              <div className={styles.upgradeText}>
                                          <span className={styles.upgradeTitle}>Upgrade naar Pro</span>
                                          <span className={styles.upgradeDesc}>
                                                        Onbeperkt spelers, radargrafieken, PDF-export en meer.
                                          </span>
                              </div>
                              <Button variant="primary" onClick={() => navigate('/upgrade')}>
                                          Bekijk plannen
                              </Button>
                    </div>
                )}
          </div>
        );
};

export default DashboardPage;
