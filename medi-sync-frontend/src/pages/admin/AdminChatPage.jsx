// AdminChatPage.jsx
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { AiOutlineUser, AiOutlineMessage } from "react-icons/ai";
import AdminHeader from "../../component/AdminHeader";

export default function AdminChatPage() {
    const adminId = 2;
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const clientRef = useRef(null);
    const messagesRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res= await axios.get(`http://192.168.0.24:8080/api/chat/partners/${adminId}`);
                setUsers(res.data);
            } catch (error) {
                console.log("❌ 사용자 목록 불러오기 실패:", error);
            }

        }
        fetchUsers();
    }, []);

    // WebSocket 1회 연결 (관리자용 구독)
    useEffect(() => {
        const socket = new SockJS("http://192.168.0.24:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
        });

        client.onConnect = (frame) => {
            console.log("✅ Admin WebSocket connected:", frame.headers?.server || "");
            // adminId 토픽 구독
            client.subscribe(`/topic/chat/${adminId}`, (msg) => {
                const data = JSON.parse(msg.body);

                setMessages((prev) => [...prev, data]);

                // ✅ 새 메시지 오면 해당 유저의 unread 즉시 증가
                  setUsers((prev) => {
                      const updated = prev.map(u => {
                           if (u.userId === data.senderId) {
                              return { ...u, unread: (u.unread || 0) + 1 };
                              }
                          return u;
                          });

                    // 리스트에 없는 사용자면 추가
                        if (!updated.find(u => u.userId === data.senderId)) {
                        updated.push({ userId: data.senderId, name: `User ${data.senderId}`, unread: 1 });
                        }
                    return updated;
                    });
        })
        };

        client.onStompError = (err) => {
            console.error("STOMP ERROR:", err);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            try {
                client.deactivate();
            } catch (e) {
                /* ignore */
            }
        };
    }, []); // 빈 dependency -> 1회 연결

    useEffect(() => {
        const fetchUnreadCounts = async () => {
            const updated = await Promise.all(
                users
                    .filter(u => u && u.userId)       // 여기도 null 제거
                    .map(async (u) => {
                        const res = await axios.get(`http://192.168.0.24:8080/api/chat/unread/${u.userId}/${adminId}`);
                        return { ...u, unread: res.data };
                    })
            );
            setUsers(updated);
        };
        if (users.length > 0) fetchUnreadCounts();
    }, [users.length]);

    // 특정 사용자 대화 불러오기 (REST)
    const loadChat = async (uid) => {
        setCurrentUser(uid);
        setMessages([]); // 기존 메세지 초기화 (로딩중 UI 원하면 추가)
        await axios.post(`http://192.168.0.24:8080/api/chat/read/${uid}/${adminId}`);
        axios
            .get(`http://192.168.0.24:8080/api/chat/${adminId}/${uid}`)
            .then((res) => {
                console.log("✅ 과거 대화 불러옴:", res.data);
                setMessages(res.data || []);
                // 선택 후 스크롤
                setTimeout(() => scrollToBottom(), 50);
            })
            .catch((err) => {
                console.error("❌ 채팅 불러오기 실패:", err);
            });
        await axios.post(`http://192.168.0.24:8080/api/chat/read/${uid}/${adminId}`);
        setUsers((prev) =>
            prev.map((u) =>
                u.userId === uid ? { ...u, unread: 0 } : u
            )
        );
    };

    // 메시지 발송
    const sendMessage = () => {
        if (!input.trim() || !currentUser) return;
        const payload = {
            // 서버 @MessageMapping에서 senderId/receiverId를 DestinationVariable로 덮어씌우므로
            // body에 있어도 상관없지만 디버깅용으로 포함
            senderId: adminId,
            receiverId: currentUser,
            content: input,
            chatType: "ADMIN",
        };

        if (!clientRef.current || !clientRef.current.active) {
            console.warn("WebSocket not connected. 메시지 전송 불가");
            return;
        }

        clientRef.current.publish({
            destination: `/app/chat/${adminId}/${currentUser}`,
            body: JSON.stringify(payload),
        });
        console.log("📤 전송:", payload);

        // optimistic UI: 서버가 저장/브로드캐스트 하기 전에 바로 화면에 보이게 함
        setMessages((prev) => [
            ...prev,
            { senderId: adminId, receiverId: currentUser, content: input, sentAt: new Date().toISOString() },
        ]);
        setInput("");
        setTimeout(() => scrollToBottom(), 50);
    };

    // 메시지 영역 자동 스크롤
    const scrollToBottom = () => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <>
            <AdminHeader />
            <div className="flex justify-center items-start py-6 bg-gray-100 min-h-[calc(100vh-80px)]">
                <div className="w-[90%] max-w-[1100px] h-[72vh] bg-white rounded-2xl shadow-md overflow-hidden flex">
                    {/* 좌측: 사용자 목록 (25%) */}
                    <div className="w-1/4 bg-gray-50 border-r flex flex-col">
                        <div className="p-4 bg-green-600 text-white font-semibold text-center">💬 상담중인 사용자</div>
                        <div className="flex-1 overflow-auto">
                            {users.length === 0 ? (
                                <p className="text-gray-400 text-center mt-6">현재 대화중인 사용자가 없습니다.</p>
                            ) : (
                                users
                                    .filter(u => u && u.userId)   // ← null 제거 필수!!
                                    .map((u) => (
                                    <div
                                        key={u.userId}
                                        onClick={() => loadChat(u.userId)}
                                        role="button"
                                        tabIndex={0}
                                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition select-none ${
                                            currentUser === u.userId
                                                ? "bg-green-100 border-l-4 border-green-500"
                                                : "hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <AiOutlineUser className="text-green-500" size={20} />
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">사용자 #{u.userId}</div>
                                                {u.name && <div className="text-xs text-gray-500">{u.name}</div>}
                                            </div>
                                        </div>

                                        {/* 🔴 읽지 않은 메시지 표시 */}
                                        {u.unread > 0 && (
                                            <div className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                                {u.unread}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 우측: 채팅 영역 (75%) */}
                    <div className="w-3/4 flex flex-col">
                        <div className="flex items-center gap-3 px-6 py-3 border-b bg-gray-100">
                            <AiOutlineMessage className="text-green-600" size={20} />
                            <div className="font-bold text-gray-700">
                                {currentUser ? `사용자 #${currentUser} 와의 대화` : "대화할 사용자를 선택하세요"}
                            </div>
                        </div>

                        <div ref={messagesRef} className="flex-1 p-5 overflow-auto bg-gray-50">
                            {currentUser ? (
                                messages
                                    .filter(
                                        (m) =>
                                            (m.senderId === adminId && m.receiverId === currentUser) ||
                                            (m.senderId === currentUser && m.receiverId === adminId) ||
                                            // 서버에서 보낼 때 receiverId/ senderId가 없을 경우 대비: 대화 상대가 포함된 메시지만 표시
                                            (m.senderId === currentUser) ||
                                            (m.receiverId === currentUser && m.senderId === adminId)
                                    )
                                    .map((m, i) => (
                                        <div key={i} className={`flex mb-3 ${m.senderId === adminId ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`px-4 py-2 max-w-[72%] rounded-xl shadow-sm text-sm leading-relaxed ${
                                                    m.senderId === adminId ? "bg-green-300 text-gray-800" : "bg-white border"
                                                }`}
                                            >
                                                {m.content}
                                                <div className="text-xs text-gray-400 mt-1">{m.sentAt ? new Date(m.sentAt).toLocaleString() : ""}</div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-gray-400 text-center mt-10">사용자를 선택하면 대화가 표시됩니다.</p>
                            )}
                        </div>

                        {/* 입력창 */}
                        {currentUser && (
                            <div className="border-t p-3 flex items-center gap-3 bg-white">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder="메시지를 입력하세요..."
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                                />
                                <button onClick={sendMessage} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">
                                    전송
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
