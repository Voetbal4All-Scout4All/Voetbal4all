import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import reportService from '../../services/reportService';
import Button from '../../components/ui/Button';
import styles from './ReportDetailPage.module.css';

const ScoreBar = ({ label, score }) => (
    <div className={styles.scoreBar}>
          <div className={styles.scoreBarHeader}>
                  <span className={styles.scoreBarName}>{label}</span>
                  <span className={styles.scoreBarVal}>{score?.toFixed(1) ?? '\u2014'}</span>
          </div>
      {score != null && (
            <div className={styles.scoreBarTrack}>
                      <div className={styles.scoreBarFill} style={{ width: `${(score / 10) * 100}%` }} />
            </div>
          )}
    </div>
  );

const ReportDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
          const load = async () => {
                  try {
                            const data = await reportService.getReport(id);
                            setReport(data);
                  } catch {
                            navigate(-1);
                  } finally {
                            setLoading(false);
                  }
          };
          load();
    }, [id]);

    if (loading) return <div className={styles.loading}>Laden&hellip;</div>;
    if (!report) return null;

    return (
          <div className={styles.page}>
                  <button className={styles.back} onClick={() => navigate(`/players/${report.player_id}`)}>
                            &larr; {report.player_first_name} {report.player_last_name}
                  </button>

            {/* Header */}
                  <div className={styles.header}>
                            <div>
                                      <h1 className={styles.title}>
                                        {report.player_first_name} {report.player_last_name}
                                      </h1>
                                      <div className={styles.meta}>
                                        {report.match_date && (
                          <span>{new Date(report.match_date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                  )}
                                        {report.match_competition && <span>&middot; {report.match_competition}</span>}
                                        {report.age_category && <span>&middot; {report.age_category}</span>}
                                      </div>
                              {report.match_home_team && (
                        <div className={styles.match}>
                          {report.match_home_team} vs {report.match_away_team}
                          {report.match_venue && ` \u00B7 ${report.match_venue}`}
                        </div>
                                      )}
                            </div>
                          <div className={styles.headerRight}>
                            {report.score_overall != null && (
                        <div className={styles.overallScore}>
                                      <span className={styles.overallVal}>{Number(report.score_overall).toFixed(1)}</span>
                                      <span className={styles.overallLbl}>Overall</span>
                        </div>
                                    )}
                                    <span className={`${styles.badge} ${styles['badge_' + report.status]}`}>
                                      {report.status === 'draft' ? 'Draft' : 'Voltooid'}
                                    </span>
                          </div>
                  </div>
          
            {/* Categoriescores */}
            {(report.score_technical || report.score_physical || report.score_tactical || report.score_mental) && (
                    <div className={styles.categoryScores}>
                              <h2 className={styles.sectionTitle}>Scores per categorie</h2>
                              <div className={styles.scoreBars}>
                                {report.score_technical != null && <ScoreBar label="Technisch" score={report.score_technical} />}
                                {report.score_physical != null && <ScoreBar label="Fysiek" score={report.score_physical} />}
                                {report.score_tactical != null && <ScoreBar label="Tactisch" score={report.score_tactical} />}
                                {report.score_mental != null && <ScoreBar label="Mentaal" score={report.score_mental} />}
                              </div>
                    </div>
                )}
          
            {/* Potentieel */}
            {report.potential_rating != null && (
                    <div className={styles.card}>
                              <h2 className={styles.sectionTitle}>Potentieel</h2>
                              <div className={styles.stars}>
                                {[1,2,3,4,5].map(n => (
                                    <span key={n} className={n <= report.potential_rating ? styles.starActive : styles.star}>&#9733;</span>
                                  ))}
                              </div>
                      {report.recommended_next_level && (
                                  <p className={styles.nextLevel}>Aanbevolen volgend niveau: <strong>{report.recommended_next_level}</strong></p>
                              )}
                    </div>
                )}
          
            {/* Tekstuele beoordeling */}
            {(report.summary || report.strengths || report.weaknesses) && (
                    <div className={styles.card}>
                              <h2 className={styles.sectionTitle}>Beoordeling</h2>
                      {report.summary && (
                                  <div className={styles.textBlock}>
                                                <span className={styles.textLabel}>Samenvatting</span>
                                                <p>{report.summary}</p>
                                  </div>
                              )}
                              <div className={styles.swGrid}>
                                {report.strengths && (
                                    <div className={`${styles.textBlock} ${styles.strengths}`}>
                                                    <span className={styles.textLabel}>Sterke punten</span>
                                                    <p>{report.strengths}</p>
                                    </div>
                                          )}
                                {report.weaknesses && (
                                    <div className={`${styles.textBlock} ${styles.weaknesses}`}>
                                                    <span className={styles.textLabel}>Werkpunten</span>
                                                    <p>{report.weaknesses}</p>
                                    </div>
                                          )}
                              </div>
                      {report.notes && (
                                  <div className={styles.textBlock}>
                                                <span className={styles.textLabel}>Notities</span>
                                                <p>{report.notes}</p>
                                  </div>
                              )}
                    </div>
                )}
          
            {/* Detailscores per criterium */}
            {report.scores?.length > 0 && (
                    <div className={styles.card}>
                              <h2 className={styles.sectionTitle}>Detailscores</h2>
                              <div className={styles.detailScores}>
                                {report.scores.map(s => (
                                    <div key={s.criteria_id} className={styles.detailScore}>
                                                    <ScoreBar label={s.criteria_name_nl || s.criteria_name} score={s.score} />
                                      {s.note && <p className={styles.detailNote}>{s.note}</p>}
                                    </div>
                                  ))}
                              </div>
                    </div>
                )}
          
                <div className={styles.actions}>
                        <Button variant="secondary" onClick={() => navigate(`/players/${report.player_id}`)}>
                                  Terug naar speler
                        </Button>
                </div>
          </div>
        );
};

export default ReportDetailPage;</div>
