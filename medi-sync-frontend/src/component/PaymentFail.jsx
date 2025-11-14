import React from "react";

export default function PaymentFail({ message }) {
    return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600">결제가 실패했습니다</h2>
            <p className="mt-4 text-lg">{message}</p>

            <button
                onClick={() => (window.location.href = "/mypage")}
                className="mt-6 px-4 py-2 bg-gray-600 text-white rounded"
            >
                돌아가기
            </button>
        </div>
    );
}