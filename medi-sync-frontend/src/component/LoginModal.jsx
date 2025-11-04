import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import useModal from "./ModalContext";

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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 요청 방지

  // isOpen 상태가 변경될 때마다 실행되며 인풋값을 초기화
  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setPassword("");
      setMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 🔑 로그인 처리 로직
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // 중복 제출 방지
    setIsSubmitting(true);
    setMessage("로그인 요청 중...");

    const LOGIN_API_URL = "http://localhost:8080/api/users/login";
    let response;
    try {
      response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login_id: username,
          password: password,
        }),
      });

      if (response.ok) {
        // HTTP 상태 코드 200-299 성공
        const data = await response.json().catch(() => ({})); // 백엔드 응답 데이터 (예: JWT 토큰, 사용자 정보)

        // 🔑 로그인 성공 처리: 토큰 저장 및 전역 상태 업데이트
        // 실제 토큰을 백엔드 응답(data)에서 추출해야 하며 아래는 가상 토큰 사용
        const token = data.token || "mock-jwt-token-12345";
        setMessage("로그인 성공! 환영합니다.");

        setTimeout(() => {
          handleLoginSuccess(token); // 토큰 저장 및 isLoggedIn=true 설정
          onClose(); // 모달 닫기
        }, 800);
      } else {
        // HTTP 상태 코드 4xx, 5xx 에러
        const errorData = await response.json().catch(() => ({}));
        // 백엔드에서 보낸 에러 메시지가 있다면 사용
        setMessage(
          errorData.message || "로그인에 실패했습니다. ID와 PW를 확인해 주세요."
        );
        // 실패 시 isSubmitting 해제
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("로그인 중 네트워크 오류 발생:", error);
      setMessage("서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false); // 제출 상태 해제
    }
  };

  // OAuth2 로그인 함수 (미구현)
  const handleSocialLogin = (provider) => {
    // Spring Security OAuth2 시작 경로로 강제 이동합니다.
    window.location.href = `http://localhost:3000/${provider}`;
  };

  // 회원가입 링크 클릭 시 로그인 모달을 닫고 회원가입 모달을 열기
  const handleRegisterClick = (e) => {
    e.preventDefault();
    onClose(); // 로그인 모달 닫기
    openRegisterModal(); // 회원가입 모달 열기
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex justify-center items-center backdrop-blur-sm p-4 transition-opacity duration-300"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <style>{socialStyles}</style> {/* 소셜 버튼 색상 적용 */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto p-8 transform transition-all duration-300 scale-100 opacity-100 font-pretendard relative"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 배경 닫힘 방지
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          aria-label="닫기"
        >
          <X size={24} />
        </button>
        <div className="text-center mb-8 mt-4">
          <div className="text-3xl font-extrabold text-blue-600 mb-1 tracking-tight">
            MediSync
          </div>
          <p className="text-gray-500 mt-1">통합 병원 업무 시스템</p>
        </div>

        {/* ID/PW 인풋 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1 pl-2"
            >
              아이디
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
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
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              placeholder="비밀번호 입력"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            disabled={isSubmitting} // 제출 중 버튼 비활성화
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
        {/* 메시지 박스 */}
        {message && (
          <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm">
            {message}
          </div>
        )}
        {/* 구분선 */}
        <div className="relative flex justify-center items-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative bg-white px-3 text-sm text-gray-500">
            또는 간편 로그인
          </div>
        </div>
        {/* 소셜 로그인 버튼 */}
        <div className="space-y-3">
          {/* 네이버 로그인 */}
          <button
            onClick={() => handleSocialLogin("naver")}
            className="flex items-center justify-center w-full py-3 naver-bg text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200"
          >
            <span className="ml-2">네이버로 시작하기</span>
          </button>

          {/* 카카오 로그인 */}
          <button
            onClick={() => handleSocialLogin("kakao")}
            className="flex items-center justify-center w-full py-3 kakao-bg text-gray-900 font-semibold rounded-lg shadow-md hover:opacity-80 transition duration-200"
          >
            <span className="ml-2">카카오로 시작하기</span>
          </button>
        </div>

        {/* 기타 링크 */}
        <div className="mt-6 text-center text-sm">
          <a
            href="#"
            onClick={handleRegisterClick}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            회원가입
          </a>
          <span className="text-gray-400 ml-4 mr-4">|</span>
          <a
            href="/find"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            아이디/비밀번호 찾기
          </a>
        </div>
      </div>
    </div>
  );
}
