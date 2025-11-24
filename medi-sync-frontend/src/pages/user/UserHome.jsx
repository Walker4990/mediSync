import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import axios from "axios";
import UnpaidAlert from "../../component/UnpaidAlert";

export default function UserHome() {
    const [doctor, setDoctor] = useState([]);



    useEffect(()=>{
        axios.get("http://192.168.0.24:8080/api/admins/recommanded")
            .then(res => setDoctor(res.data))
            .catch(err => console.log("추천 의사 조회 실패", err));
    },[])

    const [review, setReview] = useState(null);
    useEffect(()=>{
        axios.get("http://192.168.0.24:8080/api/reviews/random")
        .then(res => setReview(res.data))
        .catch(err => console.log(err));
    },[])
    const navigate = useNavigate();
    return (
        <div className="font-pretendard bg-gray-50">
            <UnpaidAlert />
            {/* ================= HERO SECTION ================= */}
            <section className="relative max-w-6xl mx-auto px-6 md:px-10 py-20">   {/* 💙 폭 통일 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-sky-300 to-purple-300 opacity-30 blur-3xl rounded-3xl -z-10"></div>

                <Swiper
                    modules={[Autoplay, Pagination, Navigation, EffectFade]}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    autoplay={{ delay: 3000 }}
                    pagination={{ clickable: true }}
                    loop
                >
                    {/* ================= SLIDE 1 ================= */}
                    <SwiperSlide>
                        <div className="flex flex-col md:flex-row items-center gap-14">
                            <div className="md:w-1/2 space-y-6">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                                    병원 방문 없이,
                                    <br />
                                    <span className="text-blue-600">비대면 진료 시작</span>
                                </h1>
                                <p className="text-lg text-gray-600">
                                    모바일에서 간편하게 의사 상담을 받고
                                    <span className="text-blue-600 font-semibold"> 빠르게 진료</span>받으세요.
                                </p>
                            </div>
                            <div className="md:w-1/2 hidden md:flex justify-center">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/2966/2966483.png"
                                    className="w-72 drop-shadow-lg"
                                    alt="hero-1"
                                />
                            </div>
                        </div>
                    </SwiperSlide>


                    {/* ================= SLIDE 2 ================= */}
                    <SwiperSlide>
                        <div className="flex flex-col md:flex-row items-center gap-14">
                            <div className="md:w-1/2 space-y-6">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                                    검사 예약부터 결과까지,
                                    <br />
                                    <span className="text-blue-600">자동으로 관리</span>
                                </h1>
                                <p className="text-lg text-gray-600">
                                    검사 일정, 접수, 결과 조회까지
                                    <span className="text-blue-600 font-semibold"> 한 번에 처리</span>됩니다.
                                </p>
                            </div>
                            <div className="md:w-1/2 hidden md:flex justify-center">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/2966/2966500.png"
                                    className="w-72 drop-shadow-lg"
                                    alt="hero-2"
                                />
                            </div>
                        </div>
                    </SwiperSlide>


                    {/* ================= SLIDE 3 ================= */}
                    <SwiperSlide>
                        <div className="flex flex-col md:flex-row items-center gap-14">
                            <div className="md:w-1/2 space-y-6">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                                    진료 후 자동 정산,
                                    <br />
                                    <span className="text-blue-600">보험 청구까지 완료</span>
                                </h1>
                                <p className="text-lg text-gray-600">
                                    진료·검사 비용이 정산되면
                                    <span className="text-blue-600 font-semibold"> 보험사로 자동 연동</span>되어
                                    별도 제출이 필요 없습니다.
                                </p>
                            </div>
                            <div className="md:w-1/2 hidden md:flex justify-center">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/3209/3209261.png"
                                    className="w-72 drop-shadow-lg"
                                    alt="hero-3"
                                />
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </section>



            {/*/!* ================= FEATURE CARDS ================= *!/*/}
            {/*<section className="max-w-6xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 md:grid-cols-3 gap-10">*/}
            {/*    {[*/}
            {/*        {*/}
            {/*            title: "비대면 진료",*/}
            {/*            desc: "의사 상담을 집에서도 간편하게",*/}
            {/*            icon: "💬",*/}
            {/*            color: "from-blue-500 to-sky-400",*/}
            {/*        },*/}
            {/*        {*/}
            {/*            title: "보험 자동청구",*/}
            {/*            desc: "진료 후 보험사로 자동 접수",*/}
            {/*            icon: "💳",*/}
            {/*            color: "from-purple-500 to-purple-400",*/}
            {/*        },*/}
            {/*        {*/}
            {/*            title: "건강 기록 관리",*/}
            {/*            desc: "나의 건강 상태를 한눈에",*/}
            {/*            icon: "📈",*/}
            {/*            color: "from-teal-500 to-emerald-400",*/}
            {/*        },*/}
            {/*    ].map((card, i) => (*/}
            {/*        <div*/}
            {/*            key={i}*/}
            {/*            className="bg-white rounded-2xl shadow-xl p-10 text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"*/}
            {/*        >*/}
            {/*            <div*/}
            {/*                className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center text-4xl rounded-full bg-gradient-to-br ${card.color} text-white shadow`}*/}
            {/*            >*/}
            {/*                {card.icon}*/}
            {/*            </div>*/}
            {/*            <h3 className="text-2xl font-bold text-gray-800 mb-2">*/}
            {/*                {card.title}*/}
            {/*            </h3>*/}
            {/*            <p className="text-gray-500 text-sm">{card.desc}</p>*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</section>*/}
            {/* ================= HOSPITAL FEATURE SECTION ================= */}
            {/* ================= FEATURE SECTION ================= */}
            <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">  {/* 💙 폭 통일 */}

                {/* ▣ 오늘의 진료 안내 */}
                <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl rounded-3xl p-8 hover:-translate-y-2 transition">  {/* 💙 카드 스타일 통일 */}
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-3xl">🗓️</span>
                        오늘의 진료 안내
                    </h3>

                    <div className="space-y-4 text-gray-700">
                        <div className="flex justify-between">
                            <span>진료 예약</span>
                            <span className="font-semibold text-blue-600">0건</span>
                        </div>
                        <div className="flex justify-between">
                            <span>검사 예정</span>
                            <span className="font-semibold text-blue-600">1건</span>
                        </div>
                        <div className="flex justify-between">
                            <span>보험 청구 진행</span>
                            <span className="font-semibold text-purple-600">심사중</span>
                        </div>
                    </div>

                    <button className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                        진료 내역 보기
                    </button>
                </div>

                {/* ▣ 추천 의사 */}
                <div className="bg-gradient-to-br from-white to-green-50 shadow-xl hover:shadow-2xl rounded-3xl p-8 hover:-translate-y-2 transition">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-3xl">🩺</span>
                        추천 의료진
                    </h3>

                    <Swiper
                        modules={[Pagination, Autoplay]}
                        autoplay={{ delay: 2500, disableOnInteraction: false }}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        loop
                        className="pb-6"
                    >
                        {doctor.map((d) => (
                            <SwiperSlide key={d.adminId}>
                                <div className="bg-white rounded-3xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition">  {/* 💙 카드 통일 */}
                                    <img
                                        src={d.profileImgUrl || "https://cdn-icons-png.flaticon.com/512/387/387561.png"}
                                        className="w-20 h-20 rounded-full border"
                                    />
                                    <p className="mt-4 text-lg font-bold text-gray-800">{d.name}</p>
                                    <p className="text-gray-500 text-sm">{d.deptName}</p>
                                    <p className="mt-1 text-yellow-500 text-sm font-semibold">
                                        ⭐ {d.rating?.toFixed(1)} / 5.0
                                    </p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>


                {/* ▣ 인기 진료 서비스 */}
                <div className="bg-gradient-to-br from-white to-pink-50 shadow-xl hover:shadow-2xl rounded-3xl p-8 hover:-translate-y-2 transition">  {/* 💙 카드 통일 */}
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-3xl">🔥</span>
                        인기 진료 서비스
                    </h3>

                    <div className="space-y-4">

                        {/* 1위 — 도수치료 */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">도수치료</span>
                            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">1위</span>
                        </div>

                        {/* 2위 — 건강검진 */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">건강검진</span>
                            <span className="bg-orange-400 text-white text-xs px-3 py-1 rounded-full">2위</span>
                        </div>

                        {/* 3위 — 물리치료 */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">물리치료</span>
                            <span className="bg-yellow-400 text-white text-xs px-3 py-1 rounded-full">3위</span>
                        </div>

                        {/* 4위 — X-Ray / 초음파 */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">X-Ray / 초음파 검사</span>
                            <span className="bg-blue-400 text-white text-xs px-3 py-1 rounded-full">4위</span>
                        </div>

                        {/* 5위 — 피부레이저 (선택 사항) */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">피부·레이저 시술</span>
                            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">5위</span>
                        </div>

                    </div>
                    <button
                        onClick={() => navigate("/services")}
                        className="w-full mt-8 bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition"
                    >
                        자세히 보기
                    </button>
                </div>


            </section>

            <section className="max-w-6xl mx-auto px-6 md:px-10 py-16">   {/* 💙 폭 통일 */}
                <div className="bg-white shadow-xl hover:shadow-2xl rounded-3xl p-8 hover:-translate-y-2 transition">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-yellow-500 text-2xl">⭐</span>
                        실제 환자 리뷰
                    </h3>

                    {review ? (
                        <div className="space-y-3">
                            <p className="text-gray-700 italic">"{review.memo}"</p>
                            <div className="mt-4">
                                <p className="font-semibold text-gray-800">{review.name}</p>
                                <p className="text-gray-500 text-sm">{review.deptName}</p>
                                <p className="text-yellow-500 text-sm font-semibold">⭐ 5.0 / 5.0</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">리뷰 불러오는 중...</p>
                    )}
                </div>
            </section>

            <footer className="w-full bg-[#f7f7f9] text-gray-700 pt-16 pb-10 mt-20">

                {/* ====== 상단 : 지도 + 정보 ====== */}
                <div className="max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-14">

                    <div className="col-span-2 w-full h-80 bg-gray-200 rounded-xl overflow-hidden shadow-lg">
                        <iframe
                            title="clinic-map"
                            className="w-full h-full"
                            src="https://maps.google.com/maps?q=선릉역&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        ></iframe>
                    </div>

                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-gray-900">
                            대표번호 <span className="text-blue-600 ml-2">전화 상담·예약</span>
                        </h2>

                        <p className="text-3xl font-bold text-blue-600">02.1234.5678</p>

                        <div className="border-t border-gray-300 pt-4">
                            <h3 className="font-semibold text-gray-900 mb-2">진료시간</h3>
                            <p>평일 <span className="float-right">AM 10:00 - PM 06:00</span></p>
                            <p>토요일 <span className="float-right">AM 10:00 - PM 03:00</span></p>
                            <p>야간진료(월/금) <span className="float-right">AM 10:00 - PM 08:00</span></p>
                        </div>

                        <div className="border-t border-gray-300 pt-4 text-sm leading-relaxed text-gray-600">
                            <p>서울 강남구 테헤란로 312 </p>
                            <p>3층 / 5층 / 7층 / 11층 / 16층 / 17층</p>
                            <p>(역삼동 123-4, 타워타워)</p>
                            <p>선릉역 4번출구 도보 4분</p>
                        </div>
                    </div>
                </div>


                {/* ====== 하단 info ====== */}
                <div className="max-w-6xl mx-auto px-6 md:px-10 mt-16 pt-10 border-t border-gray-300 flex flex-col md:flex-row justify-between gap-10">

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">MediSync Clinic</h2>
                        <p className="text-sm">의료기관명칭 : MediSync 클리닉</p>
                        <p className="text-sm">대표자명 : 성예찬</p>
                        <p className="text-sm">사업자등록번호 : 123-45-67890</p>
                        <p className="text-sm">대표번호 : 02-0000-0000</p>
                        <p className="text-sm">© 2025 MediSync. All Rights Reserved.</p>
                    </div>

                    <div className="flex gap-10 items-start">
                        <div className="flex flex-col items-center">
                            <img src="https://cdn-icons-png.flaticon.com/512/942/942748.png" className="w-10" />
                            <p className="text-xs mt-1">보건복지부</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <img src="https://cdn-icons-png.flaticon.com/512/706/706164.png" className="w-10" />
                            <p className="text-xs mt-1">강남구 협력의료기관</p>
                        </div>
                    </div>

                </div>
            </footer>

        </div>
    );
}
