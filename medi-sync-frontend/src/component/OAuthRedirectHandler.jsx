import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useModal from "./ModalContext";

/**
 * OAuth (네이버/카카오 등) 로그인이 성공한 후,
 * 백엔드에서 리다이렉트된 URL을 처리하는 전용 컴포넌트입니다.
 * URL에서 토큰을 추출하여 Context에 저장하고 메인 페이지로 이동시킵니다.
 */

export default function OAuthRedirectHandler() {
  const location = useLocation(); // 현재 URL 정보를 가져옵니다.
  const navigate = useNavigate(); // 페이지 이동을 위해 사용합니다.

  const { handleLoginSuccess } = useModal();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const loginStatus = params.get("login");

    if (token && loginStatus === "success") {
      // 🔑 토큰이 존재하면, ModalProvider의 로그인 성공 함수를 호출합니다.
      // 이 함수는 (ModalProvider.jsx에 정의된 대로)
      // 1. 토큰을 localStorage에 저장하고,
      // 2. isLoggedIn 상태를 true로 바꾸고,
      // 3. 메인 페이지('/')로 이동시킵니다.
      handleLoginSuccess(token);
    } else {
      // 토큰이 없거나 로그인이 실패한 경우
      console.error(
        "OAuth 로그인 실패: 토큰이 없거나 상태가 success가 아닙니다."
      );
      alert("로그인에 실패했습니다. 메인 페이지로 이동합니다.");
      navigate("/", { replace: true }); // 메인 페이지로 이동
    }

    // 이 컴포넌트가 마운트될 때 딱 한 번만 실행되도록 설정
  }, [location, handleLoginSuccess, navigate]);

  // 사용자에게는 이 페이지만 잠시 보입니다.
  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-xl">
        로그인 정보를 처리 중입니다. 잠시만 기다려 주세요...
      </p>
    </div>
  );
}
