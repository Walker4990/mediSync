import { useEffect } from "react";
import { getKakaoToken } from "../api/kakaoLogin";
import useModal from "./ModalContext";

const AuthLoginKakao = () => {
  const code = new URL(window.location.href).searchParams.get("code");
  const { handleLoginSuccess } = useModal();

  const loadKakaoToken = async () => {
    try {
      const res = await getKakaoToken(code);

      console.log(res);

      if (res.data.success) {
        localStorage.setItem("user_data", JSON.stringify(res.data.user));
        localStorage.setItem("loginTime", new Date().getTime().toString());
        handleLoginSuccess(res.data.token);
        alert("로그인 성공!");
      } else {
        alert(res.data.message || "로그인 실패");
      }
    } catch (err) {
      alert("서버 오류로 로그인 실패");
    }
  };

  useEffect(() => {
    loadKakaoToken();
  }, []);

  return <></>;
};

export default AuthLoginKakao;
