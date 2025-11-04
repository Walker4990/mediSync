import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
import { useNotifications } from "../context/NotificationContext";
import { useEffect, useRef } from "react";

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

        client.onConnect = () => {
            console.log("✅ WebSocket Connected");

            // ✅ 검사 결과 알림 (기존 기능)
            const testSub = client.subscribe("/topic/testResult", (message) => {
                if (!message.body) return;
                const data = JSON.parse(message.body);

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

                toast.info(`🧪 ${data.testName} 검사 결과가 도착했습니다!`, {
                    autoClose: 2500,
                    onClose: () => {},
                });
            });

            // ✅ 퇴원 예정 알림 (새 기능)
            const dischargeSub = client.subscribe("/topic/admission/discharge", (message) => {
                if (!message.body) return;
                const alerts = JSON.parse(message.body);

                alerts.forEach((a) => {
                    toast.info(`🏥 오늘 퇴원 예정: ${a.patientName} (${a.roomNo})`, {
                        position: "top-right",
                        autoClose: 6000,
                        theme: "colored",
                        onClose: () => {},
                    });

                    addNotification({
                        id: Date.now() + Math.random(), // 중복 방지용
                        patientName: a.patientName,
                        message: `오늘 퇴원 예정 (${a.roomNo})`,
                        time: new Date().toLocaleString("ko-KR"),
                    });
                });
            });
            const admissionSub = client.subscribe("/topic/admission/update", (message) => {
                if (!message.body) return;
                const data = JSON.parse(message.body);
                console.log("🏥 실시간 입원 알림 수신:", data);

                let toastMsg = "";
                if (data.event === "ADMIT") {
                    toastMsg = `🟢 ${data.patientName || "환자"} 님이 입원했습니다.`;
                } else if (data.event === "DISCHARGE") {
                    toastMsg = `🔴 ${data.patientName || "환자"} 님이 퇴원했습니다.`;
                } else if (data.event === "TRANSFER") {
                    toastMsg = `🟡 ${data.patientName || "환자"} 님이 병실을 이동했습니다.`;
                }

                if (toastMsg) {
                    toast.info(toastMsg, {
                        position: "top-right",
                        autoClose: 5000,
                        theme: "colored",
                        onClose: () => {},
                    });

                    addNotification({
                        id: Date.now() + Math.random(),
                        title: "입원 관리 알림",
                        message: toastMsg,
                        time: new Date().toLocaleString("ko-KR"),
                        read: false,
                    });
                }
            });

            // 수술 완료 알림
            const operationSub = client.subscribe("/topic/operation/update", (message) => {
                if (!message.body) return;
                const data = JSON.parse(message.body);
                console.log("수술 완료 알림 수신: ", data);

                if(data.event === "OPERATION_COMPLETED") {
                    const toastMsg = `${data.patientName} 환자의 ${data.operationName} 수술이 종료되었습니다.`

                    toast.success(toastMsg, {
                        postion: "top-right",
                        autoClose: 5000,
                        theme: "colored",
                        onClose: () => {},
                    });
                    addNotification({
                        id : Date.now() + Math.random(),
                        title : "수술 완료 알림",
                        message: toastMsg,
                        time : new Date().toLocaleString("ko-KR"),
                        read: false,

                    })
                }
            })
            // ✅ 해제 시 모두 unsubscribe
            clientRef.current.subscriptions = [testSub, dischargeSub, admissionSub, operationSub];
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
                if (clientRef.current.subscriptions) {
                    clientRef.current.subscriptions.forEach((sub) => sub.unsubscribe());
                }
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [addNotification]);

    return null;
}
