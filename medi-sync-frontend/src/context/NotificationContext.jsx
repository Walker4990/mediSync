import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    //  localStorage에서 복원
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem("notifications");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // 🔥 2일 지난 알림 자동 삭제
                const now = Date.now();
                const filtered = parsed.filter(
                    (n) => now - new Date(n.timestamp).getTime() < 2 * 24 * 60 * 60 * 1000
                );
                return filtered;
            } catch (e) {
                console.error("❌ 알림 복원 중 오류:", e);
            }
        }
        return [];
    });

    const [unreadCount, setUnreadCount] = useState(() => {
        const saved = localStorage.getItem("unreadCount");
        return saved ? Number(saved) : 0;
    });

    //  새 알림 추가
    const addNotification = (notification) => {
        const newNotification = {
            ...notification,
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString(),
        };
        const updated = [newNotification, ...notifications];
        setNotifications(updated);
        setUnreadCount((count) => count + 1);
    };

    //  모두 읽음 처리
    const markAllRead = () => {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        setNotifications(updated);
        setUnreadCount(0);
    };

    //  localStorage 자동 반영
    // ✅ localStorage 자동 반영 (동기화 저장)
    useEffect(() => {
        // 알림이 없을 땐 unreadCount도 0으로 보정
        if (notifications.length === 0) {
            localStorage.removeItem("notifications");
            localStorage.removeItem("unreadCount");
            return;
        }

        const syncedCount = notifications.filter((n) => !n.read).length;
        localStorage.setItem("notifications", JSON.stringify(notifications));
        localStorage.setItem("unreadCount", syncedCount);
    }, [notifications]);

    //  앱 실행 시 오래된 알림 삭제 (보정용)
    useEffect(() => {
        const now = Date.now();
        const filtered = notifications.filter(
            (n) => now - new Date(n.timestamp).getTime() < 2 * 24 * 60 * 60 * 1000
        );
        if (filtered.length !== notifications.length) {
            setNotifications(filtered);
        }
    }, []);

    return (
        <NotificationContext.Provider
            value={{ notifications, addNotification, unreadCount, markAllRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
