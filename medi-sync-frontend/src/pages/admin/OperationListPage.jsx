import { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";
import {useNavigate} from "react-router-dom";

export default function OperationListPage() {
    const [operations, setOperations] = useState([]);
    const navigate = useNavigate();
    // ✅ 페이지 로드시 리스트 불러오기
    useEffect(() => {
        axios
            .get("http://192.168.0.24:8080/api/operation/list")
            .then((res) => setOperations(res.data))
            .catch((err) => console.error("❌ 수술 목록 조회 실패:", err));
    }, []);

    return (
        <div className="p-20">
            <AdminHeader />
            <h2 className="text-2xl font-bold mb-4">🏥 수술 일정 목록</h2>

            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border p-2">ID</th>
                    <th className="border p-2">환자명</th>
                    <th className="border p-2">담당의</th>
                    <th className="border p-2">수술명</th>
                    <th className="border p-2">예정일</th>
                    <th className="border p-2">예정시간</th>
                    <th className="border p-2">상태</th>
                    <th className="border p-2">관리</th>
                </tr>
                </thead>

                <tbody>
                {operations.length === 0 ? (
                    <tr>
                        <td colSpan="8" className="text-center py-4 text-gray-500">
                            등록된 수술이 없습니다.
                        </td>
                    </tr>
                ) : (
                    operations.map((op) => (
                        <tr key={op.operationId} className="hover:bg-gray-50">
                            <td className="border p-2 text-center">{op.operationId}</td>
                            <td className="border p-2">{op.patientName}</td>
                            <td className="border p-2">{op.doctorName}</td>
                            <td className="border p-2">{op.operationName}</td>
                            <td className="border p-2">
                                {op.scheduledDate ? op.scheduledDate.substring(0, 10) : "-"}
                            </td>
                            <td className="border p-2 text-center">
                                {op.scheduledTime ? op.scheduledTime.substring(0, 5) : "-"}
                            </td>
                            <td className="border p-2 text-center">{op.status}</td>
                            <td className="border p-2 text-center">
                                <button
                                    onClick={() => navigate(`/admin/operation/${op.operationId}`)}
                                    className="text-blue-600 hover:underline"
                                >
                                    상세보기
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}
