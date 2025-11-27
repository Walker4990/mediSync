import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";

export default function UnpaidAlert(){
    const [amount, setAmount] = useState(null);
    const navigate = useNavigate();
    const [dontShowToday, setDontShowToday] = useState(false);

    useEffect(() => {
        const hideUntil = localStorage.getItem("hideUnpaidPopupUntil");
        const today = new Date().toISOString().slice(0,10);

        if (hideUntil === today) {
            console.log("오늘 팝업 차단됨")
            return;
        }


        const token = localStorage.getItem("token");
        if(!token) return;

        const decoded = token ? jwtDecode(token) : null;
        const patientId = decoded.userId;
        axios
            .get(`http://192.168.0.24:8080/api/finance/unpaid/alert/${patientId}`)
            .then((res) => {
                console.log("백엔드 응답:", res.data);
                if (res.data.totalUnpaid > 0) {
                    setAmount(res.data.totalUnpaid);
                }
            })
            .catch((err) => console.log("미납 조회 실패", err));
    }, []);

    const closePopup = () => {
        if(dontShowToday){
            const today = new Date().toISOString().slice(0,10);
            localStorage.setItem("hideUnpaidPopupUntil", today);
        }
        setAmount(null)
    }


    if (amount === null) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[9999]">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-96 text-center animate-fadeIn relative border border-gray-200">

                {/* 🔥 팝업창 스타일의 X버튼 */}
                <button
                    onClick={closePopup}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold mb-3 text-red-600">미납 안내</h2>

                <p className="text-gray-800 mb-6 leading-relaxed">
                    현재 미납금이<br />
                    <span className="text-red-600 font-bold text-3xl">
                        {amount.toLocaleString()}원
                    </span>
                    있습니다.
                </p>

                <button
                    onClick={() => {
                        setAmount(null);
                        navigate("/payment");
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg mb-3 hover:bg-blue-700"
                >
                    바로 결제하기
                </button>

                <button
                    onClick={closePopup}
                    className="w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 mb-4"
                >
                    나중에 하기
                </button>

                {/* 🔥 오늘 그만보기 */}
                <label className="flex items-center justify-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dontShowToday}
                        onChange={() => setDontShowToday(!dontShowToday)}
                    />
                    오늘 하루 보지 않기
                </label>
            </div>
        </div>
    );
}