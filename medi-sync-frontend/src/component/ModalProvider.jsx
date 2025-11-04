import React, { useState, useMemo } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { ModalContext } from "./ModalContext";

export default function ModalProvider({ children }) {
  // 3. 인증상태 관리 추가
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("authToken")
  );

  const handleLoginSuccess = (token) => {
    // 실제 JWT 토큰을 저장
    localStorage.setItem("authToken", token);
    setIsLoggedIn(true);
    // 로그인 모달 닫기 로직은 LoginModal 컴포넌트에서 setTimeout으로 처리
  };

  const handleLogout = async () => {
    const LOGOUT_API_URL = "http://localhost:8080/api/users/logout";
    console.log("로그아웃 요청 중...");

    try {
      await fetch(LOGOUT_API_URL, { method: "POST" });
      console.log("백엔드 로그아웃 요청 처리됨.");
    } catch (error) {
      console.error(
        "로그아웃 중 네트워크 오류 발생 (프론트엔드 상태 정리):",
        error
      );
    } finally {
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
      console.log("로그아웃 완료. 상태 업데이트됨.");
    }
  };

  // 1. 회원가입 모달
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // 2. 로그인 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const contextValue = useMemo(
    () => ({
      // 회원가입 모달
      isModalOpen: isRegisterModalOpen,
      openModal: openRegisterModal,
      closeModal: closeRegisterModal,

      // 로그인 모달
      isLoginModalOpen,
      openLoginModal: () => {
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
      },
      closeLoginModal,

      // 인증 상태
      isLoggedIn,
      handleLoginSuccess,
      handleLogout,
    }),
    [isRegisterModalOpen, isLoginModalOpen, isLoggedIn]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {/* Modal 컴포넌트 자체를 Provider 내부에서 렌더링하여 전역적으로 존재하도록 함 */}
      <LoginModal />
      <RegisterModal />
    </ModalContext.Provider>
  );
}
