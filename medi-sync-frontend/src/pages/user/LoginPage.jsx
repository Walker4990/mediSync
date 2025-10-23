import React, { useState } from "react";

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", { userId, password });
    alert(`ID: ${userId}, PW: ${password}로 로그인 시도.`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-8">
          로그인
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 아이디 입력 필드 */}
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              아이디
            </label>
            <input
              id="userId"
              type="text"
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 2. 비밀번호 입력 필드 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 3. 로그인 버튼 */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            로그인
          </button>
        </form>

        {/* 회원가입, 아이디/비밀번호 찾기 */}
        <div className="mt-6 text-center text-sm">
          <a
            href="/user/register"
            className="text-blue-600 hover:text-blue-800 mr-4"
          >
            회원가입
          </a>
          <span className="text-gray-400">|</span>
          <a href="/" className="text-blue-600 hover:text-blue-800 mr-4 ml-4">
            홈으로
          </a>
          <span className="text-gray-400">|</span>
          <a
            href="/user/finduser"
            className="text-blue-600 hover:text-blue-800 ml-4"
          >
            아이디/비밀번호 찾기
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
