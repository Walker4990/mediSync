import React, { useState } from "react";
import axios from "axios";
import Footer from "../../component/Footer";
import Navbar from "../../component/Navbar";

export default function RegisterAPI() {
  const [form, setForm] = useState({
    name: "",
    userId: "",
    password: "",
  });

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
    });
  };

  // 제출 시 residentNo 합쳐서 전송
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      name: form.name,
      userId: form.userId,
      password: form.password,
    };

    try {
      const res = await axios.post(
        "http://192.168.0.24:8080/api/patients/register",
        dataToSend
      );

      if (res.data.success) {
        alert(res.data.message); // ✅ 서버에서 내려준 메시지
        setForm({
          name: "",
          userId: "",
          password: "",
        });
      } else {
        alert("⚠️ 등록 실패: " + res.data.message);
      }
    } catch (err) {
      alert(" 네트워크 오류: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-pretendard">
      <Navbar />
      <div className="font-pretendard mt-20 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg"
        >
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
            회원가입{" "}
          </h2>

          {/* 이름 */}
          <label className="block mb-4">
            <span className="block text-gray-700 mb-1">이름</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </label>

          {/* 아이디 */}
          <label className="block mb-4">
            <span className="block text-gray-700 mb-1">아이디</span>
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          {/* 비밀번호 */}
          <label className="block mb-4">
            <span className="block text-gray-700 mb-1">비밀번호</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold"
          >
            등록하기
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
