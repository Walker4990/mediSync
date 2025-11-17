import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import PrescriptionModal from "./PrescriptionModal";
import PrescriptionHistoryModal from "./PrescriptionHistoryModal";

export default function PrescriptionInpatientPage() {
    const [inpatients, setInpatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    // ✅ 입원환자 조회
    const fetchInpatients = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://192.168.0.24:8080/api/patients/inpatients");
            setInpatients(res.data);
            console.log(res.data);
        } catch (err) {
            console.error("❌ 입원환자 조회 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInpatients();
    }, []);

    // ✅ 처방 저장
    const handleSave = async (data) => {
        try {
            // 선택된 환자 기준으로 recordId, patientId 바인딩
            const payload = {
                ...data,
                patientId: selectedPatient.patientId,
                recordId: selectedPatient.recordId,
                drugName: data.type === "DRUG" ? data.itemName : null,
                injectionName: data.type === "INJECTION" ? data.itemName : null,
                testName: data.type === "TEST" ? data.itemName : null
            }
            await axios.post("http://192.168.0.24:8080/api/prescriptions/add", payload);
            alert("💾 처방이 등록되었습니다.");
            setModalOpen(false);
            fetchInpatients(); // 목록 갱신
        } catch (err) {
            console.error("❌ 처방 등록 실패:", err);
            alert("처방 등록 실패");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <AdminHeader />
            <div className="flex justify-between items-center mb-6 mt-4">
                <h2 className="text-lg font-semibold text-gray-800">🏥 입원환자 처방 관리</h2>
            </div>

            {/* 입원환자 목록 테이블 */}
            {loading ? (
                <p className="text-gray-500 text-sm">불러오는 중...</p>
            ) : inpatients.length === 0 ? (
                <p className="text-gray-500 text-sm">입원한 환자가 없습니다.</p>
            ) : (
                <table className="w-full border text-sm bg-white rounded-md overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="p-2 border">환자명</th>
                        <th className="p-2 border">병동</th>
                        <th className="p-2 border">병실</th>
                        <th className="p-2 border">간호사</th>
                        <th className="p-2 border">진단명</th>
                        <th className="p-2 border">담당의</th>
                        <th className="p-2 border">입원일</th>
                        <th className="p-2 border">상태</th>
                        <th className="p-2 border">처방</th>
                    </tr>
                    </thead>
                    <tbody>
                    {inpatients.map((p, index) => (
                        <tr key={`${p.patientId}-${index}`} className="hover:bg-gray-50">
                            <td className="p-2 border">{p.name}</td>
                            <td className="p-2 border">{p.wardName || "-"}</td>
                            <td className="p-2 border">{p.roomNo || "-"}</td>
                            <td className="p-2 border">{p.nurseName || "-"}</td>
                            <td className="p-2 border">{p.diagnosis || "-"}</td>
                            <td className="p-2 border">{p.doctorName || "-"}</td>
                            <td className="p-2 border">
                                {p.admissionDate ? p.admissionDate.substring(0, 10) : "-"}
                            </td>
                            <td
                                className={`p-2 border text-center font-medium ${
                                    p.roomStatus === "FULL"
                                        ? "text-red-600"
                                        : p.roomStatus === "AVAILABLE"
                                            ? "text-green-600"
                                            : "text-gray-500"
                                }`}
                            >
                                {p.roomStatus === "FULL"
                                    ? "만실"
                                    : p.roomStatus === "AVAILABLE"
                                        ? "가능"
                                        : "점검중"}
                            </td>
                            <td className="p-2 border text-center">
                                <button
                                    onClick={() => {
                                        setSelectedPatient(p);
                                        setModalOpen(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
                                >
                                    처방하기
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedPatient(p);
                                        setHistoryModalOpen(true);
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs"
                                >
                                    처방내역
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* ✅ 처방 모달 */}
            <PrescriptionModal
                visible={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                patient={selectedPatient}
            />
            <PrescriptionHistoryModal
                open={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                patient={selectedPatient}
            />
        </div>
    );
}
