import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (noti) => {
        setNotifications((prev) => [noti, ...prev]); // 최신순으로 쌓기
    };

    const clearNotifications = () => setNotifications([]);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
