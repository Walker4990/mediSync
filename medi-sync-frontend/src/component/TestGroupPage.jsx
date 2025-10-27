import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import TimeSlotModal from "./TimeSlotModal";
import {FaEdit, FaFileDownload, FaTrashAlt} from "react-icons/fa";

export default function TestGroupPage({ group, title }) {
    const [reservations, setReservations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [timeModalOpen, setTimeModalOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // ✅ 그룹별 예약 조회
    const loadReservations = () => {
        const url = group
            ? `http://192.168.0.24:8080/api/test/reservation/group/${group}`
            : `http://192.168.0.24:8080/api/test/reservation`;

        axios.get(url)
            .then(res => {
                console.log("📦 조회 결과:", res.data); // ✅ 여기에 넣어야 함
                setReservations(res.data);
            })
            .catch(err => console.error("❌ 조회 실패:", err));
    };

    const handleSearch = () => {
        const url = `http://192.168.0.24:8080/api/test/reservation/group/${group}/search`;
        axios
            .get(url, { params: { keyword, startDate, endDate } })
            .then(res => setReservations(res.data))
            .catch(err => console.error("❌ 검색 실패:", err));
    };

    useEffect(() => { loadReservations(); }, [group]);

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

    // ✅ 삭제
    const handleDelete = async (reservationId) => {
        if (!reservationId) return alert("예약 ID가 유효하지 않습니다.");
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`http://192.168.0.24:8080/api/test/reservation/${reservationId}`);
            alert("🗑️ 삭제 완료");
            loadReservations();
        } catch (err) {
            console.error("❌ 삭제 실패:", err);
            alert("삭제 중 오류 발생");
        }
    };

    const handleDownloadPdf = (reservationId) => {
        axios.get(`http://192.168.0.24:8080/api/testResult/${reservationId}/pdf`, {
            responseType: "blob",
        })
            .then((res) => {
                const blob = new Blob([res.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `검사결과_${reservationId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => console.error("❌ PDF 다운로드 실패:", err));
    };


    return (
        <div className="p-20">
            <AdminHeader />
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">{title}</h2>

            <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* 🔍 검색 입력 */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="환자명 또는 검사명 검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-60 focus:ring-emerald-400 focus:border-emerald-400 transition"
                    />
                </div>

                {/* 📅 기간 선택 */}
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
                    />
                </div>

                {/* 🔘 버튼 그룹 */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition"
                    >
                        검색
                    </button>
                    <button
                        onClick={() => {
                            setKeyword("");
                            setStartDate("");
                            setEndDate("");
                            loadReservations();
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                    >
                        초기화
                    </button>
                </div>
            </div>

            {/* ✅ 예약 목록 */}
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
                        <th classNmae="px-4 py-2 text-left">결과 출력</th>
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
                                <td className="px-4 py-2 text-center align-middle">
                                    <div className="flex justify-center items-center h-full">
                                        <button
                                            onClick={() => handleDownloadPdf(r.reservationId)}
                                            className="flex items-center justify-center text-emerald-600 hover:text-emerald-800 p-1 rounded-md transition duration-150 ease-in-out"
                                            title="검사 결과 출력"
                                        >
                                            <FaFileDownload className="w-6 h-6" />
                                        </button>
                                    </div>
                                </td>

                                <td className="px-4 py-2 text-center flex justify-center space-x-2">
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
