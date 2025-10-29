import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
import { useNotifications } from "../context/NotificationContext";
import { useEffect,useRef } from "react";

export default function WebSocketListener() {
    const { addNotification } = useNotifications();
    const clientRef = useRef(null);
    useEffect(() => {
        if (clientRef.current) return; // 중복 방지

        const socket = new SockJS("http://192.168.0.24:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log(msg),
        });

        client.onConnect = (frame) => {
            console.log("✅ WebSocket Connected:", frame);

            // ✅ 연결된 이후에만 subscribe 실행
            const subscription = client.subscribe("/topic/testResult", (message) => {
                if (!message.body) return;
                const data = JSON.parse(message.body);

                // Context에 추가
                addNotification({
                    id: Date.now(),
                    patientName: data.patientName,
                    testName: data.testName,
                    reservationId: data.reservationId,
                    time: new Date().toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    }),
                });

                // Toast 알림
                toast.info(`🧪 ${data.testName} 검사 결과가 도착했습니다!`, {
                    autoClose: 2000,
                });
            });

            // ✅ 연결 해제 시 구독도 해제
            clientRef.current.subscription = subscription;
        };

        client.onStompError = (frame) => {
            console.error("❌ STOMP Error:", frame.headers["message"]);
        };

        client.onWebSocketClose = () => {
            console.warn("🔌 WebSocket Disconnected");
        };

        client.activate();
        clientRef.current = client;

        return () => {
            console.log("🔌 WebSocketListener unmount");
            if (clientRef.current) {
                if (clientRef.current.subscription) {
                    clientRef.current.subscription.unsubscribe();
                }
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [addNotification]);

    return null;
}