import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import styles from './Sidebar.module.css';

const NAV_SECTIONS = [
  {
    label: 'Overzicht',
    items: [
      { to: '/scout/dashboard', icon: '\u229E', label: 'Dashboard' },
      { to: '/scout/zoeken', icon: '\uD83D\uDD0D', label: 'Zoeken' },
    ],
  },
  {
    label: 'Scouting',
    items: [
      { to: '/scout/spelers', icon: '\uD83D\uDC65', label: 'Spelers' },
      { to: '/scout/rapporten', icon: '\uD83D\uDCCB', label: 'Rapporten' },
      { to: '/scout/videos', icon: '\uD83C\uDFA5', label: "Video's" },
      { to: '/scout/watchlists', icon: '\uD83D\uDCCC', label: 'Watchlists' },
    ],
  },
  {
    label: 'Analyse',
    items: [
      { to: '/scout/vergelijken', icon: '\uD83D\uDCC8', label: 'Vergelijken' },
      { to: '/scout/shadow-teams', icon: '\u26BD', label: 'Shadow Teams' },
    ],
  },
];

const CLUB_SECTION = {
  label: 'Club',
  items: [
    { to: '/scout/club', icon: '\uD83C\uDFDF\uFE0F', label: 'Dashboard' },
    { to: '/scout/club/taken', icon: '\u2705', label: 'Taken' },
  ],
};

const Sidebar = () => {
  const { user, plan } = useAuthContext();
  const location = useLocation();
  const hasClub = plan && (plan.slug || '').startsWith('club');
  const sections = hasClub ? [...NAV_SECTIONS, CLUB_SECTION] : NAV_SECTIONS;

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
    : '??';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <img
          src="/scout/assets/img/scout4all-logo.png"
          alt="Scout4All"
          className={styles.logo}
        />
        <span className={styles.logoText}>
          Scout<span className={styles.logoAccent}>4</span>All
        </span>
      </div>

      <nav className={styles.nav}>
        {sections.map((section) => (
          <div key={section.label} className={styles.section}>
            <span className={styles.sectionLabel}>{section.label}</span>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [styles.navItem, isActive ? styles['navItem--active'] : ''].join(' ')
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.userCard}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user ? user.first_name + ' ' + user.last_name : 'Laden...'}
          </span>
          <Badge variant="plan">{plan?.slug || 'free'}</Badge>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
