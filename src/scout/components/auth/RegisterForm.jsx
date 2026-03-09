import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './AuthForms.module.css';

const PLATFORMS = [
  { value: 'voetbal4all', label: 'Voetbal4All (NL/BE)' },
  { value: 'fussball4all', label: 'Fu\u00DFball4All (DE/AT/CH)' },
  { value: 'football4all', label: 'Football4All (UK/INT)' },
];

const RegisterForm = ({ onSuccess }) => {
  const { register, loading, error } = useAuthContext();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', password_confirm: '',
    platform: 'voetbal4all', terms: false,
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
      setLocalError('Wachtwoorden komen niet overeen');
      return;
    }
    if (!form.terms) {
      setLocalError('Je moet akkoord gaan met de voorwaarden');
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
    } catch (_) { /* error in context */ }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <Input label="Voornaam" value={form.first_name} onChange={set('first_name')} required />
        <Input label="Achternaam" value={form.last_name} onChange={set('last_name')} required />
      </div>
      <Input label="E-mail" type="email" placeholder="jouw@email.nl" value={form.email} onChange={set('email')} required />
      <Input label="Wachtwoord" type="password" placeholder="Min. 8 karakters" value={form.password} onChange={set('password')} required />
      <Input label="Wachtwoord bevestigen" type="password" placeholder="Herhaal wachtwoord" value={form.password_confirm} onChange={set('password_confirm')} required />

      <div className={styles.selectWrap}>
        <label className={styles.selectLabel}>Platform</label>
        <select className={styles.select} value={form.platform} onChange={set('platform')}>
          {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <label className={styles.checkRow}>
        <input type="checkbox" checked={form.terms} onChange={set('terms')} />
        <span>Ik ga akkoord met de <Link to="/scout/voorwaarden" className={styles.link}>voorwaarden</Link></span>
      </label>

      {displayError && <p className={styles.errorMsg}>{displayError}</p>}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        Account aanmaken
      </Button>

      <p className={styles.switchText}>
        Heb je al een account?{' '}
        <Link to="/scout/login" className={styles.link}>Log hier in</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
