import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Toast, ToastProvider, ToastViewport } from "../components/ui/toast";
import { useToast } from "../components/ui/use-toast";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
}

interface NotificationContextType {
    showNotification: (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success', duration?: number) => void;
    notifications: Notification[];
    allNotifications: Notification[];
}

const initialValue: NotificationContextType = {
    showNotification: () => {},
    notifications: [],
    allNotifications: [],
};

export const NotificationContext = createContext<NotificationContextType>(initialValue);

let notificationId = 0;

export interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const storedNotifications = localStorage.getItem('allNotifications');
        if (storedNotifications) {
            setAllNotifications(JSON.parse(storedNotifications));
        }

        const storedNotification = sessionStorage.getItem('notification');
        if (storedNotification) {
            const notification = JSON.parse(storedNotification);
            showNotification(notification.title, notification.message, notification.type);
            sessionStorage.removeItem('notification');
        }
    }, []);

    const showNotification = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success', duration = 5000) => {
        const id = ++notificationId;
        const newNotification: Notification = { id, title, message, type, timestamp: new Date() };

        sessionStorage.setItem('notification', JSON.stringify(newNotification));
        setAllNotifications(prevAll => {
            const updatedAll = [...prevAll, newNotification];
            localStorage.setItem('allNotifications', JSON.stringify(updatedAll));
            return updatedAll;
        });

        setNotifications(prev => {
            const updatedNotifications = [...prev, newNotification].slice(-2);
            return updatedNotifications;
        });

        const getTypeStyles = (type: 'info' | 'warning' | 'error' | 'success') => {
            switch (type) {
                case 'error':
                    return ' !bg-red-950 text-white';
                case 'warning':
                    return ' !bg-amber-950 text-black';
                case 'success':
                    return ' !bg-emerald-950 text-white';
                default:
                    return ' !bg-blue-950 text-white';
            }
        };

        toast({
            title: title,
            description: message,
            className: `${getTypeStyles(type)} rounded-md`,
        });

    };

    const value: NotificationContextType = { showNotification, notifications, allNotifications };

    return (
      <NotificationContext.Provider value={value}>
          <ToastProvider>
              {children}
          </ToastProvider>
      </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};