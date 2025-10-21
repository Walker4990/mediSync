import React from "react";
import {Link} from "react-router-dom";

export default function AdminHeader() {
    return (
        <header className="bg-blue-600 text-white shadow-md fixed top-0 left-0 w-full z-50 font-pretendard">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-3">
                {/* 로고 / 타이틀 */}
                <h1 className="text-xl font-bold tracking-wide">
                    MediSync <span className="text-blue-200">Admin</span>
                </h1>

                {/* 네비게이션 */}
                <nav className="flex gap-6 text-sm">
                    <Link to="/admin/dashboard" className="hover:text-blue-200">
                        대시보드
                    </Link>
                    <Link to="/admin/patients" className="hover:text-blue-200">
                        환자관리
                    </Link>
                    <Link to="/admin/doctors" className="hover:text-blue-200">
                        의사관리
                    </Link>
                    <Link to="/admin/insurance" className="hover:text-blue-200">
                        보험관리
                    </Link>
                    <Link to="/admin/finance" className="hover:text-blue-200">
                        회계관리
                    </Link>
                </nav>

                {/* 우측 사용자 섹션 */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-blue-100">관리자</span>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                        로그아웃
                    </button>
                </div>
            </div>
        </header>
    )
}