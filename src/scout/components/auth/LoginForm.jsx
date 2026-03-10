import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './AuthForms.module.css';

const LoginForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const { login, loading, error } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
          e.preventDefault();
          try {
                  await login(email, password);
                  if (onSuccess) onSuccess();
          } catch (_) {
                  /* error is set in context */
          }
    };

    return (
          <form onSubmit={handleSubmit} className={styles.form}>
                  <Input
                            label={t('auth.email')}
                            type="email"
                            placeholder="jouw@email.nl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                  <Input
                            label={t('auth.password')}
                            type="password"
                            placeholder={t('auth.passwordMinLength')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                  <div className={styles.forgotRow}>
                            <Link to="/scout/forgot-password" className={styles.link}>
                              {t('auth.forgotPassword')}
                            </Link>Link>
                  </div>div>

            {error && <p className={styles.errorMsg}>{error}</p>p>}

                  <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                    {t('auth.login')}
                  </Button>Button>

                  <p className={styles.switchText}>
                    {t('auth.noAccountYet')}{' '}
                            <Link to="/scout/register" className={styles.link}>
                              {t('auth.registerHere')}
                            </Link>Link>
                  </p>p>
          </form>form>
        );
};

export default LoginForm;
