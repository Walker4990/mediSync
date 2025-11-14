import React, { useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFail from "./PaymentFail";

export default function PaymentPage() {
    const [payments, setPayments] = React.useState([]);
    const [unpaid, setUnpaid] = React.useState(null);

    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const patientId = decoded?.userId;

    const [showSuccess, setShowSuccess] = React.useState(null);
    const [showFail, setShowFail] = React.useState(null);

    const fetchPayments = async () => {
        const res = await axios.get(
            `http://192.168.0.24:8080/api/payment/history/${patientId}`
        );
        setPayments(res.data.history || []);
        setUnpaid(res.data.unpaid || null);
    };

    useEffect(() => {
        fetchPayments();
    }, [patientId]);

    const handlePay = async () => {
        try {
            const prepare = await axios.post(
                "http://192.168.0.24:8080/api/payment/prepare",
                { patientId, amount: unpaid.amount }
            );

            const { orderId } = prepare.data;

            const tossPayments = window.TossPayments(
                "test_ck_ZLKGPx4M3M12wnYqg5lo3BaWypv1"
            );

            tossPayments.requestPayment("카드", {
                orderId,
                amount: unpaid.amount,
                orderName: "병원 진료비",
                flowMode: "CHECKOUT",
                windowTarget: "popup",

                // 🔥 여기만 수정 — successUrl에 orderId 넘김
                successUrl:
                    window.location.origin + `/payment/success?orderId=${orderId}`,
                failUrl: window.location.origin + "/payment/fail",
            });

        } catch (e) {
            setShowFail({ message: "결제 실행 중 오류" });
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">보험 / 수납 정보</h3>

            {unpaid ? (
                <div className="p-4 bg-red-50 rounded-lg border mb-6">
                    <p className="text-red-700 font-semibold">
                        미납금 : {unpaid.amount?.toLocaleString()}원
                    </p>
                    <button
                        onClick={handlePay}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        결제하기
                    </button>
                </div>
            ) : (
                <div className="p-4 bg-green-50 rounded-lg border mb-6">
                    <p className="text-green-700 font-semibold">
                        현재 미납금이 없습니다.
                    </p>
                </div>
            )}

            <h4 className="text-lg font-semibold mb-2">내 결제 내역</h4>
            <div className="bg-white rounded-lg shadow">
                <table className="w-full text-left">
                    <thead className="border-b">
                    <tr>
                        <th className="p-3">일시</th>
                        <th className="p-3">금액</th>
                        <th className="p-3">상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {payments.map((p) => (
                        <tr key={p.txId} className="border-b">
                            <td className="p-3">{p.createdAt}</td>
                            <td className="p-3">
                                {Math.floor(Number(p.amount)).toLocaleString("ko-KR")}원
                            </td>
                            <td className="p-3">{p.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showSuccess && (
                <PaymentSuccess
                    amount={showSuccess.amount}
                    onClose={() => setShowSuccess(null)}
                />
            )}

            {showFail && (
                <PaymentFail
                    message={showFail.message}
                    onClose={() => setShowFail(null)}
                />
            )}
        </div>
    );
}
