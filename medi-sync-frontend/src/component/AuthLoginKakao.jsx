import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getKakaoToken } from "../api/kakaoLogin";
import useModal from "./ModalContext";
import { toast } from "react-toastify";

const AuthLoginKakao = () => {
  const code = new URL(window.location.href).searchParams.get("code");
  const { handleLoginSuccess } = useModal();
  const navigate = useNavigate();

  // 중복 호출 방지
  const isRequestSent = useRef(false);

  const loadKakaoToken = async () => {
    try {
      const res = await getKakaoToken(code);

      console.log(res);

      if (res.data.success) {
        localStorage.setItem("user_data", JSON.stringify(res.data.user));
        localStorage.setItem("loginTime", new Date().getTime().toString());

        toast.success(`반갑습니다! ${res.data.user.name || "회원"}님 👋`);
        handleLoginSuccess(res.data.token);
      } else {
        toast.error(res.data.message || "카카오 로그인 실패 😥");
        navigate("/"); // 실패 시 메인으로 이동
      }
    } catch (err) {
      console.error(err);
      toast.error("서버 오류로 로그인에 실패했습니다.");
      navigate("/");
    }
  };

  useEffect(() => {
    if (code && !isRequestSent.current) {
      isRequestSent.current = true;
      loadKakaoToken();
    }
  }, [code]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthLoginKakao;
