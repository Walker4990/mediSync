import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Reservation() {
  //일단 냅두기
  const [form, setForm] = useState({
    name: "",
    userId: "",
    password: "",
    residentFront: "",
    residentBack: "",
    phone: "",
    address: "",
    consentInsurance: false,
    reservationDate: "",
    reservationTime: "",
  });

  //예약된 시간을 가져오는 리스트
  const [reservedTimes, setReservedTimes] = useState([]);

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 숫자만 허용할 필드 목록
    const numericFields = ["residentFront", "residentBack", "phone"];

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : numericFields.includes(name)
          ? value.replace(/\D/g, "") // 숫자만
          : value, // 일반 문자 입력 허용
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 예약 날짜 선택 (간단히 텍스트로 넣는 예시)
  const handleDateChange = (e) => {
    setForm({ ...form, reservationDate: e.target.value });
  };

  //예약 날짜가 바뀔때마다 해당 날짜 시간 목록 백에서 가져오기
  useEffect(() => {
    //값이 없으면 리스트 비워두기
    if (!form.reservationDate) {
      setReservedTimes([]);
      return;
    }
    //보내기
    const fetchReservedTimes = async () => {
      try {
        const response = await axios.get(
          //http://192.168.0.24:8080 여기로 보내면 테스트가 안돼서
          //잠시 localhost 사용
          `http://localhost:8080/api/reservation/getReservationList?date=${form.reservationDate}`
        );
        console.log(response.data);
        setReservedTimes(response.data);
      } catch (error) {
        //실패시 리스트 비워두기
        console.error("예약한 시간 불러오기 싷패", error);
        setReservedTimes([]);
      }
    };
    fetchReservedTimes();
  }, [form.reservationDate]);

  // 예약 시간 선택
  const handleTimeSelect = (time) => {
    setForm({ ...form, reservationTime: time });
    closeModal();
  };

  // 클릭 시 예약하기
  const handleSubmit = async (e) => {
    e.preventDefault();
    const residentNo = `${form.residentFront}-${form.residentBack}`;

    if (!form.reservationDate || !form.reservationTime) {
      alert("예약 날짜와 시간을 선택해주세요.");
      return;
    }

    const dataToSend = {
      name: form.name,
      residentNo,
      phone: form.phone,
      address: form.address,
      consentInsurance: form.consentInsurance,
      userId: form.userId,
      password: form.password,
      reservationDate: form.reservationDate,
      reservationTime: form.reservationTime,
    };

    try {
      const res = await axios.post(
        "http://192.168.0.24:8080/api/Reservation/reservation",
        dataToSend
      );

      if (res.data.success) {
        alert(res.data.message); // ✅ 서버에서 내려준 메시지
        setForm({
          name: "",
          userId: "",
          password: "",
          residentFront: "",
          residentBack: "",
          phone: "",
          address: "",
          consentInsurance: false,
        });
      } else {
        alert("⚠️ 등록 실패: " + res.data.message);
      }
    } catch (err) {
      alert(" 네트워크 오류: " + err.message);
    }
  };
  //예약 날짜 리스트
  const availableTimes = [
    "09:00",
    "09:20",
    "09:40",
    "10:00",
    "10:20",
    "10:40",
    "11:00",
    "11:20",
    "11:40",
    "13:00",
    "13:20",
    "13:40",
    "14:00",
    "14:20",
    "14:40",
    "15:00",
    "15:20",
    "15:40",
    "16:00",
    "16:20",
    "16:40",
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 font-pretendard">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          예약
        </h2>

        {/* 이름 */}
        <label className="block mb-4">
          <span className="block text-gray-700 mb-1">이름</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
          />
        </label>
        {/* 전화번호 */}
        <label className="block mb-4">
          <span className="block text-gray-700 mb-1">전화번호</span>
          <input
            type="text"
            name="phone"
            value={form.phone}
            placeholder="010-0000-0000"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
          />
        </label>
        {/* 예약 날짜 */}
        <label className="block mb-4">
          <span className="block text-gray-700 mb-1">예약 날짜</span>
          <input
            type="date"
            name="reservationDate"
            value={form.reservationDate}
            onChange={handleDateChange}
            className="w-full bg-white text-black py-1.5 rounded-md font-semibold hover:bg-gray-400 hover:text-white"
          />
        </label>

        {/* 예약 시간 선택 버튼 */}
        <label className="block mb-4">
          <span className="block text-gray-700 mb-1">예약 시간</span>
          <button
            type="button"
            onClick={openModal}
            disabled={!form.reservationDate}
            className="w-full bg-white border px-3 py-2 rounded-md font-semibold hover:bg-gray-400 hover:text-white"
          >
            {form.reservationTime
              ? `선택된 시간: ${form.reservationTime}`
              : "예약 시간 선택"}
          </button>
        </label>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold"
        >
          예약하기
        </button>
      </form>
      {/* 모달 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg p-6 w-80"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
          >
            <h3 className="text-xl font-bold mb-4">예약 시간 선택</h3>
            <div className="grid grid-cols-3 gap-3">
              {availableTimes.map((time) => {
                // 해당 시간이 이미 예약된 시간인지 체크
                const isReserved = reservedTimes.includes(time);
                return (
                  <button
                    key={time}
                    onClick={() => !isReserved && handleTimeSelect(time)}
                    disabled={isReserved}
                    className={`py-2 rounded-md ${
                      isReserved
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 w-full py-2 border rounded-md hover:bg-gray-200"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
