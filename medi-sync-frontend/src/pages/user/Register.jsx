import React, { useState } from "react";
import axios from "axios";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        userId: "",
        password: "",
        residentFront: "",
        residentBack: "",
        phone: "",
        address: "",
        consentInsurance: false,
    });

    // 입력값 변경 처리
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // 숫자만 허용할 필드 목록
        const numericFields = ["residentFront", "residentBack", "phone"];

        setForm({
            ...form,
            [name]:
                type === "checkbox"
                    ? checked
                    : numericFields.includes(name)
                        ? value.replace(/\D/g, "") // 숫자만
                        : value, // 일반 문자 입력 허용
        });
    };


    // 제출 시 residentNo 합쳐서 전송
    const handleSubmit = async (e) => {
        e.preventDefault();

        const residentNo = `${form.residentFront}-${form.residentBack}`;

        const dataToSend = {
            name: form.name,
            residentNo,
            phone: form.phone,
            address: form.address,
            consentInsurance: form.consentInsurance,
            userId: form.userId,
            password: form.password,
        };

        try {
            const res = await axios.post("http://192.168.0.24:8080/api/patients/register", dataToSend);

            if (res.data.success) {
                alert(res.data.message); // ✅ 서버에서 내려준 메시지
                setForm({
                    name: "",
                    userId: "",
                    password: "",
                    residentFront: "",
                    residentBack: "",
                    phone: "",
                    address: "",
                    consentInsurance: false,
                });
            } else {
                alert("⚠️ 등록 실패: " + res.data.message);
            }
        } catch (err) {
            alert(" 네트워크 오류: " + err.message);
        }
    }

        return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 font-pretendard">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg"
            >
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
                    환자 등록
                </h2>

                {/* 이름 */}
                <label className="block mb-4">
                    <span className="block text-gray-700 mb-1">이름</span>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"

                    />
                </label>

                {/* 주민등록번호 */}
                <label className="block mb-4">
                    <span className="block text-gray-700 mb-1">주민등록번호</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            name="residentFront"
                            maxLength="6"
                            placeholder="앞자리 (YYMMDD)"
                            value={form.residentFront}
                            onChange={handleChange}
                            className="w-1/2 border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                            required
                        />
                        <span>-</span>
                        <input
                            type="password"
                            name="residentBack"
                            maxLength="7"
                            placeholder="뒷자리"
                            value={form.residentBack}
                            onChange={handleChange}
                            className="w-1/2 border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>
                </label>

                {/* 아이디 */}
                <label className="block mb-4">
                    <span className="block text-gray-700 mb-1">아이디</span>
                    <input
                        type="text"
                        name="userId"
                        value={form.userId}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </label>

                {/* 비밀번호 */}
                <label className="block mb-4">
                    <span className="block text-gray-700 mb-1">비밀번호</span>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </label>
                
                {/* 전화번호 */}
                <label className="block mb-4">
                    <span className="block text-gray-700 mb-1">전화번호</span>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="010-0000-0000"
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </label>

                {/* 주소 */}
                <label className="block mb-4">
                    <span className="block text-gray-700 mb-1">주소</span>
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                    />
                </label>

                {/* 보험자동청구 동의 */}
                <label className="flex items-center mb-6">
                    <input
                        type="checkbox"
                        name="consentInsurance"
                        checked={form.consentInsurance}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    보험자동청구에 동의합니다.
                </label>

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold"
                >
                    등록하기
                </button>
            </form>
        </div>
    );
}
