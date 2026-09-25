import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, notificationService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('resqhub_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('resqhub_token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Fetch latest user details on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
          localStorage.setItem('resqhub_user', JSON.stringify(res.data.user));
          fetchUnreadCount();
        } catch (err) {
          console.error("Auth validation failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  // Periodic poll for unread notifications if logged in
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchUnreadCount = async () => {
    if (!localStorage.getItem('resqhub_token')) return;
    try {
      const res = await notificationService.getAll();
      setUnreadNotifs(res.data.unread_count || 0);
    } catch {
      // ignore background poll error
    }
  };

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('resqhub_token', newToken);
    localStorage.setItem('resqhub_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchUnreadCount();
    return newUser;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('resqhub_token', newToken);
    localStorage.setItem('resqhub_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchUnreadCount();
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('resqhub_token');
    localStorage.removeItem('resqhub_user');
    setToken(null);
    setUser(null);
    setUnreadNotifs(0);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, unreadNotifs, fetchUnreadCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
