import React, {useEffect, useState} from "react"
import AdminHeader from "../../component/AdminHeader";
import axios from "axios";
import {Eye} from "lucide-react";
import RefundRequestDetailModal from "../../component/RefundRequestDetailModal";
import FinanceHeader from "../../component/FinanceHeader";

export default function AdminRefundPage(){
    const [refunds, setRefunds] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedRefund, setSelectedRefund] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    const fetchRefunds = async () => {
        try{
            setLoading(true);
            const res = await axios.get("http://192.168.0.24:8080/api/refund/list");
            setRefunds(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRefunds();
    }, [])

    const openDetail = (refund) => {
        setSelectedRefund(refund);
        setModalOpen(true);
    }
    const closeDetail = () => {
        setSelectedRefund(null)
        setModalOpen(false);
    }

    const handleApprove = async (refundId) => {
        if(!window.confirm("이 환불 요청을 승인하시겠습니까?")) return;

        try{
            await axios.post(`http://192.168.0.24:8080/api/refund/approve/${refundId}`)
                alert("환불이 승인되었습니다.");
                closeDetail();
                fetchRefunds();
        } catch(err) {
            console.log(err);
        }
    }
    const handleReject = async (refundId) => {
        if (!window.confirm("이 환불 요청을 거절하겠습니까?")) return;

        try{
            await axios.post(`http://192.168.0.24:8080/api/refund/reject/${refundId}`)
            alert("환불이 거절되었습니다.")
            closeDetail();
            fetchRefunds();
        } catch(err) {
            console.log(err);
        }
    }

    const renderStatusBadge = (status) => {
        const base = "px-2 py-1 rounded-full text-xs font-semibold";
        switch (status) {
            case "PENDING":
                return <span className={`${base} bg-yellow-100 text-yellow-800`}>대기</span>;
            case "APPROVED":
                return <span className={`${base} bg-blue-100 text-blue-800`}>승인됨</span>;
            case "COMPLETED":
                return <span className={`${base} bg-green-100 text-green-800`}>완료</span>;
            case "REJECTED":
                return <span className={`${base} bg-red-100 text-red-800`}>거절</span>;
            default:
                return <span className={`${base} bg-gray-100 text-gray-600`}>{status}</span>;
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            <FinanceHeader />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">환불 요청 관리</h2>
                    <button
                        onClick={fetchRefunds}
                        className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg border hover:bg-gray-200"
                    >
                        새로고침
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-4 border-b flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                            총 {refunds.length}건의 환불 요청
                        </span>
                        {loading && (
                            <span className="text-xs text-gray-500">불러오는 중...</span>
                        )}
                    </div>

                    <table className="w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">주문번호</th>
                            <th className="p-3">환자 ID</th>
                            <th className="p-3">금액</th>
                            <th className="p-3">상태</th>
                            <th className="p-3">요청일</th>
                            <th className="p-3">액션</th>
                        </tr>
                        </thead>
                        <tbody>
                        {refunds.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="p-6 text-gray-400">
                                    환불 요청이 없습니다.
                                </td>
                            </tr>
                        )}

                        {refunds.map((r) => (
                            <tr
                                key={r.refundId}
                                className="border-b hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-3">{r.refundId}</td>
                                <td className="p-3 font-mono text-xs">{r.orderId}</td>
                                <td className="p-3">{r.patientId}</td>
                                <td className="p-3">
                                    {Math.floor(Number(r.amount)).toLocaleString("ko-KR")}원
                                </td>
                                <td className="p-3">
                                    {renderStatusBadge(r.status)}
                                </td>
                                <td className="p-3">
                                    {r.createdAt?.replace("T", " ") ?? "-"}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => openDetail(r)}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                                    >
                                        <Eye size={14} />
                                        상세
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 상세 모달 */}
            {modalOpen && selectedRefund && (
                <RefundRequestDetailModal
                    refund={selectedRefund}
                    onClose={closeDetail}
                    onApprove={() => handleApprove(selectedRefund.refundId)}
                    onReject={() => handleReject(selectedRefund.refundId)}
                />
            )}
        </div>
    );
}