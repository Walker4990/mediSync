import React from "react";
import { Link } from "react-router-dom";

export default function UserHome() {
  return (
    <div className="font-pretendard mt-20">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-center px-8 md:px-20 py-16 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-2xl shadow-lg max-w-6xl mx-auto">
        <div className="space-y-6 md:w-1/2">
          <h1 className="text-4xl font-bold leading-tight">
            병원 방문 없이,
            <br />
            보험 청구까지 한 번에
          </h1>
          <p className="text-lg text-blue-100">
            MediSync와 함께 비대면 진료부터 보험 정산까지 쉽고 빠르게
          </p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="bg-white text-blue-500 font-semibold px-6 py-3 rounded-full hover:bg-blue-100 transition"
            >
              진료 시작하기
            </Link>
            <Link
              to="/insurance"
              className="border border-white px-6 py-3 rounded-full hover:bg-blue-600 transition"
            >
              보험 청구 조회
            </Link>
          </div>
        </div>

        <div className="hidden md:block md:w-1/2"></div>
      </section>

      {/* 서비스 카드 */}
      <section className="max-w-6xl mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
        {[
          {
            title: "비대면 진료",
            desc: "의사 상담을 집에서도 간편하게",
            icon: "💬",
          },
          {
            title: "보험 자동청구",
            desc: "진료 후 보험사로 자동 접수",
            icon: "💳",
          },
          {
            title: "건강 기록 관리",
            desc: "나의 건강 상태를 한눈에",
            icon: "📈",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-2xl p-8 text-center hover:shadow-lg transition"
          >
            <div className="text-5xl mb-4">{card.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
            <p className="text-gray-600">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA 섹션 */}
      <section className="bg-blue-50 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          MediSync로 건강을 쉽게 관리하세요
        </h2>
        <Link
          to="/user/register"
          className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 font-semibold transition"
        >
          지금 시작하기
        </Link>
      </section>
    </div>
  );
}
