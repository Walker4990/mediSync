import React, { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import ModalContext from "./ModalContext";

export default function ModalProvider({ children }) {
  // 1. 회원가입 모달
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // 2. 로그인 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const contextValue = {
    // 회원가입 모달
    isModalOpen: isRegisterModalOpen,
    openModal: openRegisterModal,
    closeModal: closeRegisterModal,
    // 로그인 모달
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {/* Modal 컴포넌트 자체를 Provider 내부에서 렌더링하여 전역적으로 존재하도록 함 */}
      <LoginModal />
      <RegisterModal />
    </ModalContext.Provider>
  );
}
