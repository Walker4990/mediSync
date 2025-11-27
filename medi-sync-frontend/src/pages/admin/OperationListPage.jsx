import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";
import { useNavigate } from "react-router-dom";

export default function OperationListPage() {
    const [operations, setOperations] = useState([]);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [patientName, setPatientName] = useState("");
    const [adminName, setAdminName] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    useEffect(() => {
        fetchOperations();
    }, [page, size]);

    const fetchOperations = () => {
        axios.get("http://192.168.0.24:8080/api/operation/list", {
            params: {
                page,
                size,
                patientName,
                adminName,
                scheduledDate,
                scheduledTime
            }
        })
            .then((res) => {
                setOperations(res.data.items);
                setTotalPages(res.data.totalPages);
            })
            .catch((err) => console.error("❌ 수술 목록 조회 실패:", err));
    };
    const handleComplete = async (operationId) => {
        if (!window.confirm("수술을 완료 처리하시겠습니까?")) return;
        try {
            await axios.post(`http://192.168.0.24:8080/api/operation/${operationId}/complete`);
            alert("✅ 수술이 완료되었습니다.");
            fetchOperations();
        } catch (err) {
            alert("❌ 완료 처리 실패");
            console.error(err);
        }
    };

    const handlePrint = (operationId) => {
        window.open(`http://192.168.0.24:8080/api/operation/${operationId}/report`, "_blank");
    };

    const formatTime = (timeString) => {
        if (!timeString) return "-";
        if (timeString.includes("T")) return timeString.split("T")[1].slice(0, 5);
        return timeString.slice(0, 5);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <AdminHeader />

            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">🏥 수술 일정 목록</h2>

                </div>
                {/* 🔍 검색 영역 */}
                <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6 border">
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">검색 조건</h3>

                    <div className="grid grid-cols-5 gap-4">

                        {/* 환자명 */}
                        <div className="flex flex-col text-sm">
                            <label className="mb-1 font-medium">환자명</label>
                            <input
                                type="text"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="border px-3 py-2 rounded"
                                placeholder="예: 홍길동"
                            />
                        </div>

                        {/* 의사명 */}
                        <div className="flex flex-col text-sm">
                            <label className="mb-1 font-medium">의사명</label>
                            <input
                                type="text"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                className="border px-3 py-2 rounded"
                                placeholder="예: 김의사"
                            />
                        </div>

                        {/* 날짜 */}
                        <div className="flex flex-col text-sm">
                            <label className="mb-1 font-medium">수술일자</label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="border px-3 py-2 rounded"
                            />
                        </div>

                        {/* 시간 */}
                        <div className="flex flex-col text-sm">
                            <label className="mb-1 font-medium">수술시간</label>
                            <input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="border px-3 py-2 rounded"
                            />
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setPage(1);
                                    fetchOperations();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm w-full"
                            >
                                검색
                            </button>

                            <button
                                onClick={() => {
                                    setPatientName("");
                                    setAdminName("");
                                    setScheduledDate("");
                                    setScheduledTime("");
                                    setPage(1);
                                    fetchOperations();
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm w-full"
                            >
                                초기화
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-gray-800 text-center">
                        <tr>
                            <th className="py-3 px-4 border">ID</th>
                            <th className="py-3 px-4 border">환자명</th>
                            <th className="py-3 px-4 border">담당의</th>
                            <th className="py-3 px-4 border">수술명</th>
                            <th className="py-3 px-4 border">예정일</th>
                            <th className="py-3 px-4 border">예정시간</th>
                            <th className="py-3 px-4 border">상태</th>
                            <th className="py-3 px-4 border">관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {operations.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="text-center py-6 text-gray-500"
                                >
                                    등록된 수술이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            operations.map((op) => (
                                <tr
                                    key={op.operationId}
                                    className="hover:bg-gray-50 transition text-center"
                                >
                                    <td className="border py-2">{op.operationId}</td>
                                    <td className="border py-2">{op.patientName}</td>
                                    <td className="border py-2">{op.adminName}</td>
                                    <td className="border py-2">{op.operationName}</td>
                                    <td className="border py-2">
                                        {op.scheduledDate?.substring(0, 10) || "-"}
                                    </td>
                                    <td className="border py-2">
                                        {formatTime(op.scheduledTime)}
                                    </td>

                                    <td className="border py-2 font-semibold">
                                        {op.status === "SCHEDULED" && (
                                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">예정</span>
                                        )}
                                        {op.status === "IN_PROGRESS" && (
                                            <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs">진행중</span>
                                        )}
                                        {op.status === "COMPLETED" && (
                                            <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">완료</span>
                                        )}
                                    </td>

                                    <td className="border py-2">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    navigate(`/admin/operation/${op.operationId}`)
                                                }
                                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md"
                                            >
                                                🔍 상세
                                            </button>

                                            <button
                                                onClick={() => handleComplete(op.operationId)}
                                                disabled={op.status === "COMPLETED"}
                                                className={`text-xs px-3 py-1.5 rounded-md shadow-sm transition
                                                        ${
                                                    op.status === "COMPLETED"
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-green-600 hover:bg-green-700 text-white"
                                                }`}
                                            >
                                                ✅ 완료
                                            </button>

                                            <button
                                                onClick={() => handlePrint(op.operationId)}
                                                disabled={op.status !== "COMPLETED"}
                                                className={`text-xs px-3 py-1.5 rounded-md shadow-sm transition
                                                        ${
                                                    op.status !== "COMPLETED"
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-gray-700 hover:bg-gray-800 text-white"
                                                }`}
                                            >
                                                📄 출력
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center mt-6 gap-2">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
                    >
                        이전
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`
                    px-3 py-1 rounded
                    ${page === pageNum
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }
                `}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
                    >
                        다음
                    </button>

                </div>
            </div>
        </div>
    );
}
