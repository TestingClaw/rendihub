import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import http from '../api/http';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = async () => {
    const token = localStorage.getItem('rendihub_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await http.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('rendihub_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncProfile();
  }, []);

  const login = (payload) => {
    localStorage.setItem('rendihub_token', payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem('rendihub_token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout, syncProfile }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
