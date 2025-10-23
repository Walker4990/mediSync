import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Footer from "../../component/Footer";
import Navbar from "../../component/Navbar";

const API_BASE_URL = "http://192.168.0.24:8080/api/doctors";

// 가상의 진료 과목 목록 (테이블 참고)
const departments = [
  "전체 과목",
  "내과",
  "정형외과",
  "산부인과",
  "소아청소년과",
  "이비인후과",
  "가정의학과",
];

const DoctorList = ({
  doctors,
  handleReservationClick,
  apiError,
  selectedDept,
  handleSelectDept,
  isDeptDropdownOpen,
  setIsDeptDropdownOpen,
}) => {
  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-lg">
      {/* 상단 제목 및 필터 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">의사 목록</h2>

        {/* 과목 선택 드롭다운 */}
        <div className="flex items-center space-x-3">
          <label className="text-base font-medium text-gray-700 whitespace-nowrap">
            진료 과목
          </label>
          <div className="relative w-60">
            <button
              type="button"
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className={`w-full py-2 px-3 border rounded-lg text-left transition-all ${
                selectedDept === departments[0]
                  ? "text-gray-400 border-gray-400"
                  : "border-gray-300 text-gray-800"
              } hover:border-blue-500 flex justify-between items-center`}
            >
              {selectedDept}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {departments.map((dept) => (
                  <div
                    key={dept}
                    onClick={() => handleSelectDept(dept)}
                    className="px-3 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    {dept}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API 연결 오류 경고 메시지 */}
      {apiError && (
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6 text-sm"
          role="alert"
        >
          <strong className="font-bold">데이터 로드 실패:</strong>
          <span className="block sm:inline">
            서버 연결 문제로 인해 가상의 의사 데이터(Mock Data)를 표시합니다.{" "}
          </span>
        </div>
      )}

      {/* 의사 목록 */}
      <div className="space-y-4 divide-y divide-gray-200">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div
              key={doctor.doctorId}
              className="flex justify-between items-start pt-4"
            >
              {/* (좌측) 의사 정보 */}
              <div className="flex-grow space-y-1">
                <p className="text-sm text-gray-500">{doctor.department}</p>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {doctor.doctorName}
                  </h3>
                  {/* 별점 표시 - review 테이블에서 rating + count 추출 */}
                  <span className="text-yellow-500 text-sm font-semibold flex items-center">
                    ★3.5 (100+)
                    {/* ★{doctor.rating} ({doctor.reviewCount}+) */}
                  </span>
                </div>

                {/* 스케쥴 테이블 반영 */}
                <p className="text-green-500 font-semibold text-xs">
                  10/23 (THU) 10:00 ~ 14:00
                </p>

                {/* 클릭 시 타임 모달 */}
                <button
                  className="mt-2 text-blue-600 border border-blue-600 text-sm px-3 py-1 rounded-md hover:bg-blue-50 transition"
                  onClick={() => handleReservationClick(doctor)}
                >
                  예약하기
                </button>
              </div>

              {/* (우측) 이미지 영역 + 계정 데이터 img 경로 추출 */}
              <div className="flex-shrink-0 ml-4">
                {/* <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                    이미지 첨부
                  </div>
                </div> */}
                <img src="/doctor1.png" width={120} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-10 text-gray-500 italic">
            현재 예약 가능한 의사 정보가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

// 현재 날짜를 기준으로 7일 간의 날짜 배열을 생성
const getNextSevenDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      dateString: date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      }), // 예: 10월 23일
      dayOfWeek: date.toLocaleDateString("ko-KR", { weekday: "short" }), // 예: 목
      dateValue: date.toISOString().split("T")[0], // 예: 2025-10-23
      isToday: i === 0,
    });
  }
  return days;
};

