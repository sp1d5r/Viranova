import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationContextType {
    showNotification: (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success', duration?: number) => void;
    notifications: Notification[];
    allNotifications: Notification[]; // Keeps track of all notifications
}

const initialValue: NotificationContextType = {
    showNotification: () => {}, // Implement a no-op function
    notifications: [],
    allNotifications: [], // Initial empty array for all notifications
};

export const NotificationContext = createContext<NotificationContextType>(initialValue);

let notificationId = 0; // Simple incrementing ID for key purposes

export interface NotificationProviderProps {
    children: ReactNode;
}
const PreloadColors = () => {
  return (
    <div style={{ height: 0, width: 0 }}>
      <div className="bg-red-500"></div>
      <div className="bg-yellow-500"></div>
      <div className="bg-green-500"></div>
      <div className="bg-blue-500"></div>
      {/* Add as many divs as you have color classes to preload */}
    </div>
  );
};


export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]); // State to store all notifications

    useEffect(() => {
        /* Load in Notifications from Storage */
        const storedNotification = sessionStorage.getItem('notification');
        if (storedNotification) {
            const notification = JSON.parse(storedNotification);
            showNotification(notification.title, notification.message, notification.type);
            sessionStorage.removeItem('notification');
        }
    }, []);

    const showNotification = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success', duration = 5000) => {
        const id = ++notificationId;
        const newNotification = { id, title, message, type };

        // Store in session for persistence (consider using localStorage for longer persistence)
        sessionStorage.setItem('notification', JSON.stringify(newNotification));
        setAllNotifications(prevAll => [...prevAll, newNotification]); // Keep a log of all notifications

        // Update visible notifications
        setNotifications(prev => {
            // Add new notification and keep only the last two
            const updatedNotifications = [...prev, newNotification].slice(-2);
            return updatedNotifications;
        });

        setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
            sessionStorage.removeItem('notification'); // Consider removing or adjusting this based on behavior
        }, duration);
    };

    const value: NotificationContextType = { showNotification, notifications, allNotifications };

    return (
      <NotificationContext.Provider value={value}>
          {children}
            <PreloadColors/>
          <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
              {notifications.map((notification) => (
                <NotificationMessage title={notification.title} key={notification.id} message={notification.message} type={notification.type} />
              ))}
          </div>
      </NotificationContext.Provider>
    );
};

const NotificationMessage: React.FC<{ title: string; message: string; type: 'info' | 'warning' | 'error' | 'success' }> = ({ title, message, type }) => {
    const backgroundColor = type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info';
    return (
      <div className={`rounded-xl border-2 border-black p-5 text-white flex flex-col bg-${backgroundColor} m-5`}>
          <p className={"font-bold"}>{title}</p>
          <p>{message}</p>
      </div>
    );
};

export const useNotificaiton = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};
