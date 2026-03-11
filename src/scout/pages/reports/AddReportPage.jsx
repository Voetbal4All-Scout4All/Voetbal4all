import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import reportService from '../../services/reportService';
import playerService from '../../services/playerService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from './AddReportPage.module.css';

const ScoreSlider = ({ label, value, onChange, note, onNoteChange }) => (
    <div className={styles.scoreItem}>
          <div className={styles.scoreHeader}>
                  <span className={styles.scoreName}>{label}</span>span>
                  <span className={styles.scoreVal}>{value ?? '\u2014'}</span>span>
          </div>div>
          <input type="range" min="1" max="10" step="0.5" value={value ?? 5} onChange={e => onChange(parseFloat(e.target.value))} className={styles.slider} />
          <input type="text" className={styles.scoreNote} placeholder="Nota (optioneel)" value={note ?? ''} onChange={e => onNoteChange(e.target.value)} />
    </div>div>
  );

const AddReportPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedPlayerId = searchParams.get('player');

    const [players, setPlayers] = useState([]);
    const [form, setForm] = useState({
          player_id: preselectedPlayerId || '',
          match_date: '', match_home_team: '', match_away_team: '',
          match_competition: '', match_venue: '', age_category: '',
          report_type: 'match', potential_rating: 3,
          recommended_next_level: '', summary: '', strengths: '',
          weaknesses: '', notes: '', status: 'draft',
    });
    const [scores, setScores] = useState({});
    const [criteria, setCriteria] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
          const load = async () => {
                  try {
                            const [p, c] = await Promise.all([
                                        playerService.getPlayers({ archived: false }),
                                        reportService.getCriteria(),
                                      ]);
                            setPlayers(Array.isArray(p) ? p : p.data ?? []);
                            setCriteria(Array.isArray(c) ? c : c.data ?? []);
                  } catch {}
          };
          load();
    }, []);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const setScore = (criteriaId, score) =>
          setScores(s => ({ ...s, [criteriaId]: { ...s[criteriaId], score } }));

    const setScoreNote = (criteriaId, note) =>
          setScores(s => ({ ...s, [criteriaId]: { ...s[criteriaId], note } }));

    const handleSubmit = async (status) => {
          if (!form.player_id) { setError('Selecteer een speler.'); return; }
          setLoading(true);
          setError('');
          try {
                  const scorePayload = Object.entries(scores)
                    .filter(([, v]) => v.score != null)
                    .map(([criteria_id, v]) => ({ criteria_id, score: v.score, note: v.note || null }));

            const report = await reportService.createReport({
                      ...form,
                      potential_rating: parseInt(form.potential_rating),
                      status,
                      scores: scorePayload,
            });
                  navigate(`/reports/${report.id}`);
          } catch (err) {
                  setError(err.message || 'Fout bij opslaan.');
          } finally {
                  setLoading(false);
          }
    };

    const grouped = criteria.reduce((acc, c) => {
          const cat = c.category || 'Overige';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(c);
          return acc;
    }, {});

    return (
          <div className={styles.page}>
                  <button className={styles.back} onClick={() => navigate(-1)}>&larr; Terug</button>button>
                  <h1 className={styles.title}>Nieuw scoutingrapport</h1>h1>

                  <div className={styles.form}>
                    {/* Speler */}
                            <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>Speler</h2>h2>
                                        <div className={styles.fieldGroup}>
                                                      <label className={styles.label}>Speler *</label>label>
                                                      <select className={styles.select} value={form.player_id} onChange={set('player_id')}>
                                                                      <option value="">Selecteer speler</option>option>
                                                        {players.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.first_name} {p.last_name}{p.primary_position_code ? ` (${p.primary_position_code})` : ''}
                            </option>option>
                          ))}
                                                      </select>select>
                                        </div>div>
                            </section>section>
                  
                    {/* Wedstrijdinfo */}
                          <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Wedstrijdinformatie</h2>h2>
                                    <div className={styles.row}>
                                                <Input label="Datum" type="date" value={form.match_date} onChange={set('match_date')} />
                                                <div className={styles.fieldGroup}>
                                                              <label className={styles.label}>Type observatie</label>label>
                                                              <select className={styles.select} value={form.report_type} onChange={set('report_type')}>
                                                                              <option value="match">Wedstrijd</option>option>
                                                                              <option value="training">Training</option>option>
                                                                              <option value="video">Video</option>option>
                                                              </select>select>
                                                </div>div>
                                    </div>div>
                                    <div className={styles.row}>
                                                <Input label="Thuisploeg" value={form.match_home_team} onChange={set('match_home_team')} />
                                                <Input label="Uitploeg" value={form.match_away_team} onChange={set('match_away_team')} />
                                    </div>div>
                                    <div className={styles.row}>
                                                <Input label="Competitie" value={form.match_competition} onChange={set('match_competition')} placeholder="bv. Pro League U17" />
                                                <Input label="Locatie" value={form.match_venue} onChange={set('match_venue')} />
                                    </div>div>
                                    <div className={styles.row}>
                                                <Input label="Leeftijdscategorie" value={form.age_category} onChange={set('age_category')} placeholder="U15, U17, Senior\u2026" />
                                    </div>div>
                          </section>section>
                  
                    {/* Scores per criterium */}
                    {Object.entries(grouped).length > 0 && (
                      <section className={styles.section}>
                                  <h2 className={styles.sectionTitle}>Evaluatie per criterium</h2>h2>
                                  <p className={styles.hint}>Score 1&ndash;10 per criterium. Vul enkel in wat je hebt kunnen observeren.</p>p>
                        {Object.entries(grouped).map(([cat, items]) => (
                                      <div key={cat} className={styles.categoryGroup}>
                                                      <h3 className={styles.categoryTitle}>{cat}</h3>h3>
                                                      <div className={styles.scoresGrid}>
                                                        {items.map(c => (
                                                            <ScoreSlider
                                                                                    key={c.id}
                                                                                    label={c.name_nl || c.name_en || c.name}
                                                                                    value={scores[c.id]?.score}
                                                                                    onChange={v => setScore(c.id, v)}
                                                                                    note={scores[c.id]?.note}
                                                                                    onNoteChange={v => setScoreNote(c.id, v)}
                                                                                  />
                                                          ))}
                                                      </div>div>
                                      </div>div>
                                    ))}
                      </section>section>
                          )}
                  
                    {/* Potentieel */}
                          <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Potentieel &amp; aanbeveling</h2>h2>
                                    <div className={styles.row}>
                                                <div className={styles.fieldGroup}>
                                                              <label className={styles.label}>Potentieel (1&ndash;5 sterren)</label>label>
                                                              <div className={styles.starRow}>
                                                                {[1,2,3,4,5].map(n => (
                              <button
                                                    key={n}
                                                    type="button"
                                                    className={`${styles.star} ${n <= form.potential_rating ? styles.starActive : ''}`}
                                                    onClick={() => setForm(f => ({ ...f, potential_rating: n }))}
                                                  >
                                                  &#9733;
                              </button>button>
                            ))}
                                                              </div>div>
                                                </div>div>
                                                <Input label="Aanbevolen volgend niveau" value={form.recommended_next_level} onChange={set('recommended_next_level')} placeholder="U21, Profs, Academie\u2026" />
                                    </div>div>
                          </section>section>
                  
                    {/* Tekstuele beoordeling */}
                          <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Beoordeling</h2>h2>
                                    <div className={styles.fieldGroup}>
                                                <label className={styles.label}>Samenvatting</label>label>
                                                <textarea className={styles.textarea} rows={3} value={form.summary} onChange={set('summary')} placeholder="Algemene indruk van de speler\u2026" />
                                    </div>div>
                                    <div className={styles.row}>
                                                <div className={styles.fieldGroup}>
                                                              <label className={styles.label}>Sterke punten</label>label>
                                                              <textarea className={styles.textarea} rows={3} value={form.strengths} onChange={set('strengths')} placeholder="Wat valt op in positieve zin?" />
                                                </div>div>
                                                <div className={styles.fieldGroup}>
                                                              <label className={styles.label}>Werkpunten</label>label>
                                                              <textarea className={styles.textarea} rows={3} value={form.weaknesses} onChange={set('weaknesses')} placeholder="Wat kan beter?" />
                                                </div>div>
                                    </div>div>
                                    <div className={styles.fieldGroup}>
                                                <label className={styles.label}>Vrije notities</label>label>
                                                <textarea className={styles.textarea} rows={2} value={form.notes} onChange={set('notes')} placeholder="Contextuele info, omstandigheden\u2026" />
                                    </div>div>
                          </section>section>
                  
                    {error && <div className={styles.error}>{error}</div>div>}
                  
                          <div className={styles.formActions}>
                                    <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Annuleren</Button>Button>
                                    <Button variant="secondary" type="button" loading={loading} onClick={() => handleSubmit('draft')}>Opslaan als draft</Button>Button>
                                    <Button variant="primary" type="button" loading={loading} onClick={() => handleSubmit('completed')}>Rapport voltooien</Button>Button>
                          </div>div>
                  </div>div>
          </div>div>
        );
};

export default AddReportPage;</option>
