import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/Navbar";

export default function ServiceListPage() {
    const navigate = useNavigate();

    const categories = ["전체", "치료", "검사", "재활", "피부", "건강관리"];
    const [selected, setSelected] = useState("전체");

    const services = [
        {
            id: 1,
            title: "도수치료",
            category: "치료",
            rank: "1위",
            color: "bg-red-500",
            description: "전문 물리치료사가 직접 진행하는 수기 치료로 통증 완화와 체형 교정 효과가 있습니다.",
        },
        {
            id: 2,
            title: "건강검진",
            category: "건강관리",
            rank: "2위",
            color: "bg-orange-400",
            description: "정기 검진과 주요 장기 기능 검사를 포함한 예방 중심의 건강 체크 서비스.",
        },
        {
            id: 3,
            title: "물리치료",
            category: "재활",
            rank: "3위",
            color: "bg-yellow-400",
            description: "근육·관절 통증 완화, 근력 강화, 재활 훈련 프로그램 제공.",
        },
        {
            id: 4,
            title: "X-Ray / 초음파 검사",
            category: "검사",
            rank: "4위",
            color: "bg-blue-400",
            description: "각종 질환·손상 진단을 위한 영상 검사 서비스.",
        },
        {
            id: 5,
            title: "피부·레이저 시술",
            category: "피부",
            rank: "5위",
            color: "bg-green-500",
            description: "여드름·기미·주름 개선 및 다양한 피부 치료 시술 제공.",
        },
        // 전체 목록에 확장 가능
        {
            id: 6,
            title: "정형외과 진료",
            category: "치료",
            description: "관절·근육·인대 관련 전문 진료.",
        },
        {
            id: 7,
            title: "내과 진료",
            category: "건강관리",
            description: "감기·위장·만성 질환 등 전반적인 내과 진료.",
        },
    ];

    const filtered =
        selected === "전체"
            ? services
            : services.filter((s) => s.category === selected);

    return (
        <div className="font-pretendard bg-gray-50 min-h-screen">
        <Navbar />
            {/* ===== HERO ===== */}
            <section className="py-16 bg-gradient-to-r from-blue-50 to-white text-center">
                <h1 className="text-4xl font-bold text-gray-800">진료 서비스 안내</h1>
                <p className="mt-3 text-gray-600">
                    MediSync에서 제공하는 다양한 진료·검사·치료 서비스를 확인해보세요.
                </p>
            </section>

            {/* ===== 카테고리 필터 ===== */}
            <section className="max-w-6xl mx-auto px-6 md:px-10 py-10">
                <div className="flex gap-4 justify-center flex-wrap">
                    {categories.map((c) => (
                        <button
                            key={c}
                            onClick={() => setSelected(c)}
                            className={`px-4 py-2 rounded-full border transition 
                                ${
                                selected === c
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                            }
                            `}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </section>

            {/* ===== 인기 서비스 Top5 ===== */}
            <section className="max-w-6xl mx-auto px-6 md:px-10 py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    인기 진료 서비스 Top 5
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.slice(0, 5).map((s) => (
                        <div
                            key={s.id}
                            className="bg-white p-6 shadow-xl rounded-2xl hover:-translate-y-1 transition"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold text-gray-800">{s.title}</h3>
                                <span
                                    className={`${s.color} text-white text-xs px-3 py-1 rounded-full`}
                                >
                                    {s.rank}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm">{s.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== 전체 서비스 목록 ===== */}
            <section className="max-w-6xl mx-auto px-6 md:px-10 py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">전체 서비스</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {filtered.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white p-6 shadow-lg rounded-2xl hover:-translate-y-1 transition"
                        >
                            <h3 className="text-lg font-bold text-gray-800">{s.title}</h3>
                            <p className="text-gray-500 text-sm mt-2">{s.description}</p>
                            <button className="mt-4 text-blue-600 font-semibold">
                                <div
                                    onClick={() => navigate(`/services/${s.id}`)}
                                    className="bg-white p-6 shadow-xl rounded-2xl hover:-translate-y-1 transition cursor-pointer"
                                >더 알아보기</div>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== 상담 CTA ===== */}
            <section className="py-16 text-center bg-blue-600 text-white mt-20">
                <h2 className="text-3xl font-bold">궁금한 점이 있으신가요?</h2>
                <p className="text-blue-100 mt-3">
                    전문 상담팀이 빠르게 안내해드립니다.
                </p>

                <button
                    onClick={() => navigate("/contact")}
                    className="mt-6 bg-white text-blue-700 px-10 py-3 rounded-full font-semibold shadow-lg hover:bg-white/90 transition"
                >
                    상담 예약하기
                </button>
            </section>

        </div>
    );
}
