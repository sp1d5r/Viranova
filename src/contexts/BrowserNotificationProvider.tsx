import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ShortRequest } from '../types/collections/Request';
import Logo from "../assets/logo/Logo.png"

interface BrowserNotificationContextType {
  notifyRequestCompleted: (request: ShortRequest) => void;
  requestNotificationPermission: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  isNotificationSupported: boolean;
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
    useState<NotificationPermission | 'unsupported'>('default');
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);

  useEffect(() => {
    const checkNotificationSupport = () => {
      if ('Notification' in window) {
        setIsNotificationSupported(true);
        setNotificationPermission(Notification.permission);
      } else {
        setIsNotificationSupported(false);
        setNotificationPermission('unsupported');
        console.warn('Notifications are not supported in this environment');
      }
    };

    checkNotificationSupport();
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (isNotificationSupported && notificationPermission !== 'granted') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        setNotificationPermission('unsupported');
      }
    }
  }, [isNotificationSupported, notificationPermission]);

  const notifyRequestCompleted = useCallback((request: ShortRequest) => {
    if (isNotificationSupported && notificationPermission === 'granted') {
      try {
        new Notification('Request Completed', {
          body: `(${request.requestEndpoint}) Request ${request.id} has been completed.`,
          icon: Logo
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }
    // Dispatch custom event for other parts of the app
    const event = new CustomEvent('requestCompleted', { detail: request });
    window.dispatchEvent(event);
  }, [isNotificationSupported, notificationPermission]);

  return (
    <BrowserNotificationContext.Provider
      value={{
        notifyRequestCompleted,
        requestNotificationPermission,
        notificationPermission,
        isNotificationSupported
      }}
    >
      {children}
    </BrowserNotificationContext.Provider>
  );
};