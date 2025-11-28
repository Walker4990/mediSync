import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LOGIN_API_URL = "http://localhost:8080/api/admins/login";

const LoginForm = ({ onLoginSuccess }) => {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        emp_id: empId,
        password: password,
      };

      const res = await axios.post(LOGIN_API_URL, payload);

      if (res.status === 200 && res.data && res.data.token) {
        onLoginSuccess(res.data);
      } else {
        setError(res.data.message || "로그인 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      let errorMessage = "네트워크 오류 또는 서버 접속 실패";

      if (err.response) {
        const status = err.response.status;
        if (status === 401)
          errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
        else if (status === 403) errorMessage = "접근 권한이 없습니다.";
        else errorMessage = `로그인 실패 (코드: ${status})`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm bg-white/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30"
    >
      <h2 className="text-2xl font-bold text-center text-white mb-6 drop-shadow">
        관리자 로그인
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 text-white">
        <div>
          <label className="block mb-1 text-sm">사원 ID</label>
          <input
            type="text"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-300 focus:bg-white/30 outline-none placeholder-gray-200"
            placeholder="사원번호 입력"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-300 focus:bg-white/30 outline-none placeholder-gray-200"
            placeholder="비밀번호 입력"
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-300 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 mt-2 rounded-lg font-semibold shadow-lg transition 
          ${
            isLoading
              ? "bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }
          flex justify-center items-center`}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </motion.div>
  );
};

export default function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("admin_token")
  );
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (loginData) => {
    const { token, admin } = loginData;

    if (token) {
      localStorage.setItem("admin_token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsLoggedIn(true);
      setShowLoginForm(false);
      setMessage("로그인 성공!");

      const redirectPath = localStorage.getItem("admin_redirect_path");
      localStorage.removeItem("admin_redirect_path");
      if (admin) {
        localStorage.setItem("admin_data", JSON.stringify(admin));
      }
      // 2. Axios 헤더 설정
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setTimeout(() => {
        navigate(redirectPath || "/admin/main", { replace: true });
      }, 800);
    }
  };

  const featureItems = [
    {
      title: "환자 관리",
      emoji: "🩺",
      desc: "환자 조회 · 진료기록 관리",
      link: "/admin/main",
    },
    {
      title: "수술/예약 관리",
      emoji: "🏥",
      desc: "수술 예약 · 일정 조회 · 병실 배정",
      link: "/admin/operation",
    },
    {
      title: "회계 관리",
      emoji: "📊",
      desc: "수익/지출 분석 · 재무 대시보드",
      link: "/admin/finance",
    },
  ];

  const handleFeatureClick = (e, link) => {
    e.preventDefault();

    if (isLoggedIn) navigate(link);
    else {
      localStorage.setItem("admin_redirect_path", link);
      setMessage("로그인이 필요한 기능입니다");
      setTimeout(() => setShowLoginForm(true), 800);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden
    bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white"
    >
      {/* Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-blue-400/30 rounded-full blur-[150px] top-[-200px] left-[-200px]" />
        <div className="absolute w-[700px] h-[700px] bg-purple-400/20 rounded-full blur-[150px] bottom-[-200px] right-[-150px]" />
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl">
          MediSync ERP
        </h1>
        <p className="mt-3 text-gray-200">
          의료 · 보험 · 회계 통합 관리 시스템
        </p>
      </motion.div>

      {/* Login or Feature Cards */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {showLoginForm && !isLoggedIn ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg shadow-lg"
              >
                {message}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {featureItems.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.link}
                  onClick={(e) => handleFeatureClick(e, item.link)}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  className="group bg-white/15 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-xl cursor-pointer hover:bg-white/25 hover:-translate-y-2 transition"
                >
                  <div className="text-5xl mb-4 drop-shadow">{item.emoji}</div>
                  <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-gray-200 group-hover:text-white">
                    {item.desc}
                  </p>
                </motion.a>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="absolute bottom-5 text-sm text-gray-300 z-10">
        © 2025 MediSync — All rights reserved.
      </footer>
    </div>
  );
}
