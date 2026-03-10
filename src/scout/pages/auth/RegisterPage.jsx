import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../../components/auth/RegisterForm';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import '../../assets/css/scout-tokens.css';
import styles from './AuthPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={`s4a-root ${styles.page}`}>
      <div className={styles.langSwitch}>
        <LanguageSwitcher />
      </div>
      <div className={styles.bgGrid} />
      <div className={styles.glowBlue} />
      <div className={styles.glowOrange} />
      <div className={styles.card}>
        <img
          src="/scout/assets/img/scout4all-logo.png"
          alt="Scout4All"
          className={styles.logo}
        />
        <h1 className={styles.title}>
          {t('auth.createAccount')}
        </h1>
        <p className={styles.subtitle}>
          {t('auth.registerSubtitle')}
        </p>
        <RegisterForm onSuccess={() => navigate('/dashboard')} />
      </div>
    </div>
  );
};

export default RegisterPage;
