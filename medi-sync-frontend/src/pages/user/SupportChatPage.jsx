import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

export default function SupportChatPage() {
    const userId = 101; // 환자
    const adminId = 2;  // 관리자

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const clientRef = useRef(null);

    useEffect(() => {
        // ✅ 과거 대화 불러오기
        axios
            .get(`http://192.168.0.24:8080/api/chat/${userId}/${adminId}`)
            .then((res) => setMessages(res.data))
            .catch((err) => console.error("❌ 메시지 조회 실패:", err));

        // ✅ WebSocket 연결
        const socket = new SockJS("http://192.168.0.24:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            console.log("✅ WebSocket 연결 성공");
            client.subscribe(`/topic/chat/${userId}`, (msg) => {
                const data = JSON.parse(msg.body);
                setMessages((prev) => [...prev, data]);
            });
        };

        client.activate();
        clientRef.current = client;

        return () => client.deactivate();
    }, []);

    const send = () => {
        if (!input.trim()) return;
        clientRef.current.publish({
            destination: `/app/chat/${userId}/${adminId}`,
            body: JSON.stringify({
                senderId: userId,
                senderType: "USER",
                receiverId: adminId,
                receiverType: "ADMIN",
                content: input,
                chatType: "GENERAL",
            }),
        });
        setMessages((prev) => [
            ...prev,
            { senderId: userId, content: input, sentAt: new Date().toISOString() },
        ]);
        setInput("");
    };

    return (
        <div className="max-w-md mx-auto mt-10 border rounded shadow-lg p-4 bg-white">
            <h2 className="font-bold text-xl mb-2 text-center">💬 실시간 상담 채팅</h2>
            <div className="h-80 overflow-y-auto border p-2 mb-2 bg-gray-50 rounded">
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={`my-1 flex ${
                            m.senderId === userId ? "justify-end" : "justify-start"
                        }`}
                    >
                        <div
                            className={`px-3 py-2 rounded ${
                                m.senderId === userId ? "bg-green-200" : "bg-gray-200"
                            }`}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex">
                <input
                    className="flex-1 border px-2 py-1 rounded"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                />
                <button
                    onClick={send}
                    className="ml-2 bg-green-500 text-white px-3 py-1 rounded"
                >
                    전송
                </button>
            </div>
        </div>
    );
}
