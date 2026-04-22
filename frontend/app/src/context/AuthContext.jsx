import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return (savedToken && savedToken !== 'null' && savedToken !== 'undefined') ? savedToken : null;
  });
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return (savedUser && savedUser !== 'null' && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('AuthContext: Failed to parse saved user', e);
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && token !== 'null' && token !== 'undefined') {
      // Only fetch if we don't have a user yet or need a refresh
      if (!user) {
        setLoading(true);
        getProfile()
        .then(response => {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(error => {
            console.error('AuthContext: Profile fetch failed', error);
            if (error.response?.status === 401) logout();
        })
        .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    if (!newToken) return;
    localStorage.setItem('token', newToken);
    // Merge only if existing user exists to preserve flags
    const existingUserStr = localStorage.getItem('user');
    let combinedUser = userData;
    if (existingUserStr && existingUserStr !== 'null') {
        try {
            const existingUser = JSON.parse(existingUserStr);
            combinedUser = { ...existingUser, ...userData };
        } catch(e) {}
    }
    localStorage.setItem('user', JSON.stringify(combinedUser));
    setToken(newToken);
    setUser(combinedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await getProfile();
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (e) {
      console.error('AuthContext: Failed to refresh profile', e);
    }
  };

  const value = {
    token,
    user,
    setUser: (userData) => {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    },
    loading,
    login,
    logout,
    refreshProfile,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
