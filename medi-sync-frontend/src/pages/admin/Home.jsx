import React, { useState } from "react";
import { motion } from "framer-motion";

// 새롭게 추가된 심플 로그인 폼 컴포넌트
const LoginForm = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // ID가 "admin"이고 PW가 "1234"일 때 성공
    if (userId === "admin" && password === "1234") {
      console.log("로그인 성공!");
      onLoginSuccess(); // 로그인 성공 시 부모 상태 업데이트
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
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
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700"
          >
            아이디
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="아이디"
            required
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
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition duration-300"
        >
          로그인
        </button>
      </form>
    </motion.div>
  );
};

// 메인 Home 컴포넌트
export default function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  const handleFeatureClick = (e, link) => {
    e.preventDefault();

    if (isLoggedIn) {
      // 실제 로그인이 되어 있다면 해당 페이지로 이동
      window.location.href = link;
    } else {
      // 로그인 필요 메시지 노출 후 폼 표시
      setMessage("로그인이 필요한 기능입니다");
      setTimeout(() => {
        setMessage("");
        setShowLoginForm(true);
      }, 1000); // 1초 후 메시지 사라지고 폼 등장
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
    setMessage("로그인 성공! 원하시는 메뉴를 클릭 시 이동합니다.");

    // 성공 후 메인 페이지로 리디렉션하거나, 필요한 동작을 수행
    setTimeout(() => {
      setMessage("");
    }, 1500);
  };

  // 기능 카드 데이터
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
      link: "/claims",
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
