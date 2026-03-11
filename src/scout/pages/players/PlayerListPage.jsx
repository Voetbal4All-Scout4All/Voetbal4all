import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import playerService from '../../services/playerService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from './PlayerListPage.module.css';

const POSITIONS = [
  { code: '', label: 'Alle posities' },
  { code: 'GK', label: 'Doelman' },
  { code: 'CB', label: 'Centrale back' },
  { code: 'LB', label: 'Linksback' },
  { code: 'RB', label: 'Rechtsback' },
  { code: 'CDM', label: 'Defensieve mid' },
  { code: 'CM', label: 'Centrale mid' },
  { code: 'CAM', label: 'Creatieve mid' },
  { code: 'LW', label: 'Linksbuiten' },
  { code: 'RW', label: 'Rechtsbuiten' },
  { code: 'ST', label: 'Spits' },
  ];

const PlayerListPage = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [posFilter, setPosFilter] = useState('');

    useEffect(() => {
          const load = async () => {
                  try {
                            const data = await playerService.getPlayers({ archived: false });
                            setPlayers(Array.isArray(data) ? data : data.data ?? []);
                  } catch {
                            setPlayers([]);
                  } finally {
                            setLoading(false);
                  }
          };
          load();
    }, []);

    const filtered = players.filter(p => {
          const name = `${p.first_name} ${p.last_name}`.toLowerCase();
          const matchSearch = !search || name.includes(search.toLowerCase());
          const matchPos = !posFilter || p.primary_position_code === posFilter;
          return matchSearch && matchPos;
    });

    return (
          <div className={styles.page}>
                  <div className={styles.header}>
                            <div>
                                      <h1 className={styles.title}>Spelers</h1>
                                      <p className={styles.subtitle}>{players.length} speler{players.length !== 1 ? 's' : ''} in je database</p>
                            </div>
                          <Button variant="primary" onClick={() => navigate('/players/add')}>
                                    + Nieuwe speler
                          </Button>
                  </div>
          
            {/* Filters */}
                <div className={styles.filters}>
                        <Input
                                    placeholder="Zoek op naam\u2026"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                  />
                        <select
                                    className={styles.select}
                                    value={posFilter}
                                    onChange={e => setPosFilter(e.target.value)}
                                  >
                          {POSITIONS.map(p => (
                                                <option key={p.code} value={p.code}>{p.label}</option>
                                              ))}
                        </select>
                </div>
          
            {/* Lijst */}
            {loading ? (
                    <div className={styles.loading}>Laden&hellip;</div>
                  ) : filtered.length === 0 ? (
                    <div className={styles.empty}>
                      {players.length === 0 ? (
                                  <>
                                                <p>Je hebt nog geen spelers toegevoegd.</p>
                                                <Button variant="primary" onClick={() => navigate('/players/add')}>
                                                                Eerste speler toevoegen
                                                </Button>
                                  </>>
                                ) : (
                                  <p>Geen spelers gevonden voor deze zoekopdracht.</p>
                              )}
                    </div>
                  ) : (
                    <div className={styles.table}>
                              <div className={styles.tableHeader}>
                                          <span>Naam</span>
                                          <span>Positie</span>
                                          <span>Leeftijd</span>
                                          <span>Club</span>
                                          <span>Rapporten</span>
                                          <span></span>
                              </div>
                      {filtered.map(player => {
                                  const dob = player.date_of_birth ? new Date(player.date_of_birth) : null;
                                  const age = dob
                                                  ? Math.floor((Date.now() - dob.getTime()) / 31557600000)
                                                  : null;
                                  return (
                                                  <div
                                                                    key={player.id}
                                                                    className={styles.tableRow}
                                                                    onClick={() => navigate(`/players/${player.id}`)}
                                                                  >
                                                                  <span className={styles.playerName}>
                                                                    {player.first_name} {player.last_name}
                                                                  </span>
                                                                  <span className={styles.positionBadge}>
                                                                    {player.primary_position_code || '\u2014'}
                                                                  </span>
                                                                  <span>{age ? `${age} jr` : '\u2014'}</span>
                                                                  <span className={styles.clubName}>
                                                                    {player.current_club_name || '\u2014'}
                                                                  </span>
                                                                  <span>{player.report_count ?? 0}</span>
                                                                  <span className={styles.arrow}>&rsaquo;</span>
                                                  </div>
                                                );
                    })}
                    </div>
                )}
          </div>
        );
};

export default PlayerListPage;
