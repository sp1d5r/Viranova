import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationContextType {
    showNotification: (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success', duration?: number) => void;
    notifications: Notification[];
}

const initialValue: NotificationContextType = {
    showNotification: () => {}, // Implement a no-op function
    notifications: [],
};

export const NotificationContext = createContext<NotificationContextType>(initialValue);

let notificationId = 0; // Simple incrementing ID for key purposes

export interface NotificationProviderProps {
    children: ReactNode;
}
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success', duration = 5000) => {
        const id = ++notificationId;
        setNotifications(prev => [...prev, { title, id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(notification => notification.id !== id)), duration);
    };

    const value:NotificationContextType = { showNotification, notifications };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
                {notifications.map((notification) => (
                    <NotificationMessage title={notification.title} key={notification.id} message={notification.message} type={notification.type} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

const NotificationMessage: React.FC<{ title:string; message: string; type: 'info' | 'warning' | 'error' | 'success'}> = ({title, message, type }) => {
    const backgroundColor = type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info';
    return (
        <div className={`rounded-xl border-2 border-black p-5 text-white flex flex-col  bg-${backgroundColor} m-5`}>
            <div className={"bg-danger bg-info bg-warning bg-success"}/>
            <p className={"text-bold"}>{title}</p>
            <p>{message}</p>
        </div>
    );
};


export const useNotificaiton = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within an NotificationProvider");
    }
    return context;
}
