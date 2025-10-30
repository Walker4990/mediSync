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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FaTimes className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    💊 {patient.name} 님의 처방 내역
                </h2>

                {list.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">등록된 처방이 없습니다.</p>
                ) : (
                    <table className="w-full text-sm border rounded-md">
                        <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="border p-2">유형</th>
                            <th className="border p-2">항목명</th>
                            <th className="border p-2">용량/횟수</th>
                            <th className="border p-2">단위</th>
                            <th className="border p-2">날짜</th>
                        </tr>
                        </thead>
                        <tbody>
                        {list.map((p, i) => (
                            <tr key={p.prescriptionId || i} className="hover:bg-gray-50">
                                <td className="border p-2">{p.type}</td>
                                <td className="border p-2">
                                    {p.drugName || p.testName || p.injectionName}
                                </td>
                                <td className="border p-2">
                                    {p.dosage || p.injectionCount || "-"}
                                </td>
                                <td className="border p-2">{p.unit || "-"}</td>
                                <td className="border p-2">
                                    {p.createdAt ? p.createdAt.substring(0, 10) : "-"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
