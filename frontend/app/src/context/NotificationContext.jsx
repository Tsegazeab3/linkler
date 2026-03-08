import React, { createContext, useContext, useState, useCallback } from 'react';
import StatusBanner from '../components/StatusBanner';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: null, type: 'error' });

  const showNotification = useCallback((message, type = 'error') => {
    setNotification({ message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, message: null }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <StatusBanner 
        message={notification.message} 
        type={notification.type} 
        onClose={hideNotification} 
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};