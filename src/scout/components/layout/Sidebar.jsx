import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const { t } = useTranslation();
    const { user, plan } = useAuthContext();
    const location = useLocation();

    const NAV_SECTIONS = [
      {
              label: t('nav.overview'),
              items: [
                { to: '/dashboard', icon: '\u229E', label: t('nav.dashboard') },
                { to: '/zoeken', icon: '\uD83D\uDD0D', label: t('nav.search') },
                      ],
      },
      {
              label: t('nav.scouting'),
              items: [
                { to: '/players', icon: '\uD83D\uDC65', label: t('nav.players') },
                { to: '/reports/add', icon: '\uD83D\uDCCB', label: t('nav.reports') },
                { to: '/videos', icon: '\uD83C\uDFA5', label: t('nav.videos') },
                { to: '/watchlists', icon: '\uD83D\uDCCC', label: t('nav.watchlists') },
                      ],
      },
      {
              label: t('nav.analysis'),
              items: [
                { to: '/vergelijken', icon: '\uD83D\uDCC8', label: t('nav.compare') },
                { to: '/shadow-teams', icon: '\u26BD', label: t('nav.shadowTeams') },
                      ],
      },
        ];

    const CLUB_SECTION = {
          label: t('nav.club'),
          items: [
            { to: '/club', icon: '\uD83C\uDFDF\uFE0F', label: t('nav.clubDashboard') },
            { to: '/club/taken', icon: '\u2705', label: t('nav.tasks') },
                ],
    };

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
                                    {user ? user.first_name + ' ' + user.last_name : t('common.loading')}
                                  </span>
                                  <Badge variant="plan">{plan?.slug || 'free'}</Badge>
                        </div>
                </div>
          </aside>
        );
};

export default Sidebar;
