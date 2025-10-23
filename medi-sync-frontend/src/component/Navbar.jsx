import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 font-pretendard">
            <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* 로고 */}
                <Link to="/" className="text-2xl font-bold text-blue-500">
                    MediSync
                </Link>

                {/* 메뉴 */}
                <div className="flex space-x-8 text-gray-700 font-medium">
                    <Link to="/insurance" className="hover:text-blue-500">보험청구</Link>
                    <Link to="/doctors" className="hover:text-blue-500">의료상담</Link>
                    <Link to="/mypage" className="hover:text-blue-500">마이페이지</Link>
                    <Link to="/login" className="text-blue-500 border border-blue-500 px-4 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition">
                        로그인
                    </Link>
                </div>
            </div>
        </nav>
    );
}
