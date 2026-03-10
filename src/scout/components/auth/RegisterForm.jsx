import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useAuthContext } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './AuthForms.module.css';

const PLATFORMS = [
  { value: 'voetbal4all', label: 'Voetbal4All (NL/BE)' },
  { value: 'fussball4all', label: 'Fußball4All (DE/AT/CH)' },
  { value: 'football4all', label: 'Football4All (UK/INT)' },
];

const RegisterForm = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { register, loading, error } = useAuthContext();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
    platform: 'voetbal4all',
    terms: false,
  });

  const [localError, setLocalError] = useState('');

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (form.password !== form.password_confirm) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }
    if (!form.terms) {
      setLocalError(t('auth.termsRequired'));
      return;
    }

    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        platform: form.platform,
      });
      if (onSuccess) onSuccess();
    } catch (_) {
      /* error in context */
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <Input
          label={t('auth.firstName')}
          value={form.first_name}
          onChange={set('first_name')}
          required
        />
        <Input
          label={t('auth.lastName')}
          value={form.last_name}
          onChange={set('last_name')}
          required
        />
      </div>
      <Input
        label={t('auth.email')}
        type="email"
        placeholder="jouw@email.nl"
        value={form.email}
        onChange={set('email')}
        required
      />
      <Input
        label={t('auth.password')}
        type="password"
        placeholder={t('auth.passwordMinLength')}
        value={form.password}
        onChange={set('password')}
        required
      />
      <Input
        label={t('auth.passwordConfirm')}
        type="password"
        placeholder={t('auth.passwordRepeat')}
        value={form.password_confirm}
        onChange={set('password_confirm')}
        required
      />
      <div className={styles.selectWrap}>
        <label className={styles.selectLabel}>{t('auth.platform')}</label>
        <select className={styles.select} value={form.platform} onChange={set('platform')}>
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      <label className={styles.checkRow}>
        <input type="checkbox" checked={form.terms} onChange={set('terms')} />
        <span>
          {t('auth.agreeToTerms')}{' '}
          <Link to="/scout/voorwaarden" className={styles.link}>
            {t('auth.terms')}
          </Link>
        </span>
      </label>
      {displayError && <p className={styles.errorMsg}>{displayError}</p>}
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        {t('auth.createAccount')}
      </Button>
      <p className={styles.switchText}>
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/scout/login" className={styles.link}>
          {t('auth.loginHere')}
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
