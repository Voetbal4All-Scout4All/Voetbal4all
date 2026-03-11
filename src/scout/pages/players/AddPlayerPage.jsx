import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import playerService from '../../services/playerService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from './AddPlayerPage.module.css';

const POSITIONS = [
  { code: 'GK', label: 'Doelman' },
  { code: 'SW', label: 'Libero' },
  { code: 'CB', label: 'Centrale back' },
  { code: 'LB', label: 'Linksback' },
  { code: 'RB', label: 'Rechtsback' },
  { code: 'LWB', label: 'Linker wingback' },
  { code: 'RWB', label: 'Rechter wingback' },
  { code: 'CDM', label: 'Defensieve mid' },
  { code: 'CM', label: 'Centrale mid' },
  { code: 'LM', label: 'Linker mid' },
  { code: 'RM', label: 'Rechter mid' },
  { code: 'CAM', label: 'Creatieve mid' },
  { code: 'AM', label: 'Aanvallende mid' },
  { code: 'LW', label: 'Linksbuiten' },
  { code: 'RW', label: 'Rechtsbuiten' },
  { code: 'SS', label: 'Schaduwspits' },
  { code: 'CF', label: 'Centrumforward' },
  { code: 'ST', label: 'Spits' },
  ];

const AddPlayerPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
          first_name: '', last_name: '', date_of_birth: '', nationality: '',
          height_cm: '', weight_kg: '', preferred_foot: 'right',
          primary_position_code: '', secondary_position_code: '',
          current_club_name: '', current_club_city: '', current_team_name: '',
          notes: '', tags: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
          e.preventDefault();
          if (!form.first_name || !form.last_name) {
                  setError('Voornaam en achternaam zijn verplicht.');
                  return;
          }
          setLoading(true);
          setError('');
          try {
                  const player = await playerService.createPlayer({
                            ...form,
                            height_cm: form.height_cm ? parseInt(form.height_cm) : null,
                            weight_kg: form.weight_kg ? parseInt(form.weight_kg) : null,
                  });
                  navigate(`/players/${player.id}`);
          } catch (err) {
                  setError(err.message || 'Fout bij opslaan.');
          } finally {
                  setLoading(false);
          }
    };

    return (
          <div className={styles.page}>
                  <div className={styles.header}>
                            <button className={styles.back} onClick={() => navigate('/players')}>&larr; Terug</button>
                            <h1 className={styles.title}>Nieuwe speler</h1>
                  </div>

                  <form className={styles.form} onSubmit={handleSubmit}>
                    {/* Persoonlijke info */}
                            <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>Persoonlijke informatie</h2>
                                        <div className={styles.row}>
                                                      <Input label="Voornaam *" value={form.first_name} onChange={set('first_name')} />
                                                      <Input label="Achternaam *" value={form.last_name} onChange={set('last_name')} />
                                        </div>
                                        <div className={styles.row}>
                                                      <Input label="Geboortedatum" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
                                                      <Input label="Nationaliteit (ISO code)" placeholder="BE / NL / FR" value={form.nationality} onChange={set('nationality')} maxLength={2} />
                                        </div>
                                        <div className={styles.row}>
                                                      <Input label="Lengte (cm)" type="number" value={form.height_cm} onChange={set('height_cm')} placeholder="180" />
                                                      <Input label="Gewicht (kg)" type="number" value={form.weight_kg} onChange={set('weight_kg')} placeholder="75" />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                                      <label className={styles.label}>Voorkeursbeen</label>
                                                      <div className={styles.radioGroup}>
                                                        {['right', 'left', 'both'].map(foot => (
                            <label key={foot} className={styles.radioLabel}>
                                                <input type="radio" name="preferred_foot" value={foot} checked={form.preferred_foot === foot} onChange={set('preferred_foot')} />
                              {foot === 'right' ? 'Rechts' : foot === 'left' ? 'Links' : 'Beide'}
                            </label>
                          ))}
                                                      </div>
                                        </div>
                            </section>

                    {/* Positie */}
                            <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>Positie</h2>
                                        <div className={styles.row}>
                                                      <div className={styles.fieldGroup}>
                                                                      <label className={styles.label}>Primaire positie *</label>
                                                                      <select className={styles.select} value={form.primary_position_code} onChange={set('primary_position_code')}>
                                                                                        <option value="">Selecteer positie</option>
                                                                        {POSITIONS.map(p => <option key={p.code} value={p.code}>{p.code} &mdash; {p.label}</option>)}
                                                                      </select>
                                                      </div>
                                                    <div className={styles.fieldGroup}>
                                                                  <label className={styles.label}>Secundaire positie</label>
                                                                  <select className={styles.select} value={form.secondary_position_code} onChange={set('secondary_position_code')}>
                                                                                  <option value="">Geen</option>
                                                                    {POSITIONS.map(p => <option key={p.code} value={p.code}>{p.code} &mdash; {p.label}</option>)}
                                                                  </select>
                                                    </div>
                                        </div>
                            </section>
                  
                    {/* Huidige club */}
                          <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Huidige club (van de speler)</h2>
                                    <div className={styles.row}>
                                                <Input label="Clubnaam" value={form.current_club_name} onChange={set('current_club_name')} placeholder="bv. Club Brugge" />
                                                <Input label="Stad" value={form.current_club_city} onChange={set('current_club_city')} placeholder="bv. Brugge" />
                                    </div>
                                    <Input label="Ploeg / leeftijdscategorie" value={form.current_team_name} onChange={set('current_team_name')} placeholder="bv. U17 A" />
                          </section>
                  
                    {/* Extra */}
                          <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Extra</h2>
                                    <div className={styles.fieldGroup}>
                                                <label className={styles.label}>Notities</label>
                                                <textarea className={styles.textarea} value={form.notes} onChange={set('notes')} placeholder="Algemene indrukken, bijzonderheden\u2026" rows={4} />
                                    </div>
                                    <Input label="Tags (komma-gescheiden)" value={form.tags} onChange={set('tags')} placeholder="snelheid, linksbenig, technisch" />
                          </section>
                  
                    {error && <div className={styles.error}>{error}</div>}
                  
                          <div className={styles.formActions}>
                                    <Button variant="secondary" type="button" onClick={() => navigate('/players')}>Annuleren</Button>
                                    <Button variant="primary" type="submit" loading={loading}>Speler opslaan</Button>
                          </div>
                  </form>
          </div>
        );
};

export default AddPlayerPage;</option>
