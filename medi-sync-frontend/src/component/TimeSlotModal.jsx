import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TimeSlotModal({ testCode, testDate, open, onClose, onSelectTime, mode = "select" }) {
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [loading, setLoading] = useState(false);

    const defaultTimes = [
        "09:00", "09:30", "10:00", "10:30", "11:00",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
    ];

    // ✅ 예약 가능 여부 조회
    useEffect(() => {
        if (!open || !testDate) return;
        console.log("🧩 testCode:", testCode, "testDate:", testDate); // ✅ 이거 추가
        setLoading(true);

        Promise.all(
            defaultTimes.map(time =>
                axios
                    .get("http://192.168.0.24:8080/api/testSchedule/check", {
                        params: { testCode, testDate, testTime: time }
                    })
                    .then(res => ({
                        time,
                        available: res.data.available
                    }))
                    .catch(() => ({ time, available: false })) // 실패 시 비활성화
            )
        )
            .then(results => setTimeSlots(results))
            .catch(err => console.error("❌ 시간대 조회 실패:", err))
            .finally(() => setLoading(false));
    }, [open, testDate, testCode]);

    // ✅ 시간 선택
    const handleSelect = (time) => {
        setSelectedTime(time);
    };

    // ✅ 선택 완료 처리 (수정 모드일 경우 상위 전달)
    const handleConfirm = async () => {
        if (!selectedTime) return alert("시간을 선택하세요.");

        if (mode === "reserve") {
            // ✅ 신규 예약 모드일 때는 DB에 바로 반영
            try {
                const res = await axios.post("http://192.168.0.24:8080/api/testSchedule/reserve", {
                    testCode,
                    testDate,
                    testTime: selectedTime + ":00"
                });
                alert(res.data.message);
                onClose();
            } catch (err) {
                console.error("❌ 예약 실패:", err);
                alert("예약 처리 중 오류 발생");
            }
        } else {
            // ✅ 수정 모드일 때는 상위로만 전달
            if (onSelectTime) onSelectTime(selectedTime);
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-96 p-6 animate-fade-in">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    {testDate} 예약 가능한 시간
                </h2>

                {loading ? (
                    <p className="text-center text-gray-500">⏳ 불러오는 중...</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot.time}
                                onClick={() => handleSelect(slot.time)}
                                disabled={!slot.available}
                                className={`rounded-md py-2 text-sm font-medium border transition 
                                    ${selectedTime === slot.time
                                    ? "bg-green-600 text-white"
                                    : slot.available
                                        ? "bg-gray-100 hover:bg-green-100 text-gray-800"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                    >
                        닫기
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedTime}
                        className={`px-4 py-2 rounded-md text-white transition 
                            ${selectedTime
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {mode === "reserve" ? "예약하기" : "선택 완료"}
                    </button>
                </div>
            </div>
        </div>
    );
}
