import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('s4a_token'));
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate token on mount
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('s4a_token');
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.getMe();
        setUser(data.user);
        setPlan(data.plan || null);
      } catch (err) {
        localStorage.removeItem('s4a_token');
        localStorage.removeItem('s4a_user');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      localStorage.setItem('s4a_token', data.token);
      localStorage.setItem('s4a_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setPlan(data.plan || null);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Inloggen mislukt';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await authService.register(formData);
      localStorage.setItem('s4a_token', data.token);
      localStorage.setItem('s4a_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setPlan(data.plan || null);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registratie mislukt';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (_) { /* silent */ }
    localStorage.removeItem('s4a_token');
    localStorage.removeItem('s4a_user');
    setToken(null);
    setUser(null);
    setPlan(null);
  }, []);

  return {
    user, token, plan, loading, error,
    login, logout, register,
    isAuthenticated: !!token && !!user,
  };
};

export default useAuth;
