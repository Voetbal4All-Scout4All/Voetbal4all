import React, { createContext, useContext } from 'react';
import useAuth from '../hooks/useAuth';

export const AuthContext = createContext(null);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  const hasFeature = (feature) => {
    if (!auth.plan) return false;
    const key = 'feature_' + feature;
    return !!auth.plan[key];
  };

  const value = {
    ...auth,
    hasFeature,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
