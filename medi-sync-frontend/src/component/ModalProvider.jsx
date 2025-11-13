import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { ModalContext } from "./ModalContext";

export default function ModalProvider({ children }) {
  const navigate = useNavigate();
  // 인증상태 관리 추가
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [redirectPath, setRedirectPath] = useState("/");

  const handleLoginSuccess = (token) => {
    // 실제 JWT 토큰을 저장
    localStorage.setItem("token", token);
    setIsLoggedIn(true);

    // 로그인 모달 닫기 (LoginModal 내부에서 setTimeout 대신 여기서 바로 호출)
    setIsLoginModalOpen(false);

    // 리디렉션 로직 실행
    const finalPath = redirectPath && redirectPath !== "/" ? redirectPath : "/";
    navigate(finalPath, { replace: true });

    // 경로 사용 후 초기화
    setRedirectPath("/");
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
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      console.log("로그아웃 완료. 상태 업데이트됨.");
      window.location.href = "/";
    }
  };

  // 회원가입 모달
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // 로그인 모달
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

      // 리디렉션 상태
      setRedirectPath,
    }),
    [isRegisterModalOpen, isLoginModalOpen, isLoggedIn, redirectPath]
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
