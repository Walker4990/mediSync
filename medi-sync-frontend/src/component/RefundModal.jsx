import React from "react";

export default function RefundModal({visible, amount, reason, setReason, onCancel, onSubmit}) {
    if(!visible) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h3 className="text-lg font-bold mb-3">환불 신청</h3>
                
                <p className="mb-2 text-gray-700">
                    환불 금액 : {Math.floor(amount).toLocaleString()}원
                </p>
                
                <textarea
                    className="w-full p-2 border rounded mb-3"
                    placeholder="환불 사유를 입력하세요"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)} 
                />
                
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 bg-gray-300 rounded"
                        >취소
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                        신청하기
                    </button>
                </div>
            </div>
        </div>
    )
}
