import React, { useEffect, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import AdminHeader from "../../component/AdminHeader";
import TimeSlotModal from "../../component/TimeSlotModal"; // ✅ npm install lodash.debounce

export default function MedicalRecordPage() {
    const [form, setForm] = useState({
        patientId: "",
        doctorId: "",
        diagnosis: "",
        totalCost: "",
    });
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [testSuggestions, setTestSuggestions] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTargetIndex, setModalTargetIndex] = useState(null);

    //  이번 진료의 처방 입력 리스트
    const [newPrescriptions, setNewPrescriptions] = useState([
        {
            type: "DRUG",
            drugName: "",
            dosage: "",
            duration: "",
            unit: "",
            unitPrice: "",
            injectionName: "",
            testName: "",
            testArea: "",
            testDate: "",
        },
    ]);

    // 자동완성 관련 상태
    const [drugSuggestions, setDrugSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);

    //  디바운스된 약품/주사 검색 함수
    const searchDrug = debounce(async (keyword, type = null) => {
        if (!keyword || keyword.trim() === "") return setDrugSuggestions([]);
        try {
            const res = await axios.get(`http://192.168.0.24:8080/api/drug/search`, {
                params: { keyword, type }, // ✅ type=null(기본: 일반약), or INJECTION
            });
            setDrugSuggestions(res.data);
        } catch {
            setDrugSuggestions([]);
        }
    }, 300);

    const searchTest = debounce(async (keyword) => {
        if (!keyword || keyword.trim() === "") return setTestSuggestions([]);
        try {
            const res = await axios.get(`http://192.168.0.24:8080/api/testFee/search`, {
                params: { keyword },
            });
            setTestSuggestions(res.data);
        } catch {
            setTestSuggestions([]);
        }
    }, 300);

    // 초기 데이터 로드
    useEffect(() => {
        axios.get("http://192.168.0.24:8080/api/patients").then(res => setPatients(res.data));
        axios.get("http://192.168.0.24:8080/api/doctors").then(res => setDoctors(res.data));
    }, []);

    // 입력 변경
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // 환자 선택 시 과거 진료 내역 로드
        if (name === "patientId" && value) {
            axios.get(`http://192.168.0.24:8080/api/records/patient/${value}`)
                .then(res => setRecords(res.data))
                .catch(() => setRecords([]));

            setPrescriptions([]);
            setSelectedRecord(null);
        }
        //  의사 선택 시 진료비/보험률 자동 조회
        if (name === "doctorId" && value) {
            axios.get(`http://192.168.0.24:8080/api/doctors/fee/${value}`)
                .then(res => {
                    const { consultFee, insuranceRate } = res.data;

                    // 진료비 반영
                    setForm((prev) => ({
                        ...prev,
                        consultFee: consultFee || 0,
                        insuranceRate: insuranceRate || 0.7,
                        totalCost: (prev.totalCost || 0) + (consultFee || 0),
                    }));
                })
                .catch(err => console.error("❌ 진료비 불러오기 실패:", err));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // ① 처방 데이터 정제
            const cleanPrescriptions = newPrescriptions.map((p) => {
                const base = { ...p };

                // 빈 문자열 → null 변환
                Object.keys(base).forEach((k) => {
                    if (base[k] === "") base[k] = null;
                });

                // unitPrice를 숫자형으로 변환
                if (base.unitPrice !== null && base.unitPrice !== undefined) {
                    base.unitPrice = Number(base.unitPrice);
                }

                // type별 불필요한 필드 정리
                if (base.type === "DRUG") {
                    delete base.injectionName;
                    delete base.testName;
                    delete base.testArea;
                    delete base.testDate;
                } else if (base.type === "INJECTION") {
                    delete base.drugName;
                    delete base.duration;
                    delete base.testName;
                    delete base.testArea;
                    delete base.testDate;
                } else if (base.type === "TEST") {
                    delete base.drugName;
                    delete base.dosage;
                    delete base.duration;
                    delete base.injectionName;
                }

                return base;
            });

            // ② 전체 payload 구성
            const payload = {
                patientId: Number(form.patientId),
                doctorId: Number(form.doctorId),
                diagnosis: form.diagnosis,
                totalCost: Number(form.totalCost),
                insuranceAmount: Math.round(Number(form.totalCost) * 0.7),
                patientPay: Math.round(Number(form.totalCost) * 0.3),
                prescriptions: cleanPrescriptions,
            };

            console.log("📤 최종 전송 payload:", payload);

            // ③ 전송
            const res = await axios.post("http://192.168.0.24:8080/api/records", payload, {
                headers: { "Content-Type": "application/json" },
            });
            // 검사 예약
            for (const p of cleanPrescriptions) {
                if (p.type === "TEST" && p.testDate && p.testName) {
                    // ✅ 이미 예약된 경우 (모달에서 선택한 시간 있음) 재예약 금지
                    if (p.isReserved) continue;

                    try {
                        await axios.post("http://192.168.0.24:8080/api/testSchedule/reserve", {
                            testCode: p.testCode,
                            testDate: p.testDate,
                            testTime: p.testTime,
                            patientId: form.patientId,
                        });
                        console.log(`🧾 검사 예약 완료: ${p.testName} (${p.testDate} ${p.testTime})`);
                    } catch (err) {
                        console.warn(`❌ 검사 예약 실패 (${p.testName}):`, err);
                    }
                }
            }
            
            // ④ 결과 처리
            if (res.data.success) {
                alert("✅ 진료 및 처방 등록 완료");

                // 목록 갱신
                const recordRes = await axios.get(
                    `http://192.168.0.24:8080/api/records/patient/${form.patientId}`
                );
                setRecords(recordRes.data);

                // 입력 초기화
                setForm({ ...form, diagnosis: "", totalCost: "" });
                setNewPrescriptions([{ drugName: "", dosage: "", duration: "", type: "DRUG" }]);
                window.location.reload();
            } else {
                alert("❌ 등록 실패: " + (res.data.message || ""));
            }
        } catch (err) {
            console.error("❌ 등록 중 오류:", err);
            alert("네트워크 오류: " + err.message);
        }
    };

    useEffect(() => {
        const total = newPrescriptions.reduce(
            (sum, p) => sum + (p.total || 0), 0
        );
        setForm((prev) => ({...prev, totalCost:total}));
    }, [newPrescriptions]);

    // 과거 진료 클릭 시 과거 처방 조회
    const handleRecordClick = async (recordId) => {
        setSelectedRecord(recordId);
        const res = await axios.get(`http://192.168.0.24:8080/api/prescriptions/${recordId}`);
        setPrescriptions(res.data);
    };

    //  처방 입력 관련 함수
    const handlePrescriptionChange = (i, e) => {
        const { name, value } = e.target;
        const updated = [...newPrescriptions];
        updated[i][name] = value;

        // 약품명 자동검색 유지
        if (name === "drugName") {
            setActiveIndex(i);
            searchDrug(value);
        }

        // 자동 금액 계산 (단가, 용량, 기간 변경 시)
        if (["unitPrice", "dosage", "duration"].includes(name)) {
            const p = updated[i];
            let total = 0;

            if (p.type === "DRUG") {
                const dosage = parseFloat(p.dosage) || 0;
                const duration = parseFloat(p.duration) || 0;
                const unitPrice = parseFloat(p.unitPrice) || 0;
                total = dosage * duration * unitPrice;
            } else if (p.type === "INJECTION") {
                const dosage = parseFloat(p.dosage) || 0;
                const unitPrice = parseFloat(p.unitPrice) || 0;
                total = dosage * unitPrice;
            }

            updated[i].total = total;
        }

        setNewPrescriptions(updated);
    };


    const addPrescriptionRow = () =>
        setNewPrescriptions([...newPrescriptions, { drugName: "", dosage: "", duration: "", type: "DRUG" }]);

    const removePrescriptionRow = (i) =>
        setNewPrescriptions(newPrescriptions.filter((_, idx) => idx !== i));


    return (
        <div className="p-20 bg-gray-50 min-h-screen font-pretendard">
            <AdminHeader />
            <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">진료 통합 관리</h1>

            <div className="grid grid-cols-2 gap-6">
                {/* ① 진료 등록 */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-blue-600 mb-4">🩺 진료 등록</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 환자 선택 */}
                        <div>
                            <label className="block text-gray-700 mb-1 font-medium">환자 선택</label>
                            <select
                                name="patientId"
                                value={form.patientId}
                                onChange={handleChange}
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">-- 환자 선택 --</option>
                                {patients.map((p) => (
                                    <option key={p.patientId} value={p.patientId}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 의사 선택 */}
                        <div>
                            <label className="block text-gray-700 mb-1 font-medium">주치의 선택</label>
                            <select
                                name="doctorId"
                                value={form.doctorId}
                                onChange={handleChange}
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">-- 주치의 선택 --</option>
                                {doctors.map((d) => (
                                    <option key={d.doctorId} value={d.doctorId}>
                                        {d.doctorName} ({d.deptName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 진단 */}
                        <div>
                            <label className="block text-gray-700 mb-1 font-medium">진단명 / 소견</label>
                            <textarea
                                name="diagnosis"
                                value={form.diagnosis}
                                onChange={handleChange}
                                placeholder="예: 위염, 약물치료 권장"
                                rows="3"
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 resize-none"
                                required
                            />
                        </div>

                        {/* 진료비 */}
                        <div className="mt-4">
                            <label className="block text-gray-700 mb-1 font-medium">진료비 계산</label>

                            <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                                {/* 총 진료비 */}
                                <div className="flex justify-between text-gray-800">
                                    <span>총 진료비</span>
                                    <span className="font-semibold">
                {form.totalCost
                    ? form.totalCost.toLocaleString() + " 원"
                    : "-"}
            </span>
                                </div>

                                {/* 보험 적용 (70%) */}
                                <div className="flex justify-between text-blue-600">
                                    <span>보험 적용 (70%)</span>
                                    <span>
                {form.totalCost
                    ? Math.round(form.totalCost * 0.7).toLocaleString() + " 원"
                    : "-"}
            </span>
                                </div>

                                {/* 본인 부담금 (30%) */}
                                <div className="flex justify-between text-red-600">
                                    <span>본인 부담금 (30%)</span>
                                    <span className="font-semibold">
                {form.totalCost
                    ? Math.round(form.totalCost * 0.3).toLocaleString() + " 원"
                    : "-"}
            </span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 mt-1">
                                ※ 처방 입력 시 자동 계산됩니다.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold"
                        >
                            진료 및 처방 등록
                        </button>
                    </form>
                </div>

                {/* ② 처방 입력 */}
                <div className="bg-white p-6 rounded-lg shadow relative">
                    <h2 className="text-lg font-bold text-blue-600 mb-3">이번 진료 처방</h2>

                    {newPrescriptions.map((p, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 mb-3 border-b pb-2 relative">
                            {/* 타입 선택 */}
                            <select
                                name="type"
                                value={p.type}
                                onChange={(e) => handlePrescriptionChange(i, e)}
                                className="border p-2 rounded w-28"
                            >
                                <option value="DRUG">약</option>
                                <option value="TEST">검사</option>
                                <option value="INJECTION">주사</option>
                            </select>

                            {/* 약일 경우 */}
                            {p.type === "DRUG" && (
                                <>
                                    <div className="relative w-40">
                                        <input
                                            type="text"
                                            name="drugName"
                                            placeholder="약품명 검색"
                                            value={p.drugName}
                                            onChange={(e) => handlePrescriptionChange(i, e)}
                                            className="border p-2 rounded w-full"
                                            autoComplete="off"
                                        />
                                        {activeIndex === i && drugSuggestions.length > 0 && (
                                            <ul className="absolute bg-white border rounded w-full shadow max-h-40 overflow-y-auto z-10">
                                                {drugSuggestions.map((drug) => (
                                                    <li
                                                        key={drug.drugCode}
                                                        onClick={async () => {
                                                            try {
                                                                const res = await axios.get(`http://192.168.0.24:8080/api/drug/${drug.drugCode}`);
                                                                const detail = res.data;

                                                                const updated = [...newPrescriptions];
                                                                updated[i].drugName = detail.drugName;
                                                                updated[i].unit = detail.unit;
                                                                updated[i].unitPrice = detail.unitPrice;
                                                                setNewPrescriptions(updated);

                                                                setDrugSuggestions([]); // 자동완성 닫기
                                                            } catch (err) {
                                                                console.error("약품 상세조회 실패:", err);
                                                            }
                                                        }}
                                                        className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm"
                                                    >
                                                        {drug.drugName} ({drug.unit})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/*  제형 표시 (읽기전용) */}
                                    <input
                                        type="text"
                                        name="unit"
                                        placeholder="제형"
                                        value={p.unit || ""}
                                        readOnly
                                        className="border p-2 rounded w-20 bg-gray-50 text-gray-600"
                                    />

                                    {/*  단가 표시 (읽기전용) */}
                                    <input
                                        type="number"
                                        name="unitPrice"
                                        placeholder="단가"
                                        value={p.unitPrice || ""}
                                        readOnly
                                        className="border p-2 rounded w-24 bg-gray-50 text-gray-600 text-right"
                                    />

                                    <input
                                        type="text"
                                        name="dosage"
                                        placeholder="용량"
                                        value={p.dosage}
                                        onChange={(e) => handlePrescriptionChange(i, e)}
                                        className="border p-2 rounded w-20"
                                    />
                                    <input
                                        type="text"
                                        name="duration"
                                        placeholder="기간"
                                        value={p.duration}
                                        onChange={(e) => handlePrescriptionChange(i, e)}
                                        className="border p-2 rounded w-20"
                                    />
                                </>
                            )}
                            {/*  주사일 경우 */}
                            {p.type === "INJECTION" && (
                                <>
                                    <div className="relative w-40">
                                        <input
                                            type="text"
                                            name="injectionName"
                                            placeholder="주사명 검색"
                                            value={p.injectionName || ""}
                                            onChange={(e) => {
                                                handlePrescriptionChange(i, e);
                                                setActiveIndex(i);
                                                searchDrug(e.target.value, "INJECTION"); // ✅ type 파라미터 전달
                                            }}
                                            className="border p-2 rounded w-full"
                                            autoComplete="off"
                                        />
                                        {activeIndex === i && drugSuggestions.length > 0 && (
                                            <ul className="absolute bg-white border rounded w-full shadow max-h-40 overflow-y-auto z-10">
                                                {drugSuggestions.map((drug) => (
                                                    <li
                                                        key={drug.drugCode}
                                                        onClick={async () => {
                                                            try {
                                                                const res = await axios.get(
                                                                    `http://192.168.0.24:8080/api/drug/${drug.drugCode}`
                                                                );
                                                                const detail = res.data;

                                                                const updated = [...newPrescriptions];
                                                                updated[i].injectionName = detail.drugName;
                                                                updated[i].unit = detail.unit;
                                                                updated[i].unitPrice = detail.unitPrice;
                                                                setNewPrescriptions(updated);
                                                                setDrugSuggestions([]);
                                                            } catch (err) {
                                                                console.error("💉 주사 상세조회 실패:", err);
                                                            }
                                                        }}
                                                        className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm"
                                                    >
                                                        {drug.drugName} ({drug.unit})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/*  단위 (읽기전용) */}
                                    <input
                                        type="text"
                                        name="unit"
                                        placeholder="단위"
                                        value={p.unit || ""}
                                        readOnly
                                        className="border p-2 rounded w-20 bg-gray-50 text-gray-600"
                                    />

                                    {/*  단가 (읽기전용) */}
                                    <input
                                        type="number"
                                        name="unitPrice"
                                        placeholder="단가"
                                        value={p.unitPrice || ""}
                                        readOnly
                                        className="border p-2 rounded w-24 bg-gray-50 text-gray-600 text-right"
                                    />

                                    {/*  용량 입력 */}
                                    <input
                                        type="text"
                                        name="dosage"
                                        placeholder="용량 (예: 5ml)"
                                        value={p.dosage || ""}
                                        onChange={(e) => handlePrescriptionChange(i, e)}
                                        className="border p-2 rounded w-24"
                                    />
                                </>
                            )}
                            {p.type === "TEST" && (
                                <>
                                    <div className="relative w-40">
                                        <input
                                            type="text"
                                            name="testName"
                                            placeholder="검사명 검색"
                                            value={p.testName || ""}
                                            onChange={(e) => {
                                                handlePrescriptionChange(i, e);
                                                setActiveIndex(i);
                                                searchTest(e.target.value); // ✅ 검사 자동완성
                                            }}
                                            className="border p-2 rounded w-full"
                                            autoComplete="off"
                                        />
                                        {activeIndex === i && testSuggestions.length > 0 && (
                                            <ul className="absolute bg-white border rounded w-full shadow max-h-40 overflow-y-auto z-10">
                                                {testSuggestions.map((test) => (
                                                    <li
                                                        key={test.testCode}
                                                        onClick={async () => {
                                                            const res = await axios.get(
                                                                `http://192.168.0.24:8080/api/testFee/${test.testCode}`
                                                            );
                                                            const detail = res.data;

                                                            const updated = [...newPrescriptions];
                                                            updated[i].testCode = detail.testCode; // ✅ 예약 확인용 코드 저장
                                                            updated[i].testName = detail.testName;
                                                            updated[i].unitPrice = detail.basePrice;
                                                            updated[i].total = detail.basePrice;
                                                            setNewPrescriptions(updated);
                                                            setTestSuggestions([]);

                                                            // ✅ 총 진료비 실시간 반영
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                totalCost: (prev.totalCost || 0) + detail.basePrice,
                                                            }));
                                                        }}
                                                        className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm"
                                                    >
                                                        {test.testName} ({test.basePrice.toLocaleString()}원)
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                    </div>

                                    {/* 검사 부위 */}
                                    <input
                                        type="text"
                                        name="testArea"
                                        placeholder="검사 부위 (예: 간, 위, 심장)"
                                        value={p.testArea || ""}
                                        onChange={(e) => handlePrescriptionChange(i, e)}
                                        className="border p-2 rounded w-40"
                                    />

                                    {/* 검사 예정일 */}
                                    <input
                                        type="date"
                                        name="testDate"
                                        value={p.testDate || ""}
                                        onChange={(e) => handlePrescriptionChange(i, e)}
                                        className="border p-2 rounded w-40"
                                    />

                                    {/* ✅ 시간 선택 버튼 추가 */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!p.testDate) return alert("먼저 검사 날짜를 선택하세요.");
                                            if (!p.testCode) return alert("검사명을 먼저 선택하세요.");
                                            setModalTargetIndex(i);
                                            setModalOpen(true);
                                        }}
                                        className="bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600"
                                    >
                                        시간 선택
                                    </button>
                                </>
                            )}



                            {/* 삭제 버튼 */}
                            {newPrescriptions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePrescriptionRow(i)}
                                    className="text-red-500 font-bold ml-2"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addPrescriptionRow}
                        className="bg-gray-200 px-3 py-1 rounded-md mt-2 text-sm"
                    >
                        + 추가
                    </button>
                </div>

                {/* (3) 과거 진료 내역 */}
                <div className="bg-white p-6 rounded-lg shadow overflow-auto max-h-[350px]">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">📋 과거 진료 내역</h2>
                    <button
                        type="button"
                        disabled={!selectedRecord}
                        onClick={() => {
                            if (!selectedRecord) return alert("진료 내역을 먼저 선택하세요.");
                            window.open(`http://192.168.0.24:8080/api/prescriptions/pdf/${selectedRecord}`, "_blank");
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                        📄 처방전 다운로드
                    </button>
                    {records.length === 0 ? (
                        <p className="text-gray-400 text-center mt-10">진료 내역이 없습니다.</p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-blue-50 text-blue-800 font-semibold">
                            <tr>
                                <th className="p-2 border-b">날짜</th>
                                <th className="p-2 border-b">진단명</th>
                                <th className="p-2 border-b">주치의</th>
                                <th className="p-2 border-b">진료과</th>
                                <th className="p-2 border-b">처방 횟수</th>
                                <th className="p-2 border-b">비용</th>
                                <th className="p-2 border-b">상태</th>
                            </tr>
                            </thead>
                            <tbody>
                            {records.map((r) => (
                                <tr
                                    key={r.recordId}
                                    className={`transition-all ${selectedRecord === r.recordId
                                        ? "bg-blue-100"
                                        : "hover:bg-blue-50"
                                    } cursor-pointer`}
                                    onClick={() => handleRecordClick(r.recordId)}
                                >
                                    <td className="p-2 border-b text-gray-700">{r.createdAt?.substring(0, 10)}</td>
                                    <td className="p-2 border-b text-gray-700 text-left truncate max-w-[150px]">{r.diagnosis}</td>
                                    <td className="p-2 border-b text-gray-700">{r.doctorName}</td>
                                    <td className="p-2 border-b text-gray-700">{r.department}</td>
                                    <td className="p-2 border-b text-gray-700">{r.prescriptionCount || 0}</td>
                                    <td className="p-2 border-b text-gray-700">{r.totalCost?.toLocaleString()}원</td>
                                    <td className={`p-2 border-b font-medium ${r.status === "COMPLETED"
                                        ? "text-green-600"
                                        : r.status === "IN_PROGRESS"
                                            ? "text-orange-500"
                                            : "text-gray-500"}`}>{r.status}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* (4) 처방 내역 */}
                <div className="bg-white p-6 rounded-lg shadow overflow-auto max-h-[350px]">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">💊 처방 내역</h2>
                    {prescriptions.length === 0 ? (
                        <p className="text-gray-400 text-center mt-10">처방 내역이 없습니다.</p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-green-50 text-green-800 font-semibold">
                            <tr>
                                <th className="p-2 border-b">유형</th>
                                <th className="p-2 border-b">항목명</th>
                                <th className="p-2 border-b">세부정보 1</th>
                                <th className="p-2 border-b">세부정보 2</th>
                            </tr>
                            </thead>
                            <tbody>
                            {prescriptions.map((p) => (
                                <tr key={p.prescriptionId} className="hover:bg-green-50 transition-all">
                                    {/* ✅ 공통: 처방유형 */}
                                    <td
                                        className={`p-2 border-b font-medium ${
                                            p.type === "DRUG"
                                                ? "text-blue-600"
                                                : p.type === "TEST"
                                                    ? "text-purple-600"
                                                    : "text-teal-600"
                                        }`}
                                    >
                                        {p.type === "DRUG"
                                            ? "약"
                                            : p.type === "TEST"
                                                ? "검사"
                                                : "주사"}
                                    </td>

                                    {/* ✅ 유형별 출력 분기 */}
                                    {p.type === "DRUG" && (
                                        <>
                                            {/* 약 처방 */}
                                            <td className="p-2 border-b text-gray-700">{p.drugName}</td>
                                            <td className="p-2 border-b text-gray-700">
                                                {/* 단위 자동 변환 */}
                                                {p.unit === "정"
                                                    ? `${p.dosage || "-"}정`
                                                    : p.unit === "ml"
                                                        ? `${p.dosage || "-"}ml`
                                                        : `${p.dosage || "-"}${p.unit || ""}`}
                                            </td>
                                            <td className="p-2 border-b text-gray-700">
                                                {p.duration ? `${p.duration}일` : "-"}
                                            </td>
                                        </>
                                    )}

                                    {p.type === "TEST" && (
                                        <>
                                            {/* 검사 처방 */}
                                            <td className="p-2 border-b text-gray-700">{p.testName}</td>
                                            <td className="p-2 border-b text-gray-700">
                                                {p.testArea || "-"}
                                            </td>
                                            <td className="p-2 border-b text-gray-700">
                                                {p.testDate ? p.testDate.substring(0, 10) : "-"}
                                            </td>
                                        </>
                                    )}

                                    {p.type === "INJECTION" && (
                                        <>
                                            {/* 주사 처방 */}
                                            <td className="p-2 border-b text-gray-700">{p.injectionName}</td>
                                            <td className="p-2 border-b text-gray-700">
                                                {/* 주사는 기본적으로 ml 단위로 표시 */}
                                                {p.dosage ? `${p.dosage}ml` : "-"}
                                            </td>
                                            <td className="p-2 border-b text-gray-700">
                                                {p.injectionArea || "주사실"}
                                            </td>
                                        </>
                                    )}

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
            <TimeSlotModal
                testCode={modalTargetIndex !== null ? newPrescriptions[modalTargetIndex].testCode : ""}
                testDate={modalTargetIndex !== null ? newPrescriptions[modalTargetIndex].testDate : ""}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelectTime={(time) => {
                    if (modalTargetIndex !== null) {
                        const updated = [...newPrescriptions];
                        updated[modalTargetIndex].testTime = time;
                        setNewPrescriptions(updated);
                        setModalOpen(false);
                        alert(`✅ ${time} 시간 예약 선택됨`);
                    }
                }}
            />
        </div>
    );
}
