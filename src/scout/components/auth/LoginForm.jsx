import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './AuthForms.module.css';

const LoginForm = ({ onSuccess }) => {
  const { login, loading, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (_) { /* error is set in context */ }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="E-mail"
        type="email"
        placeholder="jouw@email.nl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Wachtwoord"
        type="password"
        placeholder="Voer wachtwoord in"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className={styles.forgotRow}>
        <Link to="/scout/forgot-password" className={styles.link}>
          Wachtwoord vergeten?
        </Link>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      >
        Inloggen
      </Button>

      <p className={styles.switchText}>
        Nog geen account?{' '}
        <Link to="/scout/register" className={styles.link}>
          Registreer hier
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
