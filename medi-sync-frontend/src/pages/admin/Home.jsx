import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center px-8">
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

      {/* 주요 기능 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
          {
            title: "환자 관리",
            emoji: "👩‍⚕️",
            desc: "환자 등록 · 조회 · 진료이력 관리",
            color: "from-blue-500 to-blue-700",
            link: "/admin/patients",
          },
          {
            title: "보험 청구",
            emoji: "💳",
            desc: "진료 내역 기반 보험 심사 및 청구 관리",
            color: "from-green-500 to-green-700",
            link: "/claims",
          },
          {
            title: "회계 관리",
            emoji: "📊",
            desc: "수익/지출 내역 분석 및 재무 대시보드",
            color: "from-purple-500 to-purple-700",
            link: "/finance",
          },
        ].map((item, i) => (
          <motion.a
            key={i}
            href={item.link}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition transform hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="text-4xl mb-3">{item.emoji}</div>
            <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-200 group-hover:text-white">{item.desc}</p>
          </motion.a>
        ))}
      </div>

      {/* 푸터 */}
      <footer className="absolute bottom-4 text-sm text-gray-300">
        © 2025 MediSync Team — All rights reserved.
      </footer>
    </div>
  );
}
