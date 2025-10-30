import React, { useState } from "react";
import DrugList from "../../component/DrugList";
import PrescriptionPage from "../../component/PrescriptionPage";

export default function DrugPage() {
    const [activeTab, setActiveTab] = useState("drug");

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            {/* 페이지 헤더 */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    💊 <span>약품 관리</span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    병원 내 약품 목록과 처방 내역을 한 곳에서 관리하세요.
                </p>
            </div>

            {/* 탭바 */}
            <div className="flex gap-2 mb-0 border-b border-gray-300">
                <button
                    onClick={() => setActiveTab("drug")}
                    className={`px-5 py-2.5 font-medium rounded-t-md transition-all duration-150
            ${
                        activeTab === "drug"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    약품 목록
                </button>
                <button
                    onClick={() => setActiveTab("prescription")}
                    className={`px-5 py-2.5 font-medium rounded-t-md transition-all duration-150
            ${
                        activeTab === "prescription"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    처방 관리
                </button>
            </div>

            {/* 콘텐츠 카드 */}
            <div className="bg-white rounded-b-xl shadow-md border border-gray-200 p-6 mt-0 pt-4">
                {activeTab === "drug" && <DrugList />}
                {activeTab === "prescription" && <PrescriptionPage />}
            </div>
        </div>
    );
}
