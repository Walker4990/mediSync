import React, { useEffect, useState } from "react";
import { fetchInsurers, syncInsurers } from "../../api/InsurerService";

export default function InsurerPage() {
    const [insurers, setInsurers] = useState([]);
    const [loading, setLoading] = useState(false);

    // 보험사 목록 불러오기
    const loadInsurers = async () => {
        setLoading(true);
        try {
            const data = await fetchInsurers();
            setInsurers(data);
        } catch (err) {
            console.error("보험사 목록 조회 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    // 보험사 동기화 버튼
    const handleSync = async () => {
        if (!window.confirm("KFTC에서 최신 보험사 목록을 불러올까요?")) return;
        setLoading(true);
        try {
            const result = await syncInsurers();
            alert(`✅ 보험사 목록 동기화 완료 (${result.updated}건)`);
            await loadInsurers();
        } catch (err) {
            console.error("동기화 실패:", err);
            alert("❌ 동기화 실패 - 콘솔을 확인하세요.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsurers();
    }, []);

    return (
        <div className="max-w-6xl mx-auto pt-24 pb-10 px-6 font-pretendard">
            {/* 헤더 영역 */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-blue-600">보험사 관리</h1>
                <button
                    onClick={handleSync}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white font-semibold transition
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    🔄 보험사 동기화
                </button>
            </div>

            {/* 카드형 테이블 영역 */}
            <div className="bg-white rounded-lg shadow-md border p-4">
                {loading ? (
                    <p>⏳ 데이터를 불러오는 중...</p>
                ) : insurers.length === 0 ? (
                    <p className="text-gray-500">등록된 보험사가 없습니다.</p>
                ) : (
                    <table className="min-w-full text-sm border-t">
                        <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-left">코드</th>
                            <th className="px-3 py-2 text-left">보험사명</th>
                            <th className="px-3 py-2 text-left">API Endpoint</th>
                            <th className="px-3 py-2 text-left">담당자 연락처</th>
                        </tr>
                        </thead>
                        <tbody>
                        {insurers.map((ins, i) => (
                            <tr
                                key={i}
                                className="border-b hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-3 py-2">{ins.insurer_code}</td>
                                <td className="px-3 py-2 font-medium text-gray-800">
                                    {ins.insurer_name}
                                </td>
                                <td className="px-3 py-2 text-blue-600">
                                    {ins.api_endpoint || "-"}
                                </td>
                                <td className="px-3 py-2">{ins.contact || "-"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
