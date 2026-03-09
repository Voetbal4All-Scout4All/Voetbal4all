import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import '../../assets/css/scout-tokens.css';
import styles from './AuthPage.module.css';

const RegisterPage = () => {
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
          Account aanmaken
        </h1>
        <p className={styles.subtitle}>
          Start met scouten op Scout4All
        </p>
        <RegisterForm onSuccess={() => navigate('/scout/dashboard')} />
      </div>
    </div>
  );
};

export default RegisterPage;
