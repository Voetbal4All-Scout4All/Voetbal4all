import React from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import styles from './Topbar.module.css';

const TITLES = {
  '/scout/dashboard': 'Dashboard',
  '/scout/zoeken': 'Zoeken',
  '/scout/spelers': 'Spelers',
  '/scout/rapporten': 'Rapporten',
  '/scout/videos': "Video's",
  '/scout/watchlists': 'Watchlists',
  '/scout/vergelijken': 'Vergelijken',
  '/scout/shadow-teams': 'Shadow Teams',
  '/scout/club': 'Club Dashboard',
  '/scout/club/taken': 'Taken',
};

const Topbar = () => {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Scout4All';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>\uD83D\uDD0D</span>
          <input
            type="text"
            placeholder="Zoek spelers, clubs, rapporten..."
            className={styles.searchInput}
          />
        </div>
        <button className={styles.notifBtn} aria-label="Notificaties">
          \uD83D\uDD14
        </button>
        <Button variant="primary" size="sm">
          + Nieuw rapport
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
