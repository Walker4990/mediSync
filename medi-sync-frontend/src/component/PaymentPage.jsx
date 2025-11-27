import React, { useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFail from "./PaymentFail";
import {Receipt} from "lucide-react";
import RefundModal from "./RefundModal";

export default function PaymentPage() {
    const [payments, setPayments] = React.useState([]);
    const [unpaid, setUnpaid] = React.useState(null);
    const [unpaidList, setUnpaidList] = React.useState([]);
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const patientId = decoded?.userId;

    const [showSuccess, setShowSuccess] = React.useState(null);
    const [showFail, setShowFail] = React.useState(null);
    const [refundModal, setRefundModal] = React.useState({
        visible: false, orderId: null, amount: 0, reason: ""
    });
    const [page, setPage] = React.useState(1);
    const size = 10
    const visiblePayments = payments.slice(0, page * size);
    const totalPages = Math.ceil(payments.length / size);
    const fetchPayments = async () => {
        const res = await axios.get(
            `http://192.168.0.24:8080/api/payment/history/${patientId}`
        );
        setPayments(res.data.history || []);
        setUnpaid(res.data.unpaid || null);
        setUnpaidList(res.data.unpaidList || []);
    };

    useEffect(() => {
        fetchPayments();
    }, [patientId]);


    const handlePay = async () => {
        try {
            const prepare = await axios.post(
                "http://192.168.0.24:8080/api/payment/prepare",
                { patientId, amount: unpaid }
            );

            const { orderId } = prepare.data;

            const tossPayments = window.TossPayments(
                "test_ck_ZLKGPx4M3M12wnYqg5lo3BaWypv1"
            );

            tossPayments.requestPayment("카드", {
                orderId,
                amount: unpaid,
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

    const submitRefund = async () => {
        try{
            await axios.post("http://192.168.0.24:8080/api/refund/request", {
                orderId: refundModal.orderId,
                amount: refundModal.amount,
                reason: refundModal.reason,
                patientId: patientId,
            })
            alert("환불 요청이 접수되었습니다.")

            setRefundModal({
                visible: false,
                orderId: null,
                amount: 0,
                reason: ""
            });

            fetchPayments();
        } catch (e) {
            alert("오류 발생")
            console.log(e)
        }
    }

    return (
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">수납 정보</h3>

            {unpaid ? (
                <div className="p-4 bg-red-50 rounded-lg border mb-6">
                    <p className="text-red-700 font-semibold">
                        미납금 : {unpaid?.toLocaleString()}원
                    </p>

                    {/* 🔥 미납 내역 리스트 추가 */}
                    {unpaidList.length > 0 && (
                        <div className="mt-3 bg-white p-3 rounded border">
                            <p className="font-semibold mb-2">미납 상세 내역</p>
                            <ul className="list-disc ml-5">
                                {unpaidList.map((item) => (
                                    <li key={item.txId}>
                                        {item.description} — {Math.floor(item.amount).toLocaleString()}원
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={handlePay}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                <table className="w-full text-center border-collapse">
                    <thead className="border-b bg-gray-50">
                    <tr>
                        <th className="p-3 font-semibold text-gray-700">번호</th>
                        <th className="p-3 font-semibold text-gray-700">일시</th>
                        <th className="p-3 font-semibold text-gray-700">금액</th>
                        <th className="p-3 font-semibold text-gray-700">상태</th>
                        <th className="p-3 font-semibold text-gray-700">기타</th>
                    </tr>
                    </thead>
                    <tbody>
                    {visiblePayments.map((p) => {

                        return (
                            <tr
                                key={p.txId}
                                className="border-b hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-3 align-middle">{p.txId}</td>
                                <td className="p-3 align-middle">{p.createdAt}</td>
                                <td className="p-3 align-middle">
                                    {Math.floor(Number(p.amount)).toLocaleString("ko-KR")}원
                                </td>
                                <td className="p-3 align-middle">{p.status}</td>
                                <td className="p-3 align-middle">
                                    <div className="flex items-center justify-center gap-3">

                                        {/* 영수증 */}
                                        {p.status === "COMPLETED" ? (
                                            <Receipt
                                                onClick={() =>
                                                    (window.location.href =
                                                        `http://192.168.0.24:8080/api/payment/receipt/${p.orderId}`)
                                                }
                                                className="cursor-pointer text-green-600 hover:text-green-700"
                                                size={22}
                                            />
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}

                                        {/* 🔥 환불 상태에 따라 UI 변경 */}
                                        {p.status === "COMPLETED" && (
                                            p.refundStatus === "PENDING" ? (
                                                <span className="text-xs text-gray-500 font-semibold">
                환불 신청 완료
            </span>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setRefundModal({
                                                            visible: true,
                                                            orderId: p.orderId,
                                                            amount: p.amount,
                                                            reason: ""
                                                        })
                                                    }
                                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                                                >
                                                    환불
                                                </button>
                                            )
                                        )}

                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                {page < totalPages && (
                    <button
                        onClick={() => setPage(page + 1)}
                        className="
            w-full py-3
            flex items-center justify-center
            bg-blue-50 hover:bg-blue-100
            text-blue-700 font-semibold
            border-t border-gray-200
            transition
        "
                    >
                        +
                    </button>
                )}
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

            <RefundModal
                orderId={refundModal.orderId}
                visible={refundModal.visible}
                amount={refundModal.amount}
                reason={refundModal.reason}
                setReason={(val) => setRefundModal({ ...refundModal, reason: val })}
                onCancel={() =>
                    setRefundModal({
                        visible: false,
                        orderId: null,
                        amount: 0,
                        reason: ""
                    })
                }
                onSubmit={submitRefund}
            />
        </div>
    );
}
