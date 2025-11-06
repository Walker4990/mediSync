import { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";
import PatientDetailModal from "../../component/PatientDetailModal";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function AdmissionPage() {
    const [rooms, setRooms] = useState([]);
    const [admissions, setAdmissions] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [filteredAdmissions, setFilteredAdmissions] = useState([]);
    const [transferList, setTransferList] = useState([]);
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const socket = new SockJS("http://192.168.0.24:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("✅ 입원 관리 WebSocket 연결됨");

                // 퇴원 알림 구독
                stompClient.subscribe("/topic/admission/discharge", (msg) => {
                    console.log("📩 실시간 퇴원 알림 수신:", msg.body);
                    fetchRooms();
                    fetchAdmissions();
                });

                // 입원/병실이동 알림 구독
                stompClient.subscribe("/topic/admission/update", (msg) => {
                    console.log("📩 입원/병실 이동 알림 수신:", msg.body);
                    fetchRooms();
                    fetchAdmissions();
                });
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);


    // ✅ 병실 목록 조회
    const fetchRooms = async () => {
        try {
            const res = await axios.get("http://192.168.0.24:8080/api/rooms/list");
            setRooms(res.data);
        } catch (err) {
            console.error("❌ 병실 목록 조회 실패:", err);
        }
    };

    useEffect(() => {
        console.log("📦 전체 admission 데이터:", admissions);
    }, [admissions]);

    useEffect(() => {
        console.log("🛏 선택된 병실:", selectedRoom);
    }, [selectedRoom]);

    // ✅ 입원 환자 목록 조회
    const fetchAdmissions = async () => {
        try {
            const res = await axios.get("http://192.168.0.24:8080/api/admission/list");
            setAdmissions(res.data);
        } catch (err) {
            console.error("❌ 입원 환자 목록 조회 실패:", err);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchAdmissions();
    }, []);

    // ✅ 특정 병실 클릭 시 선택
    const handleSelectRoom = async (room) => {
        setSelectedRoom(room);
        setLoadingPatients(true);
        try {
            const res = await axios.get(`http://192.168.0.24:8080/api/admission/room/${room.roomId}`);
            setFilteredAdmissions(res.data);
        } catch (err) {
            console.error("❌ 병실 환자 목록 불러오기 실패:", err);
            setFilteredAdmissions([]);
        } finally {
            setLoadingPatients(false);
        }
    };

    // ✅ 퇴원 처리
    const handleDischarge = async (admissionId) => {
        if (!window.confirm("퇴원 처리하시겠습니까?")) return;
        try {
            const res = await axios.put(
                `http://192.168.0.24:8080/api/admission/${admissionId}/discharge`
            );
            if (res.data.success) {
                alert("퇴원 처리 완료 ✅");
                fetchAdmissions();
                fetchRooms(); // 병실 인원 갱신
                window.location.reload();
            } else {
                alert("퇴원 처리 실패 ❌");
            }
        } catch (err) {
            console.error("❌ 퇴원 처리 오류:", err);
            alert("서버 오류로 퇴원 처리를 실패했습니다.");
        }
    };
    const handleExpectedDateChange = async (admissionId, date) => {
        try {
            await axios.put(`http://192.168.0.24:8080/api/admission/${admissionId}/dischargedAt`, {
                dischargedAt: date
            });
            alert("퇴원 예정일이 수정되었습니다 ✅");
            fetchAdmissions();
            if (selectedRoom) handleSelectRoom(selectedRoom); // 갱신
        } catch (err) {
            console.error("❌ 퇴원 예정일 수정 실패:", err);
            alert("수정 실패 ❌");
        }
    };

    const handleRoomTransfer = async (roomId, admissionId) => {
        setSelectedAdmission(admissionId);
        try {
            const res = await axios.get(`http://192.168.0.24:8080/api/admission/${roomId}/transfer-options`);
            setTransferList(res.data);
            setShowModal(true);
        } catch (err) {
            console.error("❌ 병실 이동 대상 조회 실패:", err);
            alert("이동 가능한 병실을 불러오지 못했습니다.");
        }
    };

    const confirmTransfer = async (newRoomId) => {
        if (!window.confirm("해당 병실로 이동하시겠습니까?")) return;
        try {
            await axios.put(`http://192.168.0.24:8080/api/admission/${selectedAdmission}/transfer`, {
                newRoomId: newRoomId,
            });
            alert("병실 이동 완료 ✅");
            setShowModal(false);
            fetchAdmissions();
            fetchRooms();
        } catch (err) {
            console.error("❌ 병실 이동 실패:", err);
            alert("이동 중 오류가 발생했습니다.");
        }
    };
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleNoteModal = (patientId) => {
        setSelectedPatient(patientId);
        setNoteModalOpen(true);
    };

// ✅ 모달 닫기
    const handleCloseNoteModal = () => {
        setNoteModalOpen(false);
        setSelectedPatient(null);
    };

    return (
        <div className="font-pretendard bg-gray-50 min-h-screen">
            <AdminHeader />
            <div className="max-w-6xl mx-auto py-10 space-y-8">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">🏥 병실 현황</h1>

                {/* 병실 카드 리스트 */}
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
                                    onClick={() => handleSelectRoom(room)}
                                    className={`cursor-pointer rounded-xl shadow-md p-5 border transition-all hover:shadow-lg ${
                                        selectedRoom?.roomId === room.roomId
                                            ? "ring-4 ring-blue-400"
                                            : ""
                                    } ${
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
                                        👩‍⚕️ {room.nurseInCharge || "미배정"}
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

                {/* ✅ 선택된 병실 상세 테이블 */}
                {selectedRoom && (
                    <div className="bg-white shadow-md p-6 rounded-xl mt-10">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            🛏 {selectedRoom.roomNo} ({selectedRoom.wardName}) 입원 환자
                        </h2>
                        {filteredAdmissions.length > 0 ? (
                            <table className="w-full border border-gray-200 text-sm">
                                <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-3 border">환자명</th>
                                    <th className="p-3 border">입원일</th>
                                    <th className="p-3 border">퇴원 예정일</th>
                                    <th className="p-3 border">상태</th>
                                    <th className="p-3 border">관리</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAdmissions.map((a) => (
                                    <tr key={a.admissionId} className="text-center border-t">
                                        <td className="p-3">{a.patientName}</td>
                                        <td className="p-3">
                                            {new Date(a.admittedAt).toLocaleString()}
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="date"
                                                value={a.dischargedAt ? a.dischargedAt.split("T")[0] : ""}
                                                onChange={(e) =>
                                                    handleExpectedDateChange(a.admissionId, e.target.value)
                                                }
                                                className="border rounded px-2 py-1 text-sm"
                                            />
                                        </td>
                                        <td className="p-3">
                                            {a.status === "ADMITTED"
                                                ? "입원중"
                                                : a.status === "SCHEDULED"
                                                    ? "입원 예정"
                                                    : "퇴원"}
                                        </td>

                                        <td className="p-3">
                                            {(a.status === "ADMITTED" || a.status === "SCHEDULED") &&(
                                                <>
                                                    <button
                                                        onClick={() => handleDischarge(a.admissionId)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                                    >
                                                        퇴원
                                                    </button>
                                                    <button
                                                        onClick={() => handleRoomTransfer(a.roomId, a.admissionId)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded ml-2"
                                                    >
                                                        병실이동
                                                    </button>
                                                    <button
                                                        onClick={() => handleNoteModal(a.patientId)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded ml-2"
                                                    >
                                                        특이사항
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 py-6 text-center">
                                현재 이 병실에는 입원 환자가 없습니다.
                            </p>
                        )}
                    </div>
                )}
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-bold mb-4">🏥 병실 이동</h3>

                        {transferList.length > 0 ? (
                            <ul className="space-y-2">
                                {transferList.map((room) => (
                                    <li
                                        key={room.roomId}
                                        onClick={() => confirmTransfer(room.roomId)}
                                        className="flex justify-between items-center border p-2 rounded cursor-pointer hover:bg-gray-100"
                                    >
                                        <span>{room.roomNo} ({room.wardName})</span>
                                        <span className="text-gray-500 text-sm">
                {room.currentCount}/{room.capacity}
              </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">이동 가능한 병실이 없습니다.</p>
                        )}

                        <div className="text-right mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {noteModalOpen && selectedPatient && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-[600px] relative p-6">
                        <button
                            onClick={handleCloseNoteModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <PatientDetailModal patient={{ patientId: selectedPatient }} />
                    </div>
                </div>
            )}

        </div>
    );
}
