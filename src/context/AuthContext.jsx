import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Keys used for persistent session storage
const KEY_TOKEN   = 'pnl_user_token';
const KEY_USER    = 'pnl_user_data';
const KEY_EXPIRY  = 'pnl_session_expiry';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken  = localStorage.getItem(KEY_TOKEN);
      const savedUser   = localStorage.getItem(KEY_USER);
      const expiryTime  = localStorage.getItem(KEY_EXPIRY);

      if (savedToken && savedUser && expiryTime) {
        // ✅ Valid 7-day session
        if (Date.now() < parseInt(expiryTime, 10)) {
          setUser(JSON.parse(savedUser));
          // Silently re-validate token in the background
          api.get('/auth/me').catch(() => {
            // Token rejected by server → clear and force re-login
            _clearSession();
            setUser(null);
          });
        } else {
          // ❌ Session expired — wipe everything
          _clearSession();
        }
      }

      // Small delay for a smooth loading screen transition
      setTimeout(() => setLoading(false), 800);
    };

    checkAuth();
  }, []);

  /** Persist a new authenticated session for 7 days */
  const _persistSession = (token, userData) => {
    const expiry = Date.now() + SEVEN_DAYS_MS;
    localStorage.setItem(KEY_TOKEN,  token);
    localStorage.setItem(KEY_USER,   JSON.stringify(userData));
    localStorage.setItem(KEY_EXPIRY, expiry.toString());
  };

  /** Remove all session keys from localStorage */
  const _clearSession = () => {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USER);
    localStorage.removeItem(KEY_EXPIRY);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    _persistSession(res.data.token, res.data.user);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    _persistSession(res.data.token, res.data.user);
    setUser(res.data.user);
  };

  const logout = () => {
    _clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
