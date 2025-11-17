import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const orderId = params.get("orderId");
    const amountParam = params.get("amount");

    const [amount, setAmount] = useState(0);

    useEffect(() => {
        // 1) URL 파라미터에 amount 있으면 그걸 우선 사용
        if (amountParam) {
            setAmount(Number(amountParam));
            return;
        }

        // 2) 그래도 없으면 백엔드 조회
        if (orderId) {
            axios
                .get(`http://192.168.0.24:8080/api/payment/status/${orderId}`)
                .then((res) => setAmount(res.data.amount))
                .catch(() => setAmount(0));
        }
    }, []);

    return (
        <div className="flex flex-col items-center mt-10">
            <h2 className="text-green-700 text-xl font-bold mb-4">
                결제가 완료되었습니다
            </h2>

            <p className="text-2xl font-bold mb-4">
                {Number(amount).toLocaleString()}원
            </p>

            <button
                onClick={() => navigate("/user/mypage")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
                확인
            </button>
        </div>
    );
}
