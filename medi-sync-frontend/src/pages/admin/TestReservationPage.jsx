import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";
import TimeSlotModal from "../../component/TimeSlotModal";
import {FaEdit, FaTrashAlt} from "react-icons/fa"; // ✅ 추가

export default function TestReservationPage() {
    const [reservations, setReservations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [timeModalOpen, setTimeModalOpen] = useState(false); // ✅ 시간 선택 모달
    const [selectedTime, setSelectedTime] = useState(null);

    // ✅ 전체 예약 조회
    const loadReservations = () => {
        axios.get("http://192.168.0.24:8080/api/test/reservation")
            .then(res => {
                console.log("📦 예약 데이터:", res.data);  // 👈 이거 추가
                setReservations(res.data);
            })
            .catch(err => console.error("❌ 조회 실패:", err));
    };

    useEffect(() => { loadReservations(); }, []);

    // ✅ 수정 모달 열기
    const handleEdit = (resv) => {
        setSelected(resv);
        setSelectedTime(resv.testTime);
        setModalOpen(true);
    };

    // ✅ 시간 선택 모달에서 값 받아오기
    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setSelected((prev) => ({ ...prev, testTime: time }));
    };

    // ✅ 수정 저장
    const handleSave = () => {
        axios.put(`http://192.168.0.24:8080/api/testSchedule/${selected.scheduleId}`, {
            testCode: selected.testCode,
            testDate: selected.testDate,
            testTime: selected.testTime,
            capacity: selected.capacity,
            reserved: selected.reserved
        })
            .then(() => {
                alert("수정 완료");
                setModalOpen(false);
                loadReservations();
            })
            .catch(err => console.error("❌ 수정 실패:", err));
    };
    const handleDelete = async (reservationId) => {
        console.log("🔎 handleDelete called with:", reservationId);

        // 방어 검사
        if (reservationId == null) {
            console.warn("handleDelete: reservationId is null/undefined. aborting.");
            return;
        }

        // 확인
        const ok = window.confirm("정말 삭제하시겠습니까?");
        if (!ok) return;

        try {
            await axios.delete(`http://192.168.0.24:8080/api/test/reservation/${reservationId}`);
            alert("🗑️ 삭제 완료");
            await loadReservations(); // 목록 새로고침
        } catch (err) {
            console.error("❌ 삭제 실패:", err);
            alert("삭제 중 오류가 발생했습니다. 콘솔 로그를 확인해주세요.");
        }
    };
    return (
        <div className="p-20">
            <AdminHeader />
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">🧪 검사 예약 관리</h2>

            {/* ✅ 예약 목록 테이블 */}
            <div className="overflow-x-auto bg-white rounded-xl shadow border">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="px-4 py-2 text-left">예약ID</th>
                        <th className="px-4 py-2 text-left">환자명</th>
                        <th className="px-4 py-2 text-left">검사명</th>
                        <th className="px-4 py-2 text-left">검사일자</th>
                        <th className="px-4 py-2 text-left">시간</th>
                        <th className="px-4 py-2 text-left">상태</th>
                        <th className="px-4 py-2 text-center">관리</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {reservations.length > 0 ? (
                        reservations.map((r) => (
                            <tr key={r.reservationId} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{r.reservationId}</td>
                                <td className="px-4 py-2">{r.patientName}</td>
                                <td className="px-4 py-2">{r.testName}</td>
                                <td className="px-4 py-2">{r.testDate}</td>
                                <td className="px-4 py-2">{r.testTime}</td>
                                <td className="px-4 py-2">{r.status}</td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => handleEdit(r)}
                                        className="flex items-center text-blue-600 hover:text-blue-800 p-1 rounded-md transition duration-150 ease-in-out"
                                    >
                                        <FaEdit className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(r.reservationId)}
                                        className="flex items-center text-red-600 hover:text-red-800 p-1 rounded-md transition duration-150 ease-in-out"
                                    >
                                        <FaTrashAlt className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="7" className="text-center py-6 text-gray-500">예약 내역이 없습니다.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* ✅ 수정 모달 */}
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">예약 수정</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">검사일자</label>
                                <input
                                    type="date"
                                    name="testDate"
                                    value={selected.testDate || ""}
                                    onChange={(e) => setSelected({ ...selected, testDate: e.target.value })}
                                    className="w-full border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">검사 시간</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={selectedTime || ""}
                                        readOnly
                                        className="flex-1 border-gray-300 rounded-md px-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setTimeModalOpen(true)}
                                        className="px-3 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                                    >
                                        시간 선택
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end space-x-2">
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                                >
                                    저장
                                </button>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ 시간 선택 모달 */}
            <TimeSlotModal
                testCode={selected?.testCode}
                testDate={selected?.testDate}
                open={timeModalOpen}
                onClose={() => setTimeModalOpen(false)}
                onSelectTime={handleTimeSelect}
            />
        </div>
    );
}
