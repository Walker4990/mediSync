import { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";

export default function AdminMainPage() {
    const [rooms, setRooms] = useState([]);
    const [operations, setOperations] = useState([]);

    useEffect(() => {
        fetchRooms();
        fetchOperations();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get("http://192.168.0.24:8080/api/rooms/list");
            setRooms(res.data);
        } catch (err) {
            console.error("❌ 병실 현황 조회 실패:", err);
        }
    };

    const fetchOperations = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const res = await axios.get("http://192.168.0.24:8080/api/operation/todayList",{
                params: {scheduledDate: today},
            });
            setOperations(res.data);
        } catch (err) {
            console.error("❌ 수술실 현황 조회 실패:", err);
        }
    };

    return (
        <div className="font-pretendard bg-gray-50 min-h-screen">
            <AdminHeader />
            <div className="max-w-7xl mx-auto py-10 space-y-10">
                {/* 🏥 병실 현황 */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">🏥 입원실 현황</h2>
                    <div className="grid grid-cols-3 gap-6">
                        {rooms.length > 0 ? (
                            rooms.map((room) => {
                                const ratio = room.capacity
                                    ? (room.currentCount / room.capacity) * 100
                                    : 0;
                                const color =
                                    room.status === "FULL"
                                        ? "bg-red-500"
                                        : room.status === "MAINTENANCE"
                                            ? "bg-yellow-500"
                                            : "bg-green-500";
                                return (
                                    <div
                                        key={room.roomId}
                                        className={`rounded-xl shadow-md p-5 border transition-all hover:shadow-lg ${
                                            room.status === "FULL"
                                                ? "bg-red-50 border-red-400"
                                                : room.status === "MAINTENANCE"
                                                    ? "bg-yellow-50 border-yellow-400"
                                                    : "bg-green-50 border-green-400"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h2 className="text-lg font-semibold">
                                                {room.roomNo} ({room.wardName})
                                            </h2>
                                            <span
                                                className={`text-xs px-3 py-1 rounded-full ${
                                                    room.status === "FULL"
                                                        ? "bg-red-500 text-white"
                                                        : room.status === "MAINTENANCE"
                                                            ? "bg-yellow-500 text-white"
                                                            : "bg-green-500 text-white"
                                                }`}
                                            >
                        {room.status}
                      </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                                            <span>현재 인원</span>
                                            <span>
                        <b>{room.currentCount}</b> / {room.capacity}
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`${color} h-3 rounded-full`}
                                                style={{ width: `${ratio}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-2">
                                            👩‍⚕️ {room.nurseInCharge || "담당 간호사 미배정"}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 col-span-3 text-center py-10">
                                병실 정보를 불러오는 중...
                            </p>
                        )}
                    </div>
                </section>

                {/* 🩺 수술실 현황 */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">🩺 수술실 현황</h2>
                    <div className="grid grid-cols-3 gap-6">
                        {operations.length > 0 ? (
                            operations.map((op) => {
                                const color =
                                    op.status === "IN_PROGRESS"
                                        ? "bg-red-500"
                                        : op.status === "SCHEDULED"
                                            ? "bg-yellow-500"
                                            : "bg-green-500";
                                return (
                                    <div
                                        key={op.operationId}
                                        className={`rounded-xl shadow-md p-5 border transition-all hover:shadow-lg ${
                                            op.status === "IN_PROGRESS"
                                                ? "bg-red-50 border-red-400"
                                                : op.status === "SCHEDULED"
                                                    ? "bg-yellow-50 border-yellow-400"
                                                    : "bg-green-50 border-green-400"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h2 className="text-lg font-semibold">
                                                {op.roomName || "수술실 미지정"}
                                            </h2>
                                            <span
                                                className={`text-xs px-3 py-1 rounded-full ${
                                                    op.status === "IN_PROGRESS"
                                                        ? "bg-red-500 text-white"
                                                        : op.status === "SCHEDULED"
                                                            ? "bg-yellow-500 text-white"
                                                            : "bg-green-500 text-white"
                                                }`}
                                            >
                        {op.status === "IN_PROGRESS"
                            ? "진행중"
                            : op.status === "SCHEDULED"
                                ? "예정"
                                : "대기"}
                      </span>
                                        </div>
                                        <div className="text-gray-700 text-sm mb-1">
                                            <b>수술명:</b> {op.operationName || "-"}
                                        </div>
                                        <div className="text-gray-700 text-sm mb-1">
                                            <b>담당의:</b> {op.doctorName || "-"}
                                        </div>
                                        <div className="text-gray-700 text-sm">
                                            <b>예정일:</b>{" "}
                                            {op.scheduledDate
                                                ? new Date(op.scheduledDate).toLocaleString("ko-KR")
                                                : "-"}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 col-span-3 text-center py-10">
                                금일 예약된 수술이 없습니다.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
