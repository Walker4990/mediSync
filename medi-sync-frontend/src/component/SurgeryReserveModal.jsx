import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ReserveModal({
                                         open,
                                         onClose,
                                         test = {},
                                         mode = "test", // "test" or "surgery"
                                     }) {
    const [date, setDate] = useState("");
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [loading, setLoading] = useState(false);

    const defaultTimes = [
        "09:00", "09:30", "10:00", "10:30", "11:00",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
    ];

    // ✅ 날짜 변경 시 예약 가능 시간 조회
    useEffect(() => {
        if (!open || !date) return;

        setLoading(true);
        Promise.all(
            defaultTimes.map(time =>
                axios
                    .get("http://192.168.0.24:8080/api/testSchedule/check", {
                        params: {
                            testCode: test.testCode,
                            testDate: date,
                            testTime: time
                        },
                    })
                    .then(res => ({
                        time,
                        available: res.data.available,
                    }))
                    .catch(() => ({ time, available: false }))
            )
        )
            .then(results => setTimeSlots(results))
            .catch(err => console.error("❌ 시간 조회 실패:", err))
            .finally(() => setLoading(false));
    }, [date, open, test.testCode]);

    // ✅ 시간 클릭
    const handleSelectTime = (time) => {
        setSelectedTime(time);
    };

    // ✅ 예약 저장
    const handleReserve = async () => {
        if (!date || !selectedTime) return alert("날짜와 시간을 선택하세요.");

        const url =
            mode === "test"
                ? "http://192.168.0.24:8080/api/testSchedule/reserve"
                : "http://192.168.0.24:8080/api/surgery/reserve";

        const payload =
            mode === "test"
                ? {
                    testCode: test.testCode,
                    testDate: date,
                    testTime: selectedTime,
                    patientId: test.patientId,
                }
                : {
                    recordId: test.recordId,
                    doctorId: test.doctorId,
                    patientId: test.patientId,
                    surgeryName: test.testName || "수술",
                    surgeryDate: date,
                    surgeryTime: selectedTime,
                    operationRoom: "OR-1",
                };

        try {
            await axios.post(url, payload);
            alert(`✅ ${mode === "test" ? "검사" : "수술"} 예약 완료!`);
            onClose();
        } catch (err) {
            console.error("❌ 예약 실패:", err);
            alert("예약 처리 중 오류 발생");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg animate-fade-in">
                <h3 className="text-lg font-bold text-blue-600 mb-4 text-center">
                    {mode === "test" ? `🧪 ${test.testName} 예약` : `🏥 ${test.testName} 수술 예약`}
                </h3>

                {/* ✅ 날짜 선택 */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm mb-1">날짜 선택</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                            setDate(e.target.value);
                            setSelectedTime(null);
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className="border rounded p-2 w-full"
                    />
                </div>

                {/* ✅ 시간대 표시 */}
                <div>
                    <label className="block text-gray-700 text-sm mb-2">시간 선택</label>
                    {loading ? (
                        <p className="text-center text-gray-500 py-4">⏳ 시간대 불러오는 중...</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot.time}
                                    onClick={() => handleSelectTime(slot.time)}
                                    disabled={!slot.available}
                                    className={`rounded-md py-2 text-sm font-medium border transition
                                        ${selectedTime === slot.time
                                        ? "bg-blue-600 text-white"
                                        : slot.available
                                            ? "bg-gray-100 hover:bg-blue-100 text-gray-800"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ✅ 버튼 */}
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="text-gray-500">
                        취소
                    </button>
                    <button
                        onClick={handleReserve}
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                        disabled={!date || !selectedTime}
                    >
                        예약 저장
                    </button>
                </div>
            </div>
        </div>
    );
}
