import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { div, header, option, p } from "framer-motion/client";
import { Star, Type } from "lucide-react";
import { motion, percent, AnimatePresence } from "framer-motion";
export default function DoctorReview() {
  const { adminId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0); //별점
  const [memo, setMemo] = useState("");
  const [eligibleReservations, setEligibleReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reviews, setReviews] = useState([]); //리뷰 목록
  const [stats, setStats] = useState(null);

  const patientId = 1;
  //페이지 뜨자마자 의사 정보 가져오기

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

  const fetchEligibility = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/reviews/eligible/${patientId}/${adminId}`
      );
      setEligibleReservations(res.data);
      console.log("리뷰 쓸 수 있는 기록", res.data);
    } catch (err) {
      console.error("리뷰가능 리스트 불러오기 실패", err);
    }
  };

  //리뷰 가져오기
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/reviews/list/${adminId}`
      );
      setReviews(res.data);
      console.log("리뷰 : ", res.data);
    } catch (err) {
      console.error("리뷰 조회 가져오기 실패", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/reviews/rating/${adminId}`
      );
      setStats(res.data);
      console.log("별점 : ", res.data);
    } catch (err) {
      console.error("평점 불러오기 실패", err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStats();
    fetchReviews();
    fetchEligibility();
  }, []);

  //리뷰 제출
  const handleSubmitReview = async () => {
    try {
      const res = await axios.post(`http://localhost:8080/api/reviews`, {
        adminId,
        rating,
        memo,
        patientId: 1,
        typeId: selectedReservation.typeId, //실제 예약 키
        type: selectedReservation.type,
      });
      alert("리뷰가 등록되었습니다!");
      setShowModal(false);
      setRating(0);
      setMemo("");
      setSelectedReservation(null);
      fetchEligibility();
      fetchReviews();
    } catch (err) {
      console.error("리뷰 제출 오류 발생", err);
      alert("리뷰 제출 오류 발생", err);
    }
  };

  // 로딩중
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

        {/*리뷰 작성 버튼*/}
        {eligibleReservations.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded_lg shadow cursor-pointer"
          >
            리뷰 작성
          </button>
        )}
        {/*평점 요약*/}
        {stats ? (
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-400">
                {stats.avgRating.toFixed(1)}
              </p>
              <p className="text-gray-500 mt-2">총 {stats.total}명 후기</p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats[`rating${star}Count`];
                const percent = stats.total ? (count / stats.total) * 100 : 0;
                const labels = {
                  5: "매우 만족",
                  4: "만족",
                  3: "보통",
                  2: "불만족",
                  1: "매우 불만족",
                };
                return (
                  <div key={star} className="flex items-center gap-4">
                    <span className="w-24 text-sm text-gray-600">
                      {labels[star]}
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
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-10">아직 별점 통계가 없습니다.</p>
        )}

        {/*후기 목록*/}
        <div className="space-y-6 border-t pt-6">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.reviewId}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      ></Star>
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">{r.title}</span>
                </div>
                <p className="mt-3 text-gray-700">{r.memo}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {r.name} • {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">등록된 후기가 없습니다.</p>
          )}
        </div>

        {/*리뷰 작성 모달*/}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <h3 className="text-xl font-semibold mb-4">리뷰 작성</h3>

                {/*리뷰 선택*/}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    진료 선택
                  </label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={selectedReservation?.typeId || ""}
                    onChange={(e) => {
                      const selected = eligibleReservations.find(
                        (item) => item.typeId === Number(e.target.value)
                      );
                      setSelectedReservation(selected);
                    }}
                  >
                    <option value="">진료기록을 선택하세요.</option>
                    {eligibleReservations.map((item) => (
                      <option key={item.typeId} value={item.typeId}>
                        [{item.type}] {item.name || "이름 없음"}(
                        {new Date(item.date).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/*별점 선택 */}
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => {
                    const value = i + 1;
                    return (
                      <button
                        key={value}
                        onClick={() => setRating(value)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors duration-200 ${
                            value <= rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/*메모 입력 */}
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full border rounded-lg p-3 h-28 resize-none"
                  placeholder="의사에 대한 후기를 입력해주세요."
                ></textarea>

                {/*버튼 영역 */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setRating(0);
                      setMemo("");
                    }}
                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                  >
                    취소
                  </button>

                  <button
                    onClick={handleSubmitReview}
                    className={`px-4 py-2 rounded-lg text-white transition-colors duration-200
                    ${
                      rating === 0 || memo.trim() === ""
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    disabled={rating === 0 || memo.trim() === ""}
                  >
                    등록
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
