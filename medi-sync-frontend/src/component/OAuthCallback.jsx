import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useModal from "./ModalContext";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleLoginSuccess } = useModal(); // ModalContext에서 함수 가져오기

  useEffect(() => {
    // 1. URL에서 'token' 파라미터를 가져옵니다.
    const token = searchParams.get("token");
    // 2. URL에서 'error' 파라미터를 가져옵니다.
    const error = searchParams.get("error");

    if (token) {
      // 3. 토큰이 있으면, ModalProvider의 함수를 호출하여 로그인 처리
      handleLoginSuccess(token);
      // 4. 홈으로 이동
      navigate("/");
    } else if (error) {
      // 5. 에러가 있으면 알리고 홈으로 이동
      alert("소셜 로그인에 실패했습니다: " + error);
      navigate("/");
    } else {
      // 6. 비정상 접근
      alert("잘못된 접근입니다.");
      navigate("/");
    }
  }, [searchParams, navigate, handleLoginSuccess]);

  // 페이지는 로딩 중이거나 빈 화면을 보여줍니다.
  return <div>로그인 처리 중...</div>;
}