const TimeModal = ({ isVisible, onClose, selectedDoctor }) => {
  // 1. 상태 관리
  const sevenDays = useMemo(() => getNextSevenDays(), []);
  const [selectedDate, setSelectedDate] = useState(sevenDays[0].dateValue);
  const [selectedTime, setSelectedTime] = useState(null);

  // 2. 가상의 예약 시간
  const availableTimes = useMemo(() => {
    return [
      "09:00~10:00",
      "10:00~11:00",
      "11:00~12:00",
      "12:00~13:00",
      "13:00~14:00",
      "14:00~15:00",
      "15:00~16:00",
      "16:00~17:00",
      "17:00~18:00",
    ];
  }, [selectedDate]);

  if (!isVisible || !selectedDoctor) return null;

  // 3. 이벤트 핸들러
  const handleSelectTime = (time) => setSelectedTime(time);

  const handleNextStep = () => {
    // if (selectedDeptFromParent === departments[0]) {
    //   alert("진료 과목을 선택해주세요.");
    //   return;
    // }
    if (!selectedTime) {
      alert("진료 시간을 선택해주세요.");
      return;
    }
    alert(
      `담당자 : ${selectedDoctor.department} / ${selectedDoctor.doctorName} 의사 \n일정 : ${selectedDate} ${selectedTime} 을 선택하였습니다.`
    );
    onClose();
  };

  const handleClose = () => {
    // 모달 종료 시 선택값 초기화
    setSelectedDate(sevenDays[0].dateValue);
    setSelectedTime(null);
    onClose();
  };

  return (
    // 모달 오버레이
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      {/* 모달 내용 컨테이너 */}
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 p-6 shadow-2xl relative">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          예약 시간 선택
        </h2>

        {/* 선택된 의사 표시 */}
        <div className="mb-6 bg-blue-50 border border-blue-200 p-3 rounded-lg text-center text-blue-700">
          <span className="font-normal">
            {selectedDoctor.department} {selectedDoctor.doctorName} 의사 → 진료
            시간을 선택해 주세요.
          </span>
        </div>

        {/* 날짜 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            진료 날짜
          </label>
          <div className="flex overflow-x-auto space-x-3 p-1">
            {sevenDays.map((day) => (
              <button
                key={day.dateValue}
                onClick={() => {
                  setSelectedDate(day.dateValue);
                  setSelectedTime(null); // 날짜 변경 시 시간 초기화
                }}
                className={`flex-shrink-0 w-20 py-2 rounded-lg text-center border-2 transition-all duration-200 ${
                  selectedDate === day.dateValue
                    ? "bg-blue-500 text-white border-blue-600 font-bold shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-100"
                }`}
              >
                {day.isToday ? "오늘" : day.dayOfWeek}
                <div className="text-xs">{day.dateString}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 예약 시간 그리드 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleSelectTime(time)}
              className={`py-3 px-1 rounded-lg text-sm transition-all duration-200 
                                ${
                                  selectedTime === time
                                    ? "bg-blue-500 text-white font-bold shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }
                                border border-gray-200
                            `}
            >
              {time.split("~")[0]}
              <br />
              <span className="text-xs opacity-80">~{time.split("~")[1]}</span>
            </button>
          ))}
        </div>

        {/* 하단 버튼 */}
        <button
          onClick={handleNextStep}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition"
        >
          진료 신청서 작성하기
        </button>
      </div>
    </div>
  );
};

export default function MedicalConsult() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const [apiError, setApiError] = useState(false); // API 오류 상태 추가

  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // 데이터 조회
  const fetchDoctors = async () => {
    setIsLoading(true);
    setApiError(false);

    const res = await axios.get(API_BASE_URL);
    try {
      setDoctors(res.data);
    } catch (err) {
      console.error("의사 조회 실패:", err);
      setApiError(true);
      setDoctors(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로딩
  useEffect(() => {
    fetchDoctors();
  }, []);

  // 선택된 과목에 따라 의사 목록 필터링
  const filteredDoctors = useMemo(() => {
    // '전체 과목'이 선택되면 모든 의사를 반환
    if (selectedDept === departments[0]) {
      return doctors;
    }
    // 선택된 과목과 일치하는 의사만 필터링하여 반환
    return doctors.filter((doctor) => doctor.department === selectedDept);
  }, [doctors, selectedDept]); // doctors 배열과 선택된 과목이 바뀔 때만 재계산

  // 이벤트 핸들러
  const handleReservationClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  // 드롭다운 선택 핸들러
  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setIsDeptDropdownOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-blue-600">의사 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-pretendard">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-8">
        <div className="flex justify-center">
          <DoctorList
            doctors={filteredDoctors}
            handleReservationClick={handleReservationClick}
            apiError={apiError}
            selectedDept={selectedDept}
            handleSelectDept={handleSelectDept}
            isDeptDropdownOpen={isDeptDropdownOpen}
            setIsDeptDropdownOpen={setIsDeptDropdownOpen}
          />
        </div>
      </main>
      {/* 예약 모달 */}
      <TimeModal
        isVisible={isModalOpen}
        onClose={handleCloseModal}
        selectedDeptFromParent={selectedDept}
        selectedDoctor={selectedDoctor}
      />
      <Footer />
    </div>
  );
}
