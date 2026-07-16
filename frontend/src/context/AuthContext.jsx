import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('sph_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      setUser(res.user);
    } catch {
      localStorage.removeItem('sph_token');
      localStorage.removeItem('sph_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const persistSession = (data) => {
    if (data.token) localStorage.setItem('sph_token', data.token);
    if (data.user) {
      localStorage.setItem('sph_user', JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.token) persistSession(data);
    return data;
  };

  const register = async (payload) => authService.register(payload);

  const verifyOTP = async (payload) => {
    const data = await authService.verifyOTP(payload);
    if (data.token) persistSession(data);
    return data;
  };

  const resendOTP = async (payload) => authService.resendOTP(payload);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore network errors on logout */
    }
    localStorage.removeItem('sph_token');
    localStorage.removeItem('sph_user');
    setUser(null);
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('sph_user', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    updateUser,
    refresh: bootstrap,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
