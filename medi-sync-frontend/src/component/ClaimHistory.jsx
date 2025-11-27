import React, { useState } from "react";

export default function ClaimHistory({ claims = [] }) {

    const [page, setPage] = useState(1);
    const size = 10
    const totalPages = Math.ceil((Array.isArray(claims) ? claims : claims.items || []).length / size);

    // ✔ claims가 items인지 배열인지 판별
    const list = Array.isArray(claims) ? claims : claims.items || [];

    if (!list || list.length === 0)
        return <p className="text-gray-500 mt-4">청구 이력이 없습니다.</p>;

    // ✔ 페이지에 따라 보여줄 데이터 제한
    const visible = list.slice(0, page * size);

    const statusColors = {
        SENT: "text-blue-600",
        APPROVED: "text-green-600",
        REJECTED: "text-red-500",
        RETRY: "text-yellow-500",
        PAID: "text-green-600"
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">청구 이력</h3>
            <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-3 border">청구일</th>
                        <th className="py-2 px-3 border">보험사</th>
                        <th className="py-2 px-3 border">청구금액</th>
                        <th className="py-2 px-3 border">지급금액</th>
                        <th className="py-2 px-3 border">결과</th>
                    </tr>
                    </thead>
                    <tbody>
                    {visible.map((c) => (
                        <tr key={c.claimId} className="text-center border-t hover:bg-gray-50">
                            <td className="py-2 px-3">{c.createdAt?.slice(0, 10) || "-"}</td>
                            <td className="py-2 px-3">{c.insurerName || c.insurerCode}</td>
                            <td className="py-2 px-3 font-medium">
                                {Math.round(c.claimAmount)?.toLocaleString()} 원
                            </td>
                            <td className="py-2 px-3">
                                {c.payoutAmount ? `${Math.round(c.payoutAmount).toLocaleString()} 원` : "-"}
                            </td>
                            <td className={`py-2 px-3 font-semibold ${statusColors[c.status] || "text-gray-500"}`}>
                                {c.status || "처리 중"}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* ➕ 더보기 버튼 */}
                <div className="mt-2">
                    {page < totalPages && (
                        <button
                            onClick={() => setPage(page + 1)}
                            className="
                                w-full py-3
                                flex items-center justify-center
                                bg-blue-50 hover:bg-blue-100
                                text-blue-700 font-semibold
                                border-t border-gray-200
                                transition
                            "
                        >
                            +
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
