import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ShortRequest } from '../types/collections/Request';
import Logo from "../assets/logo/Logo.png"

interface BrowserNotificationContextType {
  notifyRequestCompleted: (request: ShortRequest) => void;
  requestNotificationPermission: () => void;
  notificationPermission: NotificationPermission;
}

const BrowserNotificationContext = createContext<BrowserNotificationContextType | undefined>(undefined);

export const useBrowserNotification = () => {
  const context = useContext(BrowserNotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface BrowserNotificationProviderProps {
  children: ReactNode;
}

export const BrowserNotificationProvider: React.FC<BrowserNotificationProviderProps> = ({ children }) => {
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  useEffect(() => {
    setNotificationPermission(Notification.permission);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (notificationPermission !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  }, [notificationPermission]);

  const notifyRequestCompleted = useCallback((request: ShortRequest) => {
    if (notificationPermission === 'granted') {
      new Notification('Request Completed', {
        body: `(${request.requestEndpoint}) Request ${request.id} has been completed.`,
        icon: Logo
      });
    }
    // Dispatch custom event for other parts of the app
    const event = new CustomEvent('requestCompleted', { detail: request });
    window.dispatchEvent(event);
  }, [notificationPermission]);

  return (
    <BrowserNotificationContext.Provider
      value={{
        notifyRequestCompleted,
        requestNotificationPermission,
        notificationPermission
      }}
    >
      {children}
    </BrowserNotificationContext.Provider>
  );
};