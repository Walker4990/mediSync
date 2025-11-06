import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { MessageSquare, X } from "lucide-react";

export default function SupportChatWidget() {
    const userId = 101;
    const adminId = 2;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const clientRef = useRef(null);
    const chatRef = useRef(null);

    // ✅ WebSocket 연결은 열릴 때만
    useEffect(() => {
        if (!isOpen) return;

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
    }, [isOpen]);

    // ✅ 메시지 전송
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
            if (chatRef.current)
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }, 100);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            {/* ✅ 채팅창은 isOpen=true 일 때만 보이게 */}
            {isOpen && (
                <div className="w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4">
                    {/* 헤더 */}
                    <header className="bg-blue-600 text-white p-3 flex justify-between items-center">
                        <span className="font-semibold">실시간 상담</span>
                        <button onClick={() => setIsOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </header>

                    {/* 본문 */}
                    <div
                        ref={chatRef}
                        className="flex-1 p-3 overflow-y-auto bg-gray-50 text-sm space-y-2"
                    >
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-400 mt-10">
                                상담을 시작해보세요 💬
                            </p>
                        ) : (
                            messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex ${
                                        m.senderId === userId ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`px-3 py-2 rounded-lg max-w-[75%] shadow ${
                                            m.senderId === userId
                                                ? "bg-blue-500 text-white rounded-br-none"
                                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                        }`}
                                    >
                                        {m.content}
                                        <div className="text-[10px] text-white-300 mt-1 text-right">
                                            {m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : ""}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* 입력 */}
                    <footer className="p-3 border-t bg-white">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && send()}
                            placeholder="메시지 입력..."
                            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </footer>
                </div>
            )}

            {/* 💬 버튼 (항상 표시됨, 단 1개만) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-green-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition transform hover:scale-105"
                title="실시간 상담"
            >
                <MessageSquare className="w-7 h-7" />
            </button>
        </div>
    );
}
