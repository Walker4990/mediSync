import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import FinanceHeader from "../../component/FinanceHeader";

export default function FinanceTransactionPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        type: "",
        category: "",
        status: "",
        startDate: "",
        endDate: "",
        sort: "desc",
    });

    useEffect(() => {
        fetchTransactions();
    }, [filters]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://192.168.0.24:8080/api/finance/list", {
                params: filters,
            });
            setList(res.data);
        } catch (err) {
            toast.error("❌ 거래내역 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <FinanceHeader />

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* 필터 영역 */}
                <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-lg shadow">
                    <select
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="border px-3 py-2 rounded-md"
                    >
                        <option value="">전체 구분</option>
                        <option value="INCOME">수익</option>
                        <option value="EXPENSE">지출</option>
                        <option value="CLAIM">보험청구</option>
                    </select>

                    <select
                        onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                        }
                        className="border px-3 py-2 rounded-md"
                    >
                        <option value="">전체 상태</option>
                        <option value="COMPLETED">완료</option>
                        <option value="REFUNDED">환불</option>
                        <option value="PENDING">대기</option>
                    </select>

                    <input
                        type="date"
                        onChange={(e) =>
                            setFilters({ ...filters, startDate: e.target.value })
                        }
                        className="border px-3 py-2 rounded-md"
                    />
                    <span>~</span>
                    <input
                        type="date"
                        onChange={(e) =>
                            setFilters({ ...filters, endDate: e.target.value })
                        }
                        className="border px-3 py-2 rounded-md"
                    />

                    <button
                        onClick={fetchTransactions}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        조회
                    </button>
                </div>

                {/* 테이블 영역 */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-3 border whitespace-nowrap">거래 번호</th>
                            <th className="p-3 border whitespace-nowrap">참조 구분</th>
                            <th className="p-3 border whitespace-nowrap">참조 ID</th>
                            <th className="p-3 border whitespace-nowrap">환자 ID</th>
                            <th className="p-3 border whitespace-nowrap">유형</th>
                            <th className="p-3 border whitespace-nowrap">금액</th>
                            <th className="p-3 border whitespace-nowrap">설명</th>
                            <th className="p-3 border whitespace-nowrap">상태</th>
                            <th className="p-3 border whitespace-nowrap">등록일</th>
                            <th className="p-3 border whitespace-nowrap">수정일</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="12" className="p-6 text-gray-500">
                                    불러오는 중...
                                </td>
                            </tr>
                        ) : list.length === 0 ? (
                            <tr>
                                <td colSpan="12" className="p-6 text-gray-400">
                                    거래 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            list.map((tx) => (
                                <tr
                                    key={tx.txId}
                                    className="border-t hover:bg-gray-50 transition"
                                >
                                    <td className="p-3 text-gray-600">{tx.txId}</td>
                                    <td className="p-3 text-gray-600">{tx.refType}</td>
                                    <td className="p-3 text-gray-600">{tx.refId || "-"}</td>
                                    <td className="p-3 text-gray-600">{tx.patientId || "-"}</td>
                                    <td
                                        className={`p-3 font-semibold ${
                                            tx.type === "INCOME"
                                                ? "text-green-600"
                                                : tx.type === "EXPENSE"
                                                    ? "text-red-500"
                                                    : "text-indigo-600"
                                        }`}
                                    >
                                        {tx.type === "INCOME"
                                            ? "수익"
                                            : tx.type === "EXPENSE"
                                                ? "지출"
                                                : "보험청구"}
                                    </td>
                                    <td className="p-3 text-right pr-6 font-semibold">
                                        {new Intl.NumberFormat("ko-KR", {
                                            maximumFractionDigits: 0,
                                        }).format(tx.amount)}{" "}
                                        원
                                    </td>
                                    <td className="p-3 text-gray-700">
                                        {tx.description || "-"}
                                    </td>
                                    <td
                                        className={`p-3 ${
                                            tx.status === "COMPLETED"
                                                ? "text-green-600"
                                                : tx.status === "PENDING"
                                                    ? "text-yellow-500"
                                                    : "text-gray-400"
                                        }`}
                                    >
                                        {tx.status}
                                    </td>
                                    <td className="p-3 text-gray-500">
                                        {tx.createdAt ?? "-"}
                                    </td>
                                    <td className="p-3 text-gray-500">
                                        {tx.updatedAt ?? "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
