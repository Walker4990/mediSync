import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChartPie, FaListUl, FaArrowLeft } from "react-icons/fa";
import { FiBarChart2 } from "react-icons/fi";

export default function FinanceHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const menus = [
        { title: "대시보드", icon: <FaChartPie />, link: "/admin/finance/dashboard" },
        { title: "거래내역", icon: <FaListUl />, link: "/admin/finance" },
        { title: "환불 관리", icon: <FaListUl />, link: "/admin/finance/refund" },
    ];

    return (
        <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="backdrop-blur-md bg-gradient-to-r from-indigo-700/90 via-blue-600/90 to-indigo-800/90
                       shadow-xl flex justify-between items-center px-10 py-5 border-b border-indigo-400/40"
        >
            {/* 좌측 로고 / 타이틀 */}
            <div
                onClick={() => navigate("/admin")}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            >
                <FiBarChart2 className="text-3xl text-white drop-shadow-md" />
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Finance Center</h1>
                    <p className="text-sm text-indigo-200 font-medium">의료 재무 통합 관리</p>
                </div>
            </div>

            {/* 메뉴 영역 */}
            <nav className="flex gap-8 text-lg font-semibold">
                {menus.map((m, i) => {
                    const active = location.pathname === m.link;
                    return (
                        <button
                            key={i}
                            onClick={() => navigate(m.link)}
                            className={`flex items-center gap-2 pb-1 transition-all duration-300 
                                ${active
                                ? "border-b-2 border-yellow-400 text-yellow-300"
                                : "text-white hover:text-yellow-200 hover:border-b-2 hover:border-yellow-200"
                            }`}
                        >
                            {m.icon}
                            {m.title}
                        </button>
                    );
                })}
            </nav>

            {/* 홈 버튼 */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/admin")}
                className="bg-white text-indigo-700 px-5 py-2 rounded-full font-semibold
                           shadow-md hover:shadow-lg hover:bg-indigo-50 transition"
            >
                홈으로
            </motion.button>
        </motion.header>
    );
}
