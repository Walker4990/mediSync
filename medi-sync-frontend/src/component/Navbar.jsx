import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LogOut, LogIn } from "lucide-react";
import useModal from "./ModalContext";

export default function Navbar() {
  const { openModal, openLoginModal, isLoggedIn, handleLogout } = useModal();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 font-pretendard">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* 로고 */}
        <Link to="/" className="text-2xl font-bold text-blue-500">
          MediSync
        </Link>

        {/* 메뉴 */}
        <div className="flex items-center space-x-10 text-gray-700 font-medium">
          <Link to="/user/insurance" className="hover:text-blue-500 transition">
            보험청구
          </Link>
          <Link to="/user/consult" className="hover:text-blue-500 transition">
            의료상담
          </Link>
          <Link to="/user/mypage" className="hover:text-blue-500 transition">
            마이페이지
          </Link>

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
                  className="text-white bg-blue-600 px-4 py-1.5 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 text-sm font-semibold"
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
