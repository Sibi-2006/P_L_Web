import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('pnl_user_token');
      const savedUser = localStorage.getItem('pnl_user_data');
      
      if (savedToken && savedUser) {
        setUser(JSON.parse(savedUser));
        // Verify token in background
        api.get('/auth/me').catch(() => {
          localStorage.removeItem('pnl_user_token');
          localStorage.removeItem('pnl_user_data');
          setUser(null);
        });
      }
      
      // Artificial delay for smooth loading screen transition
      setTimeout(() => setLoading(false), 800);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('pnl_user_token', res.data.token);
    localStorage.setItem('pnl_user_data', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('pnl_user_token', res.data.token);
    localStorage.setItem('pnl_user_data', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('pnl_user_token');
    localStorage.removeItem('pnl_user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
