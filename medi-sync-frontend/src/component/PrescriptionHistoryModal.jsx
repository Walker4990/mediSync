import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";

export default function PrescriptionHistoryModal({ open, onClose, patient }) {
    const [list, setList] = useState([]);

    useEffect(() => {
        if (open && patient) {
            axios
                .get(`http://192.168.0.24:8080/api/patients/history/${patient.patientId}`)
                .then((res) => setList(res.data))
                .catch((err) => console.error("❌ 처방 내역 조회 실패:", err));
        }
    }, [open, patient]);

    if (!open || !patient) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl relative flex flex-col max-h-[80vh]">
                {/* ✅ 헤더 고정 */}
                <header className="flex justify-between items-center px-6 py-4 border-b bg-white rounded-t-xl sticky top-0 z-10">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">
                        💊 {patient.name} 님의 처방 내역
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </header>

                {/* ✅ 스크롤 되는 본문 */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {list.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">
                            등록된 처방이 없습니다.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-gray-200 rounded-md">
                                <thead className="bg-gray-100 text-gray-700 sticky top-0">
                                <tr>
                                    <th className="border p-2 w-20">유형</th>
                                    <th className="border p-2 w-36">항목명</th>
                                    <th className="border p-2 w-24">용량/횟수</th>
                                    <th className="border p-2 w-20">단위</th>
                                    <th className="border p-2 w-28">날짜</th>
                                </tr>
                                </thead>
                                <tbody>
                                {list.map((p, i) => (
                                    <tr
                                        key={p.prescriptionId || i}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="border p-2 text-center">{p.type}</td>
                                        <td
                                            className="border p-2 truncate max-w-[150px]"
                                            title={p.drugName || p.testName || p.injectionName}
                                        >
                                            {p.drugName || p.testName || p.injectionName}
                                        </td>
                                        <td className="border p-2 text-center">
                                            {p.dosage || p.injectionCount || "-"}
                                        </td>
                                        <td className="border p-2 text-center">{p.unit || "-"}</td>
                                        <td className="border p-2 text-center">
                                            {p.createdAt ? p.createdAt.substring(0, 10) : "-"}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ✅ 푸터 고정 */}
                <footer className="border-t bg-gray-50 px-6 py-3 flex justify-end rounded-b-xl sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        닫기
                    </button>
                </footer>
            </div>
        </div>
    );
}
