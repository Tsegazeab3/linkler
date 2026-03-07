import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';
import storage from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = storage.getItem('token');
    return (savedToken && savedToken !== 'null' && savedToken !== 'undefined') ? savedToken : null;
  });
  
  const [user, setUser] = useState(() => {
    const savedUser = storage.getItem('user');
    try {
      return (savedUser && savedUser !== 'null' && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('AuthContext: Failed to parse saved user', e);
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setLoading(true);
      getProfile()
      .then(response => {
        console.log('AuthContext: Profile fetch successful', response.data);
        setUser(response.data);
        storage.setItem('user', JSON.stringify(response.data));
      })
      .catch(error => {
        console.error('AuthContext: Profile fetch failed', error.response ? error.response.data : error.message);
        // Only logout if it's a 401 Unauthorized
        if (error.response && error.response.status === 401) {
          logout();
        }
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    storage.setItem('token', newToken);
    storage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    storage.removeItem('token');
    storage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
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
