import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

export default function SupportChatPage() {
    const userId = 101;
    const adminId = 2;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const clientRef = useRef(null);
    const chatRef = useRef(null);

    useEffect(() => {
        axios
            .get(`http://192.168.0.24:8080/api/chat/${userId}/${adminId}`)
            .then((res) => setMessages(res.data))
            .catch((err) => console.error("❌ 메시지 조회 실패:", err));

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
        setTimeout(() => {
            if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }, 100);
    };

    return (
        <div className="max-w-md mx-auto mt-12 border border-gray-200 rounded-2xl shadow-xl bg-white overflow-hidden">
            {/* 상단 헤더 */}
            <div className="bg-green-500 text-white px-5 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-lg">💬 실시간 상담</h2>
            </div>

            {/* 메시지 영역 */}
            <div
                ref={chatRef}
                className="h-[480px] overflow-y-auto bg-gray-50 px-4 py-3 space-y-3 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-center mt-10">
                        상담을 시작해보세요 💬
                    </p>
                ) : (
                    messages.map((m, idx) => (
                        <div
                            key={idx}
                            className={`flex ${
                                m.senderId === userId ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] shadow-md ${
                                    m.senderId === userId
                                        ? "bg-green-400 text-white rounded-br-none"
                                        : "bg-white border rounded-bl-none"
                                }`}
                            >
                                {m.content}
                                <div className="text-[10px] text-gray-300 mt-1 text-right">
                                    {m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : ""}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 입력창 */}
            <div className="border-t flex items-center gap-2 p-3 bg-white">
                <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="메시지를 입력하세요..."
                />
                <button
                    onClick={send}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-medium text-sm transition"
                >
                    전송
                </button>
            </div>
        </div>
    );
}
