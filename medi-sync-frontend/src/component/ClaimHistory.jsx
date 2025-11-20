import React from "react";

export default function ClaimHistory({ claims = [] }) {
    if (!claims || claims.length === 0)
        return <p className="text-gray-500 mt-4">청구 이력이 없습니다.</p>;

    // 상태 컬러 매핑
    const statusColors = {
        SENT: "text-blue-600",
        APPROVED: "text-green-600",
        REJECTED: "text-red-500",
        RETRY: "text-yellow-500",
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
                    {claims.map((c) => (
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
                                {c.status ? c.status : "처리 중"}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
