import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../component/Navbar";

export default function ServiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // 서비스 데이터 (DB 연결 전까지는 Front에서 관리)
    const services = [
        {
            id: 1,
            title: "도수치료",
            category: "치료",
            image: "https://cdn.pixabay.com/photo/2017/08/06/11/11/massage-2594363_1280.jpg",
            description:
                "근육 긴장을 완화하고, 틀어진 신체 균형을 바로잡기 위한 전문 수기 치료입니다. 허리 통증, 목 통증, 어깨 질환에 효과적이며 전문 치료사가 1:1 맞춤으로 진행합니다.",
            features: [
                "척추·골반 불균형 교정",
                "근막 이완 및 통증 완화",
                "거북목·허리디스크 재활치료",
            ],
            doctors: [
                { name: "김도훈", dept: "물리치료과", img: "/img/doc1.png" },
                { name: "이서연", dept: "재활의학과", img: "/img/doc2.png" },
            ],
        },
        {
            id: 2,
            title: "건강검진",
            category: "건강관리",
            image: "https://cdn.pixabay.com/photo/2016/03/31/20/37/doctor-1295571_1280.png",
            description:
                "신체 주요 장기 기능을 확인하고 질환을 조기에 발견하기 위한 건강 검진 패키지입니다. 기본 검진부터 종합검진까지 선택 가능합니다.",
            features: [
                "혈액·소변 검사",
                "흉부 X-Ray 및 초음파 검사",
                "기초 체성분 분석",
            ],
            doctors: [
                { name: "박지현", dept: "내과", img: "/img/doc3.png" },
            ],
        },
        {
            id: 3,
            title: "물리치료",
            category: "재활",
            image: "https://cdn.pixabay.com/photo/2016/11/19/15/35/physiotherapy-1834517_1280.jpg",
            description:
                "통증 및 기능 장애를 치료하기 위한 전문 재활 프로그램을 제공합니다.",
            features: [
                "열·전기 치료",
                "근력 강화 운동",
                "도수 치료 병행 가능",
            ],
            doctors: [{ name: "정우성", dept: "재활의학과", img: "/img/doc4.png" }],
        },
        {
            id: 4,
            title: "X-Ray / 초음파 검사",
            category: "검사",
            image: "https://cdn.pixabay.com/photo/2016/03/27/20/54/ultrasound-1282380_1280.jpg",
            description:
                "정확한 질병 진단을 위한 영상 검사 장비를 보유하고 있으며, 전문 판독 의료진이 배정됩니다.",
            features: ["근골격계 초음파", "흉부 X-Ray", "복부·갑상선 초음파"],
            doctors: [{ name: "이현진", dept: "영상의학과", img: "/img/doc5.png" }],
        },
        {
            id: 5,
            title: "피부·레이저 시술",
            category: "피부",
            image: "https://cdn.pixabay.com/photo/2017/07/25/01/22/girl-2530990_1280.jpg",
            description:
                "여드름, 기미, 모공 개선부터 탄력 리프팅까지 다양한 피부 시술을 제공합니다.",
            features: ["피부 레이저", "여드름 치료", "리프팅 시술"],
            doctors: [{ name: "김유진", dept: "피부과", img: "/img/doc6.png" }],
        },
    ];

    const service = services.find((s) => s.id === Number(id));

    if (!service)
        return <div className="text-center py-20 text-gray-500">서비스 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
        <Navbar />
            {/* ▣ HERO */}
            <div className="relative h-72 w-full overflow-hidden">
                <img
                    src={service.image}
                    className="w-full h-full object-cover opacity-90"
                    alt={service.title}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h1 className="text-white text-4xl font-bold">{service.title}</h1>
                </div>
            </div>

            {/* ▣ 내용 본문 */}
            <div className="max-w-5xl mx-auto px-6 md:px-10 mt-14">

                {/* 설명 */}
                <div className="bg-white p-8 shadow-xl rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4">{service.title}란?</h2>
                    <p className="text-gray-700 leading-relaxed">{service.description}</p>

                    {/* 특징 */}
                    <h3 className="text-xl font-bold mt-8 mb-3">주요 효과</h3>
                    <ul className="list-disc ml-6 text-gray-600 space-y-1">
                        {service.features.map((f, i) => (
                            <li key={i}>{f}</li>
                        ))}
                    </ul>
                </div>

                {/* 담당 의료진 */}
                <div className="mt-14">
                    <h2 className="text-2xl font-bold mb-6">담당 의료진</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {service.doctors.map((doc, i) => (
                            <div
                                key={i}
                                className="bg-white p-6 shadow-lg rounded-2xl flex flex-col items-center"
                            >
                                <img
                                    src={doc.profileImgUrl || "https://cdn-icons-png.flaticon.com/512/387/387561.png"}
                                    className="w-20 h-20 rounded-full border"
                                />
                                <p className="font-bold mt-4">{doc.name}</p>
                                <p className="text-sm text-gray-500">{doc.dept}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <button
                        onClick={() => navigate("/contact")}
                        className="px-12 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold shadow-lg hover:bg-blue-700 transition"
                    >
                        상담 예약하기
                    </button>
                </div>
            </div>
        </div>
    );
}
