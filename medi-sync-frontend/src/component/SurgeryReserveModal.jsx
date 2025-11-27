import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

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
    const [operationName, setOperationName] = useState("");
    const [operationList, setOperationList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [showList, setShowList] = useState(false);
    const [anesthesiaType, setAnesthesiaType] = useState("");
    const defaultTimes = [
        "09:00", "09:30", "10:00", "10:30", "11:00",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
    ];
    const [duration, setDuration] = useState(0);
    const token = localStorage.getItem("admin_token");
    const decoded = token ? jwtDecode(token) : null;

    const adminId = decoded?.adminId || null;
    useEffect(() => {
        if (open && mode === "surgery"){
            axios.get("http://192.168.0.24:8080/api/operation/cost/list")
                .then(res => setOperationList(res.data))
                .catch(err => console.log(err));
        }
    }, [open, mode]);

    const addMinutes = (time, minutes) => {
        const [h, m] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m + minutes);

        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");

        return `${hh}:${mm}`;
    };

    const handleSelectOperation = (name) => {
        setOperationName(name);
        setShowList(false);

        const op = operationList.find(op => op.operationName === name);
        if (op) setDuration(op.durationMinutes)
    }

    useEffect(() => {
        if(mode !== "surgery" || !selectedTime || duration == 0 ) return;
        const endTime = addMinutes(selectedTime, duration);
        const updated = timeSlots.map(slot => ({
            ...slot, available: slot.time >= selectedTime && slot.time < endTime
            ? false : slot.available
        }));
        setTimeSlots(updated);
    }, [selectedTime, duration]);
    const handleOperationInput = (value) => {
        setOperationName(value);

        if (!value.trim()) {
            setFilteredList([]);
            setShowList(false);
            return;
        }
        const filtered = operationList
                .filter(op => op.operationName.toLowerCase()
                .includes(value.toLowerCase()));
        setFilteredList(filtered);
        setShowList(true);
    }



    // ✅ 날짜 변경 시 예약 가능 시간 조회
    useEffect(() => {
        if (!open || !date) return;

        setLoading(true);
        Promise.all(
            defaultTimes.map(time =>
                axios
                    .get(
                        mode === "test"
                            ? "http://192.168.0.24:8080/api/testSchedule/check"
                            : "http://192.168.0.24:8080/api/operation/check", // ✅ 수정 ①
                        {
                            params:
                                mode === "test"
                                    ? {
                                        testCode: test.testCode,
                                        testDate: date,
                                        testTime: time,
                                    }
                                    : {
                                        scheduledDate: date,
                                        scheduledTime: time,
                                        roomId: 1,
                                    },
                        }
                    )
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
    }, [date, open, test.testCode, mode]);

    // ✅ 시간 선택
    const handleSelectTime = (time) => {
        setSelectedTime(time);
    };

    // ✅ 예약 저장
    const handleReserve = async () => {
        if (!date || !selectedTime)
            return alert("날짜와 시간을 선택하세요.");

        if (mode === "surgery" && !operationName.trim())
            return alert("수술명을 입력하세요."); //  추가

        const url =
            mode === "test"
                ? "http://192.168.0.24:8080/api/testSchedule/reserve"
                : "http://192.168.0.24:8080/api/operation/reserve";

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
                    adminId,
                    patientId: test.patientId,
                    operationName: operationName || "수술",
                    scheduledDate: date,
                    scheduledTime: selectedTime + ":00",
                    anesthesiaType : anesthesiaType || null,
                    roomId: 1,
                    cost: 1000000,
                };
        console.log("🧩 예약 전 payload:", payload);
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
                    {mode === "test" ? `🧪 ${test.testName} 예약` : `🏥 ${test.operationName || "수술"} 예약`}
                </h3>

                {/* 날짜 선택 */}
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

                {/* 시간대 표시 */}
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
                    ${
                                        selectedTime === slot.time
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

                {mode === "surgery" && (
                    <div className="mb-4 relative">
                        <label className="block text-gray-700 text-sm mb-1">수술명 입력</label>
                        <input
                            type="text"
                            value={operationName}
                            onChange={(e) => handleOperationInput(e.target.value)}
                            placeholder="예: 백내장, 위 절제술, 갑상선 수술"
                            className="border rounded p-2 w-full"
                        />

                        {/* 자동완성 리스트 */}
                        {showList && filteredList.length > 0 && (
                            <ul className="absolute z-20 bg-white border rounded w-full max-h-40 overflow-y-auto shadow-md mt-1">
                                {filteredList.map((op, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSelectOperation(op.operationName)}
                                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                                    >
                                        {op.operationName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                )}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm mb-1">마취 유형</label>
                    <select
                        value={anesthesiaType}
                        onChange={(e) => setAnesthesiaType(e.target.value)}
                        className="border rounded p-2 w-full"
                    >
                        <option value="">선택</option>
                        <option value="GENERAL">전신 마취</option>
                        <option value="SEDATION">수면 마취</option>
                        <option value="LOCAL">국소 마취</option>
                    </select>
                </div>
                {/* 버튼 */}
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="text-gray-500">
                        취소
                    </button>
                    <button
                        onClick={handleReserve}
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                        disabled={!date || !selectedTime || (mode === "surgery" && !operationName.trim())}
                    >
                        예약 저장
                    </button>
                </div>
            </div>
        </div>
    );
}
