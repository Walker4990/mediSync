import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";
import useModal from "./ModalContext";
import { toast } from "react-toastify";

const socialStyles = `
    .naver-bg { background-color: #03c75a; }
    .kakao-bg { background-color: #fee500; color: #191919; }
`;

export default function LoginModal() {
    const {
        isLoginModalOpen: isOpen,
        closeLoginModal: onClose,
        openModal: openRegisterModal,
        handleLoginSuccess,
    } = useModal();

    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const API_URI = "http://localhost:8080/api/users/login";

    useEffect(() => {
        if (isOpen) {
            setLoginId("");
            setPassword("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await axios.post(API_URI, {
                login_id: loginId,
                password: password,
            });

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user_data", JSON.stringify(res.data.user));
                localStorage.setItem("loginTime", Date.now().toString());
                toast.success("로그인 성공!");
                handleLoginSuccess(res.data.token);
                onClose();
                window.location.reload();
            } else {
                toast.error(res.data.message || "아이디 또는 비밀번호를 확인해주세요.");
            }
        } catch (err) {
            toast.error("서버 연결에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = (provider) => {
        const state = "RANDOM_UNIQUE_STRING";
        sessionStorage.setItem("oauth_state", state);

        if (provider === "naver") {
            const clientId = "W8L6n2yDe6eGoosEf7AD";
            const redirectUri = "http://localhost:8080/api/users/naver/callback";
            window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
        } else if (provider === "kakao") {
            const kakaoApiKey = "995feac82707da5c2f69f2b81614024d";
            const redirectLoginUri = "http://localhost:3000/authLoginKakao";
            window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoApiKey}&redirect_uri=${redirectLoginUri}&response_type=code`;
        }
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        onClose();
        openRegisterModal();
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex justify-center items-center backdrop-blur-sm p-4"
            onClick={onClose}  // 배경 클릭 시 닫힘
        >
            <style>{socialStyles}</style>

            {/* 🎯 수정된 핵심: 모달 전체를 감싸는 div에 stopPropagation 적용 */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto p-8 font-pretendard relative"
                onClick={(e) => e.stopPropagation()}   // 내부 클릭 시 닫힘 방지
            >
                {/* 닫기 버튼 */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8 mt-4">
                    <div className="text-3xl font-extrabold text-blue-600 mb-1 tracking-tight">
                        MediSync
                    </div>
                    <p className="text-gray-500 mt-1">통합 병원 업무 시스템</p>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="loginId"
                            className="block text-sm font-medium text-gray-700 mb-1 pl-2"
                        >
                            아이디
                        </label>
                        <input
                            type="text"
                            id="loginId"
                            required
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500"
                            placeholder="사용자 ID 입력"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1 pl-2"
                        >
                            비밀번호
                        </label>
                        <input
                            type="password"
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500"
                            placeholder="비밀번호 입력"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                {/* 구분선 */}
                <div className="relative flex justify-center items-center my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative bg-white px-3 text-sm text-gray-500">
                        또는 간편 로그인
                    </div>
                </div>

                {/* 소셜 로그인 */}
                <div className="space-y-3">
                    <button
                        onClick={() => handleSocialLogin("naver")}
                        className="flex items-center justify-center w-full py-3 naver-bg text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
                    >
                        네이버로 시작하기
                    </button>

                    <button
                        onClick={() => handleSocialLogin("kakao")}
                        className="flex items-center justify-center w-full py-3 kakao-bg text-gray-900 font-semibold rounded-lg shadow-md hover:opacity-80"
                    >
                        카카오로 시작하기
                    </button>
                </div>

                {/* 회원가입 / 찾기 */}
                <div className="mt-6 text-center text-sm">
                    <a
                        href="#"
                        onClick={handleRegisterClick}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        회원가입
                    </a>
                    <span className="text-gray-400 mx-4">|</span>
                    <a
                        href="/findAccount"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        아이디/비밀번호 찾기
                    </a>
                </div>
            </div>
        </div>
    );
}
