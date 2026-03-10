import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import styles from './Topbar.module.css';

const Topbar = () => {
    const { t } = useTranslation();
    const location = useLocation();

    const TITLES = {
          '/scout/dashboard':    t('nav.dashboard'),
          '/scout/zoeken':       t('nav.search'),
          '/scout/spelers':      t('nav.players'),
          '/scout/rapporten':    t('nav.reports'),
          '/scout/videos':       t('nav.videos'),
          '/scout/watchlists':   t('nav.watchlists'),
          '/scout/vergelijken':  t('nav.compare'),
          '/scout/shadow-teams': t('nav.shadowTeams'),
          '/scout/club':         t('nav.clubDashboard'),
          '/scout/club/taken':   t('nav.tasks'),
    };

    const title = TITLES[location.pathname] || 'Scout4All';

    return (
          <header className={styles.topbar}>
                  <div className={styles.left}>
                            <h1 className={styles.title}>{title}</h1>h1>
                  </div>div>
                  <div className={styles.right}>
                            <div className={styles.searchWrap}>
                                        <span className={styles.searchIcon}>🔍</span>span>
                                        <input
                                                      type="text"
                                                      placeholder={t('topbar.searchPlaceholder')}
                                                      className={styles.searchInput}
                                                    />
                            </div>div>
                            <LanguageSwitcher />
                            <button className={styles.notifBtn} aria-label={t('topbar.notifications')}>
                                        🔔
                            </button>button>
                            <Button variant="primary" size="sm">
                              {t('topbar.newReport')}
                            </Button>Button>
                  </div>div>
          </header>header>
        );
};

export default Topbar;</Button>
