import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LOGIN_API_URL = "http://192.168.0.24:8080/api/admins/login";

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
        console.log("로그인 성공! 응답 데이터:", res.data.token);
        onLoginSuccess(res.data); // 성공 시 부모 상태 및 데이터 업데이트
      } else {
        setError(res.data.message || "로그인 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("로그인 API 호출 실패:", err);

      let errorMessage = "네트워크 오류 또는 서버 접속 실패";

      if (err.response) {
        // 서버 응답 에러
        const status = err.response.status;
        if (status === 401) {
          errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
        } else if (status === 403) {
          errorMessage = "접근 권한이 없습니다.";
        } else {
          errorMessage = `로그인 실패 (코드: ${status})`;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl text-gray-800"
    >
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
        ERP 로그인
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="empId"
            className="block text-sm font-medium text-gray-700"
          >
            아이디 (사원 ID)
          </label>
          <input
            id="empId"
            type="text"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="아이디"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호"
            required
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 text-white font-semibold rounded-md shadow-lg transition duration-300 flex items-center justify-center ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              로그인 중...
            </>
          ) : (
            "로그인"
          )}
        </button>
      </form>
    </motion.div>
  );
};

// 메인 컴포넌트
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
      // 1. 토큰을 localStorage에 저장
      localStorage.setItem("admin_token", token);

      if (admin) {
        localStorage.setItem("admin_data", JSON.stringify(admin));
      }
      // 2. Axios 헤더 설정
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 3. 상태 업데이트
      setIsLoggedIn(true);
      setShowLoginForm(false);
      setMessage("로그인 성공! 잠시 후 이동합니다.");
      console.log("로그인 성공, 토큰 저장 완료.");

      // 4. 저장된 리디렉션 경로로 이동
      const redirectPath = localStorage.getItem("admin_redirect_path");
      localStorage.removeItem("admin_redirect_path"); // 사용 후 경로 제거

      setTimeout(() => {
        setMessage("");
        navigate(redirectPath || "/admin/main", { replace: true });
      }, 1000);
    } else {
      console.error("로그인 응답에 token 또는 admin 데이터가 없습니다.");
    }
  };

  const handleFeatureClick = (e, link) => {
    e.preventDefault();

    if (isLoggedIn) {
      // 실제 로그인이 되어 있다면 해당 페이지로 이동
      navigate(link);
    } else {
      localStorage.setItem("admin_redirect_path", link);
      // 로그인 필요 메시지 노출 후 폼 표시
      setMessage("로그인이 필요한 기능입니다");
      setTimeout(() => {
        setMessage("");
        setShowLoginForm(true);
      }, 1000); // 1초 후 메시지 사라지고 폼 등장
    }
  };

  const featureItems = [
    {
      title: "환자 관리",
      emoji: "👩‍⚕️",
      desc: "환자 등록 · 조회 · 진료이력 관리",
      link: "/admin/main",
    },
    {
      title: "보험 청구",
      emoji: "💳",
      desc: "진료 내역 기반 보험 심사 및 청구 관리",
      link: "/admin/claims",
    },
    {
      title: "회계 관리",
      emoji: "📊",
      desc: "수익/지출 내역 분석 및 재무 대시보드",
      link: "/admin/finance",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center px-8 relative">
      {/* 로고 & 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
          MediSync ERP
        </h1>
        <p className="text-lg text-gray-200">
          의료 · 보험 · 회계 통합 관리 플랫폼
        </p>
      </motion.div>

      {/* 메시지 및 로그인 폼 영역 */}
      {showLoginForm && !isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="w-full max-w-5xl flex flex-col items-center justify-center">
          {/* 로그인 필요 메시지 표시 */}
          {message && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`text-xl font-semibold mb-8 p-3 rounded-lg shadow-xl`}
            >
              {message}
            </motion.div>
          )}

          {/* 주요 기능 카드 */}
          {!showLoginForm && (
            <motion.div
              key="cards"
              initial={{ opacity: 1 }}
              animate={{ opacity: message ? 0 : 1 }} // 메시지가 뜰 때 카드가 서서히 사라지도록 처리
              transition={{ duration: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
              style={{ pointerEvents: message ? "none" : "auto" }} // 메시지 출력 중 클릭 방지
            >
              {featureItems.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.link}
                  onClick={(e) => handleFeatureClick(e, item.link)} // 클릭 핸들러 추가
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center cursor-pointer
                                         hover:bg-white/20 transition transform hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-gray-200 group-hover:text-white">
                    {item.desc}
                  </p>
                </motion.a>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* 푸터 */}
      <footer className="absolute bottom-4 text-sm text-gray-300">
        © 2025 MediSync Team — All rights reserved.
      </footer>
    </div>
  );
}
