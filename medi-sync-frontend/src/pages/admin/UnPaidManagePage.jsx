import React, { useEffect, useState } from "react";
import axios from "axios";
import FinanceHeader from "../../component/FinanceHeader";

export default function UnpaidManagePage() {
    const [list, setList] = useState([]);
    const [detail, setDetail] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const fetchList = async () => {
        try {
            const res = await axios.get("http://192.168.0.24:8080/api/finance/unpaid/list");
            setList(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDetail = async (patientId) => {
        try {
            const res = await axios.get(`http://192.168.0.24:8080/api/finance/unpaid/${patientId}`);
            setDetail(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    const onSelect = (p) => {
        setSelectedPatient(p);
        fetchDetail(p.patientId);
    };

    const sendUnpaidEmail = async (patientId) => {
        if(!patientId) return;

        try{
            const res = await axios.post(`http://192.168.0.24:8080/api/finance/unpaid/notify/${patientId}`);
            alert("미납 안내 이메일 발송했습니다.")
        } catch (e) {
            console.error(e);
            alert("이메일 발송 실패");
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <FinanceHeader/>

            <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">
                <h1 className="text-2xl font-bold mb-8">미납 환자 관리</h1>

                {/* ▣ 미납 환자 리스트 */}
                <div className="bg-white rounded-xl shadow p-6 mb-10">
                    <h2 className="text-lg font-bold mb-4">미납 환자 목록</h2>

                    <table className="w-full border-collapse text-center text-sm">
                        <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-3">환자명</th>
                            <th className="p-3">미납 금액</th>
                            <th className="p-3">미납 건수</th>
                            <th className="p-3">관리</th>
                        </tr>
                        </thead>

                        <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-6 text-gray-400">
                                    미납 환자가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            list.map((p) => (
                                <tr key={p.patientId} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{p.patientName}</td>
                                    <td className="p-3 text-red-600 font-semibold">
                                        {Math.floor(p.unpaidTotal).toLocaleString()} 원
                                    </td>
                                    <td className="p-3">{p.countTx} 건</td>
                                    <td className="p-3">
                                        <button
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                            onClick={() => onSelect(p)}
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

                {/* ▣ 상세 내역 */}
                {selectedPatient && (
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-bold mb-4">
                            {selectedPatient.patientName} — 미납 상세 내역
                        </h2>

                        <table className="w-full border-collapse text-center text-sm mb-4">
                            <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-3">날짜</th>
                                <th className="p-3">설명</th>
                                <th className="p-3">금액</th>
                                <th className="p-3">상태</th>
                            </tr>
                            </thead>
                            <tbody>
                            {detail.map((d) => (
                                <tr key={d.txId} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{d.createdAt}</td>
                                    <td className="p-3">{d.description}</td>
                                    <td className="p-3 text-red-600 font-semibold">
                                        {Math.floor(d.amount).toLocaleString()} 원
                                    </td>
                                    <td className="p-3">{d.status}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-yellow-500 text-white rounded"
                                    onClick={() => sendUnpaidEmail(selectedPatient.patientId)}
                            >
                                알림 보내기
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
