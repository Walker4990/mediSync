import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LogIn } from "lucide-react";
import useModal from "./ModalContext";
import axios from "axios";

export default function Navbar() {
  const {
    openModal,
    openLoginModal,
    isLoggedIn,
    handleLogout,
    setRedirectPath,
  } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태가 아닐 때는 체크하지 않음
    if (!isLoggedIn) return;

    const checkSessionExpiration = () => {
      const loginTime = localStorage.getItem("loginTime");
      const token = localStorage.getItem("token");

      if (token && loginTime) {
        const currentTime = new Date().getTime();
        const loginTimestamp = parseInt(loginTime, 10);
        const oneHour = 60 * 60 * 1000; // 60분

        // 현재 시간이 로그인 시간 + 60분을 넘었는지 확인
        if (currentTime - loginTimestamp > oneHour) {
          alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

          // 로그아웃 처리
          localStorage.removeItem("token");
          localStorage.removeItem("user_data");
          localStorage.removeItem("loginTime");

          if (handleLogout) handleLogout();
          navigate("/");
        }
      }
    };
    checkSessionExpiration();
    // 1분(60000ms)마다 주기적으로 체크
    const intervalId = setInterval(checkSessionExpiration, 60000);
    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearInterval(intervalId);
  }, [isLoggedIn, handleLogout, navigate]);

  // 전역 Axios 인터셉터 설정
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, // 정상 응답은 그대로 반환
      (error) => {
        // 401(인증 실패) 또는 403(권한 없음) 에러 감지
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          // 중복 알림 방지를 위해 로그인 상태일 때만 실행
          if (localStorage.getItem("token")) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");

            // 로컬 스토리지 토큰 삭제
            localStorage.removeItem("token");
            // 사용자 데이터가 있다면 삭제
            localStorage.removeItem("user_data");
            // Context 상태 업데이트 (로그아웃 처리)
            if (handleLogout) handleLogout();
            // 메인 페이지로 이동
            navigate("/");
          }
        }
        return Promise.reject(error); // 에러를 호출한 컴포넌트로 넘김
      }
    );

    // 컴포넌트 언마운트 시 인터셉터 제거 (메모리 누수 방지)
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [handleLogout, navigate]);

  const handleMenuClick = (e, path) => {
    if (!isLoggedIn) {
      e.preventDefault();
      if (setRedirectPath) {
        setRedirectPath(path);
      }
      openLoginModal();
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 font-pretendard">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* 로고 */}
        <Link to="/" className="text-2xl font-bold text-blue-500">
          MediSync
        </Link>

        {/* 메뉴 */}
        <div className="flex items-center space-x-10 text-gray-700 font-medium">
          <a
            href="/user/insurance"
            onClick={(e) => handleMenuClick(e, "/user/insurance")}
            className="hover:text-blue-500 transition cursor-pointer"
          >
            보험청구
          </a>
          <a
            href="/user/consult"
            onClick={(e) => handleMenuClick(e, "/user/consult")}
            className="hover:text-blue-500 transition cursor-pointer"
          >
            진료예약
          </a>
          <a
            href="/user/mypage"
            onClick={(e) => handleMenuClick(e, "/user/mypage")}
            className="hover:text-blue-500 transition cursor-pointer"
          >
            마이페이지
          </a>

          {/* 구분선 */}
          <span className="w-px h-5 bg-gray-300 mx-2 hidden md:block"></span>

          <div className="btn-group flex items-center gap-x-3 sm:gap-x-4">
            {isLoggedIn ? (
              // 🔑 로그인 상태: 로그아웃 버튼 표시
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-500 border border-red-500 px-4 py-1.5 rounded-lg shadow-sm hover:bg-red-500 hover:text-white transition duration-200 text-sm font-semibold"
                title="로그아웃"
              >
                <LogOut size={18} className="hidden sm:inline-block" />
                <span>로그아웃</span>
              </button>
            ) : (
              // 🔑 로그아웃 상태: 로그인 및 회원가입 버튼 표시
              <>
                <button
                  onClick={openLoginModal}
                  className="flex items-center space-x-1 text-blue-600 border border-blue-600 px-4 py-1.5 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition duration-200 text-sm font-semibold"
                  title="로그인"
                >
                  <LogIn size={18} className="hidden sm:inline-block" />
                  <span>로그인</span>
                </button>
                <button
                  onClick={openModal}
                  className="text-white bg-blue-600 px-5 py-[7px] rounded-lg shadow-md hover:bg-blue-700 transition duration-200 text-sm font-semibold"
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
