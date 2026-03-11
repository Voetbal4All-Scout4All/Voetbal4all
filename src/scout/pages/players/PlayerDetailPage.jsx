import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import playerService from '../../services/playerService';
import reportService from '../../services/reportService';
import Button from '../../components/ui/Button';
import styles from './PlayerDetailPage.module.css';

const PlayerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
          const load = async () => {
                  try {
                            const [p, r] = await Promise.all([
                                        playerService.getPlayer(id),
                                        reportService.getReportsByPlayer(id),
                                      ]);
                            setPlayer(p);
                            setReports(Array.isArray(r) ? r : r.data ?? []);
                  } catch {
                            navigate('/players');
                  } finally {
                            setLoading(false);
                  }
          };
          load();
    }, [id]);

    if (loading) return <div className={styles.loading}>Laden&hellip;</div>;
    if (!player) return null;

    const dob = player.date_of_birth ? new Date(player.date_of_birth) : null;
    const age = dob ? Math.floor((Date.now() - dob.getTime()) / 31557600000) : null;

    const avgScore = reports.length
      ? (reports.reduce((s, r) => s + (Number(r.score_overall) || 0), 0) / reports.filter(r => r.score_overall).length).toFixed(1)
          : null;

    return (
          <div className={styles.page}>
                  <button className={styles.back} onClick={() => navigate('/players')}>&larr; Alle spelers</button>

            {/* Profiel header */}
                  <div className={styles.profileHeader}>
                            <div className={styles.avatarWrapper}>
                              {player.photo_url ? (
                        <img src={player.photo_url} alt="" className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarFallback}>
                          {player.first_name?.[0]}{player.last_name?.[0]}
                        </div>
                      )}
                            </div>
                            <div className={styles.profileInfo}>
                                        <h1 className={styles.playerName}>{player.first_name} {player.last_name}</h1>
                                        <div className={styles.profileMeta}>
                                          {player.primary_position_code && (
                          <span className={styles.positionBadge}>{player.primary_position_code}</span>
                        )}
                                          {age && <span>{age} jaar</span>}
                                          {player.nationality && <span>{player.nationality}</span>}
                                          {player.current_club_name && <span>{player.current_club_name}</span>}
                                        </div>
                              {player.tags && (
                        <div className={styles.tags}>
                          {player.tags.split(',').map(tag => (
                                          <span key={tag} className={styles.tag}>{tag.trim()}</span>
                                        ))}
                        </div>
                                      )}
                            </div>
                          <div className={styles.profileActions}>
                                    <Button variant="primary" onClick={() => navigate(`/reports/add?player=${id}`)}>
                                                + Nieuw rapport
                                    </Button>
                          </div>
                  </div>
          
            {/* Stats row */}
                <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                                  <span className={styles.statVal}>{reports.length}</span>
                                  <span className={styles.statLbl}>Rapporten</span>
                        </div>
                        <div className={styles.statItem}>
                                  <span className={styles.statVal}>{avgScore ?? '\u2014'}</span>
                                  <span className={styles.statLbl}>Gem. score</span>
                        </div>
                        <div className={styles.statItem}>
                                  <span className={styles.statVal}>{player.height_cm ? `${player.height_cm} cm` : '\u2014'}</span>
                                  <span className={styles.statLbl}>Lengte</span>
                        </div>
                        <div className={styles.statItem}>
                                  <span className={styles.statVal}>
                                    {player.preferred_foot === 'right' ? 'Rechts' : player.preferred_foot === 'left' ? 'Links' : player.preferred_foot === 'both' ? 'Beide' : '\u2014'}
                                  </span>
                                  <span className={styles.statLbl}>Voorkeursbeen</span>
                        </div>
                </div>
          
            {/* Notities */}
            {player.notes && (
                    <div className={styles.notesCard}>
                              <h3 className={styles.notesTitle}>Notities</h3>
                              <p className={styles.notesText}>{player.notes}</p>
                    </div>
                )}
          
            {/* Rapporten lijst */}
                <div className={styles.reportsSection}>
                        <div className={styles.sectionHeader}>
                                  <h2 className={styles.sectionTitle}>Scoutingrapporten ({reports.length})</h2>
                        </div>
                  {reports.length === 0 ? (
                      <div className={styles.emptyReports}>
                                  <p>Nog geen rapporten voor deze speler.</p>
                                  <Button variant="primary" onClick={() => navigate(`/reports/add?player=${id}`)}>
                                                Eerste rapport schrijven
                                  </Button>
                      </div>
                    ) : (
                      <div className={styles.reportsList}>
                        {reports.map(report => (
                                      <div
                                                        key={report.id}
                                                        className={styles.reportRow}
                                                        onClick={() => navigate(`/reports/${report.id}`)}
                                                      >
                                                      <div className={styles.reportLeft}>
                                                                        <span className={styles.reportDate}>
                                                                          {report.match_date
                                                                                                  ? new Date(report.match_date).toLocaleDateString('nl-BE')
                                                                                                  : 'Geen datum'}
                                                                        </span>
                                                                        <span className={styles.reportComp}>
                                                                          {report.match_competition || 'Onbekende competitie'}
                                                                          {report.match_home_team && ` \u00B7 ${report.match_home_team} vs ${report.match_away_team}`}
                                                                        </span>
                                                      </div>
                                                      <div className={styles.reportRight}>
                                                        {report.score_overall != null && (
                                                                            <span className={styles.score}>{Number(report.score_overall).toFixed(1)}</span>
                                                                        )}
                                                                        <span className={`${styles.badge} ${styles['badge_' + report.status]}`}>
                                                                          {report.status === 'draft' ? 'Draft' : 'Voltooid'}
                                                                        </span>
                                                                        <span className={styles.arrow}>&rsaquo;</span>
                                                      </div>
                                      </div>
                                    ))}
                      </div>
                        )}
                </div>
          </div>
        );
};

export default PlayerDetailPage;
