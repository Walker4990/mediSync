import React from "react";
import {CheckCircle2, XCircle, X} from "lucide-react";

export default function RefundRequestDetailModal({
    refund, onClose, onApprove, onReject
    }) {
    if (!refund) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h3 className="text-lg font-bold mb-4 text-gray-800">
                    환불 요청 상세
                </h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">환불 ID</span>
                        <span className="font-mono">{refund.refundId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">주문번호</span>
                        <span className="font-mono text-xs">{refund.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">환자 ID</span>
                        <span>{refund.patientId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">금액</span>
                        <span className="font-semibold">
                            {Math.floor(Number(refund.amount)).toLocaleString("ko-KR")}원
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">요청 상태</span>
                        <span>{refund.status}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block mb-1">환불 사유</span>
                        <div className="border rounded-md p-2 bg-gray-50 min-h-[60px] text-sm">
                            {refund.reason || "사유 없음"}
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">요청일</span>
                        <span>{refund.createdAt?.replace("T", " ") ?? "-"}</span>
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        닫기
                    </button>

                    {refund.status === "PENDING" && (
                        <>
                            <button
                                onClick={onReject}
                                className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 inline-flex items-center gap-1"
                            >
                                <XCircle size={16} />
                                거절
                            </button>
                            <button
                                onClick={onApprove}
                                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-1"
                            >
                                <CheckCircle2 size={16} />
                                승인
                            </button>
                        </>
                    )}

                    {refund.status !== "PENDING" && (
                        <span className="text-xs text-gray-500 self-center">
                            이미 처리된 요청입니다.
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}