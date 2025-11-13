import React from "react";

export default function InsuranceList({ insList }) {
    const STATUS_LABELS = {
        "01": "청약",
        "02": "정상",
        "03": "휴면",
        "04": "실효",
        "05": "해지",
        "06": "만기",
        "07": "지급완료",
    };

    const STATUS_COLORS = {
        "01": "bg-blue-500",
        "02": "bg-green-500",
        "03": "bg-yellow-400",
        "04": "bg-orange-400",
        "05": "bg-gray-400",
        "06": "bg-purple-500",
        "07": "bg-amber-800",
    };

    const renderStatus = (code) => {
        const label = STATUS_LABELS[code] || "기타";
        const color = STATUS_COLORS[code] || "bg-gray-500";
        return (
            <span
                className={`${color} text-white text-sm px-3 py-1 rounded-full font-semibold shadow-sm`}
            >
        {label}
      </span>
        );
    };

    if (!insList.length)
        return (
            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl shadow-inner">
                가입된 보험이 없습니다.
            </div>
        );

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                💳 가입 보험 목록
            </h3>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-gray-200">
                    <tr>
                        <th className="py-3 px-4 text-left font-semibold">보험사</th>
                        <th className="py-3 px-4 text-left font-semibold">상품명</th>
                        <th className="py-3 px-4 text-center font-semibold">보장율</th>
                        <th className="py-3 px-4 text-center font-semibold">상태</th>
                        <th className="py-3 px-4 text-center font-semibold">가입일</th>
                        <th className="py-3 px-4 text-center font-semibold">만기일</th>
                    </tr>
                    </thead>
                    <tbody>
                    {insList.map((it, idx) => (
                        <tr
                            key={it.insuNum}
                            className={`hover:bg-gray-50 transition ${
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                        >
                            <td className="py-3 px-4 font-medium">{it.insurerName}</td>
                            <td className="py-3 px-4">{it.prodName}</td>
                            <td className="py-3 px-4 text-center font-semibold text-blue-600">
                                {it.coverageRate}%
                            </td>
                            <td className="py-3 px-4 text-center">
                                {renderStatus(it.insuStatus)}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-600">
                                {it.issueDate}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-600">
                                {it.expDate}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-4 text-xs text-gray-400 text-right">
                * 보장율 및 상태는 실시간 보험사 API와 동기화됩니다.
            </p>
        </div>
    );
}
