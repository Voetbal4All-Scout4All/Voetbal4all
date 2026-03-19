import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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

    const firstName = user?.name || user?.email?.split('@')[0] || 'Scout';

    return (
          <div className={styles.page}>
            {/* Header */}
                 <div className={styles.header}>
                            <div>
                                     <h1 className={styles.greeting}>{t('dashboard.welcomeBack', { name: firstName })}</h1>
                                     <p className={styles.subtitle}>{t('dashboard.overviewSubtitle')}</p>
                            </div>
                          <div className={styles.headerActions}>
                                    <Button variant="secondary" onClick={() => navigate('/players/add')}>
                                               {t('dashboard.newPlayer')}
                                    </Button>
                                    <Button variant="primary" onClick={() => navigate('/reports/add')}>
                                               {t('dashboard.newReport')}
                                    </Button>
                          </div>
                 </div>

            {/* Stat cards */}
                <div className={styles.statsGrid}>
                        <StatCard label={t('dashboard.playersInDb')} value={loading ? '\u2026' : stats.players} icon="\ud83d\udc65" accent="blue" />
                        <StatCard label={t('dashboard.reports')} value={loading ? '\u2026' : stats.reports} icon="\ud83d\udccb" />
                        <StatCard label={t('dashboard.drafts')} value={loading ? '\u2026' : stats.drafts} icon="\u270f\ufe0f" accent="orange" />
                        <StatCard label={t('dashboard.activePlan')} value={user?.subscription_plan ?? 'Free'} icon="\u2b50" />
                </div>

            {/* Recente rapporten */}
                <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                                   <h2 className={styles.sectionTitle}>{t('dashboard.recentReports')}</h2>
                                   <button className={styles.seeAll} onClick={() => navigate('/players')}>
                                               {t('dashboard.allPlayers')} &rarr;
                                   </button>
                        </div>
                  {loading ? (
                      <div className={styles.loading}>{t('common.loading')}</div>
                    ) : recentReports.length === 0 ? (
                      <div className={styles.empty}>
                                   <p>{t('dashboard.noReports')}</p>
                                   <Button variant="primary" onClick={() => navigate('/players/add')}>
                                               {t('dashboard.addFirstPlayer')}
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
                                                                                                  : t('dashboard.noDate')}{' '}
                                                                                   &middot; {report.match_competition || t('dashboard.unknownCompetition')}
                                                                    </span>
                                                     </div>
                                                     <div className={styles.reportRight}>
                                                                    {report.score_overall != null && (
                                                                                   <span className={styles.score}>{Number(report.score_overall).toFixed(1)}</span>
                                                                    )}
                                                                    <span className={`${styles.badge} ${styles['badge_' + report.status]}`}>
                                                                                   {report.status === 'draft' ? t('dashboard.statusDraft') : t('dashboard.statusCompleted')}
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
                                          <span className={styles.upgradeTitle}>{t('dashboard.upgradeToPro')}</span>
                                          <span className={styles.upgradeDesc}>
                                                    {t('dashboard.upgradeDesc')}
                                          </span>
                                 </div>
                                 <Button variant="primary" onClick={() => navigate('/upgrade')}>
                                          {t('dashboard.viewPlans')}
                                 </Button>
                    </div>
                )}
          </div>
        );
};

export default DashboardPage;
