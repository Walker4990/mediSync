import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function TossCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const orderId = params.get("orderId");
        const paymentKey = params.get("paymentKey");
        const message = params.get("message");

        // Toss redirect에서 paymentKey 없으면 실패
        if (!paymentKey) {
            alert("결제 실패");
            navigate("/user/mypage/payment");
            return;
        }

        // 성공 → 서버에 상태 확인 요청
        axios.get(`http://192.168.0.24:8080/api/payment/status/${orderId}`)
            .then(res => {
                if (res.data.status === "SUCCESS") {
                    alert("결제 성공");
                } else {
                    alert("결제 실패");
                }
            })
            .catch(() => {
                alert("결제 상태 확인 실패");
            })
            .finally(() => {
                navigate("/user/mypage/payment");
            });
    }, []);

    return <div>결제 처리 중...</div>;
}
