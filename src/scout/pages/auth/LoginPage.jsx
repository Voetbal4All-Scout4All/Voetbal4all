import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import '../../assets/css/scout-tokens.css';
import styles from './AuthPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className={`s4a-root ${styles.page}`}>
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
          Welkom terug
        </h1>
        <p className={styles.subtitle}>
          Log in op je Scout4All account
        </p>
        <LoginForm onSuccess={() => navigate('/scout/dashboard')} />
      </div>
    </div>
  );
};

export default LoginPage;
