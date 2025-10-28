import React, { useState } from "react";
import Footer from "../../component/Footer";
import Navbar from "../../component/Navbar";

const socialStyles = `
  .naver-bg {
      background-color: #03c75a;
  }
  .kakao-bg {
      background-color: #fee500;
      color: #191919;
  }
`;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("폼 로그인 시도:", { username, password });
    setMessage(
      `ID: ${username}, PW: ${password}로 서버에 로그인 요청을 보냅니다.`
    );

    // fetch('/login', { method: 'POST', body: new FormData(e.target) });
  };

  // OAuth2 로그인 시작 함수 (React Router 무시하고 강제 리다이렉트)
  const handleSocialLogin = (provider) => {
    // Spring Security OAuth2 시작 경로로 강제 이동합니다.
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-pretendard">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <style>{socialStyles}</style> {/* 소셜 버튼 색상 적용 */}
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">MediSync</h1>
            <p className="text-gray-500 mt-1">통합 병원 업무 시스템</p>
          </div>

          {/* ID/PW 인풋 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                아이디
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="사용자 ID 입력"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="비밀번호 입력"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
              로그인
            </button>
          </form>

          {/* 메시지 박스 */}
          {message && (
            <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm">
              {message}
            </div>
          )}

          {/* 2. 구분선 */}
          <div className="relative flex justify-center items-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative bg-white px-3 text-sm text-gray-500">
              또는 간편 로그인
            </div>
          </div>

          {/* 3. 소셜 로그인 버튼 (Spring Security 경로 사용) */}
          <div className="space-y-3">
            {/* 네이버 로그인 버튼 */}
            <button
              onClick={() => handleSocialLogin("naver")}
              className="flex items-center justify-center w-full py-3 naver-bg text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200"
            >
              <span className="ml-2">네이버로 시작하기</span>
            </button>

            {/* 카카오 로그인 버튼 */}
            <button
              onClick={() => handleSocialLogin("kakao")}
              className="flex items-center justify-center w-full py-3 kakao-bg text-gray-900 font-semibold rounded-lg shadow-md hover:opacity-80 transition duration-200"
            >
              <span className="ml-2">카카오로 시작하기</span>
            </button>
          </div>

          {/* 4. 기타 링크 */}
          <div className="mt-6 text-center text-sm">
            <a
              href="/user/register"
              className="text-blue-600 hover:text-blue-800 mr-4 font-medium"
            >
              회원가입
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 mr-4 ml-4 font-medium"
            >
              홈으로
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="/find"
              className="text-blue-600 hover:text-blue-800 ml-4 font-medium"
            >
              아이디/비밀번호 찾기
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
