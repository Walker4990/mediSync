import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { div, header } from "framer-motion/client";
import { Star } from "lucide-react";
import { motion, percent } from "framer-motion";
export default function DoctorReview() {
  const { adminId } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/doctors/review/${adminId}`
        );
        setDoctor(res.data);
      } catch (error) {
        console.error("의사정보 불러오기 실패", error);
      }
    };
    fetchDoctor();
  }, [adminId]);

  if (!doctor)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-blue-600">의사 목록을 불러오는 중...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/*의사 정보 카드*/}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/*왼쪽 정보 */}
          <div className="flex-1 space-y-3">
            <h1 className="text-2xl font-bold text-gray-800">
              {doctor.name} 의사
            </h1>
            <p className="text-gray-600">진료 과목: {doctor.deptName}</p>
            <p className="text-gray-600">설명: {doctor.description}</p>
            <p className="text-gray-600">이메일: {doctor.email}</p>
            <p className="text-gray-600">휴대폰: {doctor.phone}</p>
            <p className="text-gray-600">
              진료비용:{" "}
              <span className="font-semibold text-blue-600">
                {doctor.consultFee?.toLocaleString()}원
              </span>
            </p>

            <p className="text-gray-600">
              보험 적용률: {doctor.insuranceRate ?? 0}%
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <img
              src={doctor.profileImgUrl || "/doctor1.png"}
              alt={`${doctor.name} 의사`}
              className="w-40 h-40 rounded-full object-cover shadow-md border"
            />
          </div>
        </div>
      </div>
      {/*리뷰 섹션*/}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Star className="text-yellow-400 w-6 h-6 fill-yellow-400" />
          진료 후기
        </h2>
        {/*평점 요약*/}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="text-center">
            <p className="text-5xl font-bold text-yellow-400">4.9</p>
            <p className="text-gray-500 mt-2">총 5,518명 후기</p>
          </div>

          <div className="flex-1 space-y-2">
            {[
              { label: "매우 만족", value: 5358 },
              { label: "만족", value: 119 },
              { label: "보통", value: 21 },
              { label: "불만족", value: 5 },
              { label: "매우 불만족", value: 15 },
            ].map((item, idx) => {
              const max = 5358;
              const percent = (item.value / max) * 100;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-gray-600">
                    {item.label}
                  </span>
                  {/*배경 흰색 막대*/}
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    {/*실제 채워지는 부분*/}
                    <motion.div
                      className="bg-yellow-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    ></motion.div>
                  </div>

                  <span className="text-sm text-gray-500 w-10 text-right">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {/*후기 예시*/}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"></Star>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"></Star>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"></Star>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"></Star>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"></Star>
            </div>
            <span className="text-gray-400 text-sm"> 비염 코막힘</span>
          </div>
          <p className="mt-3 text-gray-700">
            환자의 요청으로 비공개 처리되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
