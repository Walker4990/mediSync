import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import TimeSlotModal from "./TimeSlotModal";

export default function PrescriptionModal({ visible, onClose, onSave, patient }) {
    const [form, setForm] = useState({
        type: "DRUG",
        itemName: "",
        dosage: "",
        duration: "",
        unit: "",
        notes: "",
        testArea: "",
        testDate: "",
    });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);


    useEffect(() => {
        if (visible) {
            setForm({
                type: "DRUG",
                itemName: "",
                dosage: "",
                duration: "",
                unit: "",
                notes: "",
                testArea: "",
                testDate: "",
            });
        }
    }, [visible]);

    if (!visible || !patient) return null;

    // 🔍 자동완성 검색
    const fetchSuggestions = async (keyword, category) => {
        if (!keyword.trim()) return;
        try {
            const urlMap = {
                drug: "http://192.168.0.24:8080/api/drug/search",
                test: "http://192.168.0.24:8080/api/testFee/search",
                injection: "http://192.168.0.24:8080/api/drug/search",
            };
            const params =
                category === "injection"
                    ? { keyword, type: "INJECTION" }
                    : { keyword };

            const res = await axios.get(urlMap[category], { params });
            setSuggestions(res.data);
            setShowSuggestions(true);
            console.log("✅ 검색 결과:", res.data);
        } catch (err) {
            console.error(`❌ ${category} 검색 실패:`, err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === "itemName") {
            if (form.type === "DRUG") fetchSuggestions(value, "drug");
            else if (form.type === "TEST") fetchSuggestions(value, "test");
            else if (form.type === "INJECTION") fetchSuggestions(value, "injection");
        }
    };

    const handleSelectSuggestion = (item) => {
        setForm((prev) => ({
            ...prev,
            itemName: item.drugName || item.testName || "",
            unit: item.unit || "",
            dosage: item.defaultDosage || "",
        }));
        setShowSuggestions(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <FaTimes className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold text-gray-800 mb-2">💊 처방 등록</h2>
                <p className="text-sm text-gray-600 mb-4">
                    환자명: <span className="font-semibold">{patient.name}</span> / 병실: {patient.roomNo || "-"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ✅ 처방 구분 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">처방 구분</label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="DRUG">약품</option>
                            <option value="TEST">검사</option>
                            <option value="INJECTION">주사</option>
                        </select>
                    </div>

                    {/* ✅ 공통 항목명 + 자동완성 */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {form.type === "TEST" ? "검사명" : form.type === "INJECTION" ? "주사명" : "약품명"}
                        </label>
                        <input
                            type="text"
                            name="itemName"
                            value={form.itemName}
                            onChange={handleChange}
                            placeholder="이름 입력 (자동완성)"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                        />
                        {showSuggestions && Array.isArray(suggestions) && suggestions.length > 0 && (
                            <ul className="absolute bg-white border rounded-md shadow-md mt-1 w-full max-h-48 overflow-y-auto text-sm z-50">
                                {suggestions.map((item, index) => (
                                    <li
                                        key={`${item.testCode || item.drugCode || index}`}
                                        onClick={() => handleSelectSuggestion(item)}
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                    >
                                        {form.type === "TEST"
                                            ? `${item.testName} (${item.basePrice?.toLocaleString()}원)`
                                            : `${item.drugName || item.itemName || "이름없음"} ${
                                                item.unit ? `(${item.unit})` : ""
                                            }`}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ✅ 타입별 입력 폼 */}
                    {form.type === "DRUG" && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="dosage"
                                    value={form.dosage}
                                    onChange={handleChange}
                                    placeholder="용량 (예: 1)"
                                    className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                                />
                                <input
                                    type="text"
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleChange}
                                    placeholder="기간(일)"
                                    className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <input
                                type="text"
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                placeholder="단위 (정/병)"
                                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                            />
                        </>
                    )}

                    {form.type === "INJECTION" && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="dosage"
                                    value={form.dosage}
                                    onChange={handleChange}
                                    placeholder="투여량 (ml)"
                                    className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                                />
                                <input
                                    type="text"
                                    name="unit"
                                    value={form.unit}
                                    onChange={handleChange}
                                    placeholder="단위 (ml/회)"
                                    className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </>
                    )}

                    {form.type === "TEST" && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="testArea"
                                    value={form.testArea}
                                    onChange={handleChange}
                                    placeholder="검사 부위 (예: 폐, 위)"
                                    className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                                />
                                <input
                                    type="date"
                                    name="testDate"
                                    value={form.testDate}
                                    onChange={handleChange}
                                    className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!form.testDate) return alert("먼저 검사 날짜를 선택하세요.");
                                    if (!form.itemName) return alert("먼저 검사명을 선택하세요.");
                                    setShowTimeModal(true);
                                }}
                                className="mt-2 w-full bg-green-500 text-white py-2 rounded-md text-sm hover:bg-green-600"
                            >
                                시간 선택
                            </button>
                        </>
                    )}


                    {/* ✅ 비고 */}
                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="특이사항 (선택)"
                        rows="2"
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    />

                    {/* ✅ 버튼 */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-100"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                            저장
                        </button>
                    </div>
                </form>

            </div>
            <TimeSlotModal
            open={showTimeModal}
            testCode={suggestions.find(s => s.testName === form.itemName)?.testCode || ""}
            testDate={form.testDate}
            mode="reserve"
            onClose={() => setShowTimeModal(false)}
            onSelectTime={(time) => {
                setSelectedTime(time);
                setForm((prev) => ({ ...prev, testTime: time }));
            }}
        />
        </div>
    );
}
