import React, { useEffect, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import AdminHeader from "../../component/AdminHeader";
import TimeSlotModal from "../../component/TimeSlotModal";
import { AiFillPrinter } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import { FileText } from "lucide-react";
import PreExamModal from "../../component/PreExamModal";
import { useNotifications } from "../../context/NotificationContext";
import SurgeryReserveModal from "../../component/SurgeryReserveModal";

export default function MedicalRecordPage() {
  const [form, setForm] = useState({
    patientId: "",
    adminId: "",
    diagnosis: "",
    totalCost: "",
  });
  const [patientKeyword, setPatientKeyword] = useState("");
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [quantitys, setQuantitys] = useState([]);
  const [drugCodes, setDrugCodes] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [testSuggestions, setTestSuggestions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetIndex, setModalTargetIndex] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [reservations, setReservations] = useState([]);
  const { notifications } = useNotifications();
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [surgeryModalOpen, setSurgeryModalOpen] = useState(false);
  const testNotifications = notifications.filter((n) => n.testName);
  const [isShort, setIsShort] = useState(false);
  const [shortageList, setShortageList] = useState({});
  const [preExamModalOpen, setPreExamModalOpen] = useState(false);
  const [selectedPreExam, setSelectedPreExam] = useState(null);
  const [currentPatientName, setCurrentPatientName] = useState("");

  // 화면 진입 시 오늘 날짜로 설정
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // 이번 진료의 처방 입력 리스트
  const [newPrescriptions, setNewPrescriptions] = useState([
    {
      type: "DRUG",
      drugCode: null,
      drugName: "",
      dosage: "",
      duration: "",
      unit: "",
      unitPrice: "",
      injectionName: "",
      testName: "",
      testCode: "",
      testArea: "",
      testDate: "",
      quantity: "",
    },
  ]);

  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  //  디바운스된 약품/주사 검색 함수
  const searchDrug = debounce(async (keyword, type = null) => {
    if (!keyword || keyword.trim() === "") return setDrugSuggestions([]);
    try {
      const res = await axios.get(`http://localhost:8080/api/drug/search`, {
        params: { keyword, type },
      });
      setDrugSuggestions(res.data);
    } catch {
      setDrugSuggestions([]);
    }
  }, 300);

  const searchTest = debounce(async (keyword) => {
    if (!keyword || keyword.trim() === "") return setTestSuggestions([]);
    try {
      const res = await axios.get(`http://localhost:8080/api/testFee/search`, {
        params: { keyword },
      });
      setTestSuggestions(res.data);
    } catch {
      setTestSuggestions([]);
    }
  }, 300);

  // 문진표 조회
  const handlePreExamClick = async (e, reservation) => {
    e.stopPropagation(); // 행 클릭 이벤트(진료 시작) 방지
    try {
      const res = await axios.get(
        `http://localhost:8080/api/questionnaire/${reservation.reservationId}`
      );

      if (res.data) {
        setSelectedPreExam(res.data.surveyData);
        setCurrentPatientName(reservation.patientName);
        setPreExamModalOpen(true);
      } else {
        alert("작성된 사전 문진표가 없습니다.");
      }
    } catch (err) {
      console.error("문진표 조회 실패:", err);
      alert("작성된 사전 문진표가 없습니다.");
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/doctors")
      .then((res) => setDoctors(res.data));
  }, []);

  // ✅ 날짜 선택 시 예약 환자 조회
  useEffect(() => {
    if (selectedDate) {
      console.log("📅 예약조회 요청:", selectedDate);
      axios
        .get(`http://localhost:8080/api/records/reserved?date=${selectedDate}`)
        .then((res) => setReservations(res.data))
        .catch((err) => {
          console.error("❌ 예약 환자 조회 실패:", err);
          setPatients([]);
        });
    } else {
      setPatients([]);
    }
  }, [selectedDate]);

  const handleReservationClick = async (resv) => {
    try {
      console.log("🔹 클릭된 예약:", resv);

      if (!resv.reservationId) {
        console.warn("⚠️ reservationId 없음:", resv);
        return;
      }

      const isSelected = form.patientId === String(resv.patientId);

      // 상태 변경
      if (resv.reservationStatus === "WAIT") {
        await axios.put(
          `http://localhost:8080/api/reservation/${resv.reservationId}/status`,
          null,
          { params: { status: "CONSULT" } }
        );

        // UI 즉시 반영
        setReservations((prev) =>
          prev.map((r) =>
            r.reservationId === resv.reservationId
              ? { ...r, reservationStatus: "CONSULT" }
              : r
          )
        );
      }
      // 진료 과별 금액 추가 반영
      try {
        const costRes = await axios.get(
          `http://localhost:8080/api/records/cost/preview`,
          { params: { adminId: resv.adminId, patientId: resv.patientId } }
        );

        if (costRes.data.success) {
          setForm((prev) => ({
            ...prev,
            totalCost: costRes.data.totalCost,
            insuranceAmount: costRes.data.insuranceAmount,
            patientPay: costRes.data.patientPay,
          }));
          console.log("✅ 진료비 미리보기:", costRes.data);
        }
      } catch (err) {
        console.warn("⚠️ 진료비 계산 실패:", err);
      }

      // 진료내역 조회
      const recordRes = await axios.get(
        `http://localhost:8080/api/records/patient/${resv.patientId}`
      );
      setRecords(recordRes.data || []);

      setForm({
        ...form,
        patientId: String(resv.patientId ?? ""),
        adminId: String(resv.adminId ?? ""),
        reservationId: resv.reservationId,
      });

      setPrescriptions([]);
      setSelectedRecord(null);
    } catch (err) {
      console.error("❌ 진료내역 조회 또는 상태 변경 실패:", err);
    }
  };

  useEffect(() => {
    // 둘 다 선택돼야 계산 시작
    if (!form.adminId || !form.patientId) return;

    const fetchCost = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/records/cost/preview",
          { params: { adminId: form.adminId, patientId: form.patientId } }
        );
        if (res.data && res.data.totalCost) {
          setForm((prev) => ({
            ...prev,
            totalCost: res.data.totalCost,
            insuranceAmount: res.data.insuranceAmount,
            patientPay: res.data.patientPay,
          }));
          console.log("✅ 진료비 자동 갱신:", res.data);
        }
      } catch (err) {
        console.warn("❌ 진료비 자동 계산 실패:", err);
      }
    };

    fetchCost();
  }, [form.adminId]); // adminId 바뀔 때마다 실행

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "patientId" && value) {
      axios
        .get(`http://localhost:8080/api/records/patient/${value}`)
        .then((res) => setRecords(res.data))
        .catch(() => setRecords([]));

      setPrescriptions([]);
      setSelectedRecord(null);
    }

    if (name === "adminId" && value) {
      axios
        .get(`http://localhost:8080/api/doctors/fee/${value}`)
        .then((res) => {
          const { consultFee, insuranceRate } = res.data;
          setForm((prev) => ({
            ...prev,
            consultFee: consultFee || 0,
            insuranceRate: insuranceRate || 0.7,
            totalCost: (prev.totalCost || 0) + (consultFee || 0),
          }));
        })
        .catch((err) => console.error("❌ 진료비 불러오기 실패:", err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cleanPrescriptions = newPrescriptions.map((p) => {
        const base = { ...p };
        Object.keys(base).forEach((k) => {
          if (base[k] === "") base[k] = null;
        });
        if (base.unitPrice !== null && base.unitPrice !== undefined) {
          base.unitPrice = Number(base.unitPrice);
        }
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

      const payload = {
        patientId: Number(form.patientId),
        adminId: Number(form.adminId),
        diagnosis: form.diagnosis,
        totalCost: Number(form.totalCost),
        insuranceAmount: Math.round(Number(form.totalCost) * 0.7),
        patientPay: Math.round(Number(form.totalCost) * 0.3),
        prescriptions: cleanPrescriptions,
        reservationId: form.reservationId,
      };
      if (payload.reservationId === undefined) delete payload.reservationId;
      console.log("등록 값 확인 ", payload);
      const URL = "192.168.0.24";
      const res = await axios.post(
        "http://localhost:8080/api/records",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      for (const p of cleanPrescriptions) {
        if (p.type === "TEST" && p.testDate && p.testName) {
          if (p.isReserved) continue;
          try {
            await axios.post("http://localhost:8080/api/testSchedule/reserve", {
              testCode: p.testCode,
              testDate: p.testDate,
              testTime: p.testTime,
              patientId: form.patientId,
            });
          } catch (err) {
            console.warn(`❌ 검사 예약 실패 (${p.testName}):`, err);
          }
        }
      }

      if (res.data.success) {
        // 처방 등록 성공 → CONSULT → DONE 자동 전환
        if (form.reservationId) {
          try {
            await axios.put(
              `http://localhost:8080/api/reservation/${form.reservationId}/status`,
              null,
              { params: { status: "DONE" } }
            );
          } catch (err) {
            console.warn("❌ 예약 상태 업데이트 실패:", err);
          }
        }

        alert("진료 및 처방 등록 완료");

        try {
          const recordId = res.data.recordId; // 백엔드에서 recordId 리턴해야 함
          if (recordId) {
            window.open(
              `http://localhost:8080/api/prescriptions/pdf/${recordId}`,
              "_blank"
            );
          }
        } catch (err) {
          console.warn("⚠️ 처방전 자동 발행 실패:", err);
        }
        console.log("✅ 등록 응답:", res.data);
        const recordRes = await axios.get(
          `http://localhost:8080/api/records/patient/${form.patientId}`
        );
        setRecords(recordRes.data);
        setForm({ ...form, diagnosis: "", totalCost: "" });
        setNewPrescriptions([
          { drugName: "", dosage: "", duration: "", type: "DRUG" },
        ]);
        setIsShort(false);
        setShortageList([]);
        window.location.reload();
      } else {
        alert("등록 실패: " + (res.data.message || ""));
      }
    } catch (err) {
      console.error("등록 중 오류:", err);
      if (err.response) {
        console.error("🔻 서버 응답 상태:", err.response.status);
        console.error("🔻 서버 응답 데이터:", err.response.data);
        console.error("🔻 서버 에러 메시지:", err.response.data?.message);
        alert("서버 오류: " + JSON.stringify(err.response.data));
      } else {
        alert("네트워크 오류: " + err.message);
      }
    }
  };

  useEffect(() => {
    const total = newPrescriptions.reduce((sum, p) => sum + (p.total || 0), 0);
    setForm((prev) => ({ ...prev, totalCost: total }));
  }, [newPrescriptions]);

  const handleRecordClick = async (recordId) => {
    setSelectedRecord(recordId);
    const res = await axios.get(
      `http://localhost:8080/api/prescriptions/${recordId}`
    );
    setPrescriptions(res.data);
  };

  const handlePrescriptionChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...newPrescriptions];
    updated[i][name] = value;

    if (name === "drugName") {
      setActiveIndex(i);
      searchDrug(value);
    }

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
    setNewPrescriptions([
      ...newPrescriptions,
      { drugName: "", dosage: "", duration: "", type: "DRUG" },
    ]);

  const removePrescriptionRow = (i, type) => {
    setNewPrescriptions(newPrescriptions.filter((_, idx) => idx !== i));
    if (type === "DRUG") {
      setShortageList(shortageList.filter((_, idx) => idx !== i));
    }
  };

  const handleSurgeryReserve = (record) => {
    if (!record) return;
    setSelectedSurgery(record);
    setSurgeryModalOpen(true);
  };
  const searchPatient = debounce(async (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setPatientSuggestions([]);
      return;
    }

    try {
      const res = await axios.get("http://localhost:8080/api/patients/search", {
        params: { keyword },
      });
      setPatientSuggestions(res.data);
    } catch (err) {
      console.error("환자 검색 실패:", err);
      setPatientSuggestions([]);
    }
  }, 300);

  const handlePatientSelect = async (p) => {
    setPatientKeyword(p.name);
    setPatientSuggestions([]);

    setForm((prev) => ({
      ...prev,
      patientId: String(p.patientId),
    }));

    try {
      const recordRes = await axios.get(
        `http://192.168.0.24:8080/api/records/patient/${p.patientId}`
      );
      setRecords(recordRes.data || []);

      if (recordRes.data && recordRes.data.length > 0) {
        const recordId = recordRes.data[0].recordId;
        const presRes = await axios.get(
          `http://localhost:8080/api/prescriptions/${recordId}`
        );
        setPrescriptions(presRes.data || []);
      }
    } catch {
      setRecords([]);
      setPrescriptions([]);
    }

    // ▣ 진료비 자동 계산
    if (form.adminId) {
      try {
        const costRes = await axios.get(
          `http://localhost:8080/api/records/cost/preview`,
          { params: { adminId: form.adminId, patientId: p.patientId } }
        );

        if (costRes.data.success) {
          setForm((prev) => ({
            ...prev,
            totalCost: costRes.data.totalCost,
            insuranceAmount: costRes.data.insuranceAmount,
            patientPay: costRes.data.patientPay,
          }));
        }
      } catch (err) {
        console.warn("진료비 미리보기 실패:", err);
      }
    }
  };
  const checkShortage = (i) => {
    const myQty = newPrescriptions[i].quantity;
    const need = newPrescriptions[i].dosage;
    const day = newPrescriptions[i].duration || 1;
    if (!myQty || !need) return;

    console.log(i, "번쨰 리스트값들", myQty, need, day);
    const totalNeed = (need || 0) * (day || 1);
    if (myQty < totalNeed) {
      console.log("약 개수 부족", myQty, totalNeed);
    } else {
      console.log("약 개수 충분", myQty, totalNeed);
    }
    const isCurrentShort = myQty < totalNeed;
    setShortageList((prev) => {
      const updated = { ...prev, [i]: isCurrentShort };

      // 2) 전체 중 하나라도 부족한지 계산
      const anyShort = Object.values(updated).some((v) => v === true);

      // 3) 전체용 isShort 업데이트
      setIsShort(anyShort);
    });
  };

  const handlePatientClick = (r) => {
    // 이미 선택된 것 → 다시 클릭하면 해제
    if (form.patientId === String(r.patientId)) {
      setForm({ ...form, patientId: "" });
      return;
    }

    // 새로 선택
    setForm({ ...form, patientId: String(r.patientId) });
  };

  return (
    <div className="p-20 bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />
      <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        진료 통합 관리
      </h1>
      {/* 🔍 환자 검색 */}
      <div className="bg-white p-5 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          🔍 환자 검색
        </h2>

        <div className="relative">
          <input
            type="text"
            value={patientKeyword}
            onChange={(e) => {
              setPatientKeyword(e.target.value);
              searchPatient(e.target.value);
            }}
            placeholder="환자명, 연락처 등으로 검색"
            className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-300"
            autoComplete="off"
          />

          {/* 자동완성 리스트 */}
          {patientSuggestions.length > 0 && (
            <ul className="absolute bg-white border rounded w-full shadow max-h-60 overflow-y-auto z-20">
              {patientSuggestions.map((p) => (
                <li
                  key={p.patientId}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                  onClick={() => handlePatientSelect(p)}
                >
                  {p.name} ({p.gender}) / {p.phone}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ✅ 진료 등록 폼 시작 */}
        {/* ✅ 1. 예약 조회 섹션 */}
        <div className="bg-white p-5 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-3">
            📅 예약 조회
          </h2>

          {/* 날짜 선택 */}
          <div className="flex items-center gap-4 mb-3">
            <label className="text-gray-700 font-medium">예약 날짜</label>
            <input
              type="date"
              className="border rounded p-2 focus:ring-2 focus:ring-blue-400"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* 예약 환자 테이블 */}
          {reservations.length === 0 ? (
            <p className="text-gray-500 text-sm">
              선택한 날짜에 예약된 환자가 없습니다.
            </p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-blue-50 text-blue-700 text-center sticky top-0 z-10">
                  <tr>
                    <th className="p-2 border-b">시간</th>
                    <th className="p-2 border-b">환자명</th>
                    <th className="p-2 border-b">의사</th>
                    <th className="p-2 border-b">상태</th>
                    <th className="p-2 border-b">사전문진표</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr
                      key={r.reservationId}
                      onClick={() => handleReservationClick(r)}
                      className={`cursor-pointer ${
                        form.patientId === String(r.patientId)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-2 border-b text-gray-700 text-center">
                        {new Date(r.reservationDate).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="p-2 border-b font-medium text-center">
                        {r.patientName}
                      </td>
                      <td className="p-2 border-b text-gray-600 text-center">
                        {r.doctorName}
                      </td>
                      <td className="p-2 border-b text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            r.reservationStatus === "WAIT"
                              ? "bg-yellow-100 text-yellow-700"
                              : r.reservationStatus === "CONSULT"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {r.reservationStatus}
                        </span>
                      </td>
                      <td className="p-2 border-b text-center">
                        <button
                          type="button"
                          onClick={(e) => handlePreExamClick(e, r)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                          title="사전 문진표 보기"
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ✅ 2. 진료 등록 폼 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow space-y-4"
        >
          {/* 주치의 선택 */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              주치의 선택
            </label>
            <select
              name="adminId"
              value={form.adminId || ""}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">-- 주치의 선택 --</option>
              {doctors.map((d) => (
                <option key={d.adminId} value={d.adminId}>
                  {d.name} ({d.deptName})
                </option>
              ))}
            </select>
          </div>

          {/* 진단 */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              진단명 / 소견
            </label>
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

          {/* 진료비 계산 */}
          <div className="mt-4">
            <label className="block text-gray-700 mb-1 font-medium">
              진료비 계산
            </label>
            <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between text-gray-800">
                <span>총 진료비</span>
                <span className="font-semibold">
                  {form.totalCost
                    ? form.totalCost.toLocaleString() + " 원"
                    : "-"}
                </span>
              </div>

              <div className="flex justify-between text-blue-600">
                <span>보험 적용 (70%)</span>
                <span>
                  {form.totalCost
                    ? Math.round(form.totalCost * 0.7).toLocaleString() + " 원"
                    : "-"}
                </span>
              </div>

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
            disabled={isShort}
            type="submit"
            className={`w-full py-2 rounded-md font-semibold text-white
    ${
      isShort
        ? "bg-gray-300 cursor-not-allowed" // 비활성화 스타일
        : "bg-blue-500 hover:bg-blue-600 cursor-pointer" // 활성화 스타일
    }
  `}
          >
            진료 및 처방 등록
          </button>
        </form>

        {/* 2. 처방 입력 */}
        <div className="bg-white p-6 rounded-lg shadow relative">
          <h2 className="text-lg font-bold text-blue-600 mb-3">
            이번 진료 처방
          </h2>
          {isShort && (
            <p className="text-red-500 text-xs mt-1">재고가 부족합니다.</p>
          )}
          {newPrescriptions.map((p, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 mb-3 border-b pb-2 relative"
            >
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
                      onChange={(e) => {
                        handlePrescriptionChange(i, e);
                        setActiveIndex(i);
                      }}
                      onFocus={() => setActiveIndex(i)}
                      className="border p-2 rounded w-full"
                      autoComplete="off"
                    />
                    {activeIndex === i && drugSuggestions.length > 0 && (
                      <ul className="absolute bg-white border rounded w-full shadow max-h-40 overflow-y-auto z-10">
                        {drugSuggestions.map((drug) => {
                          //재고 부족 여부
                          return (
                            <li
                              key={drug.drugCode}
                              onClick={async () => {
                                if (isShort) return;
                                try {
                                  const res = await axios.get(
                                    `http://localhost:8080/api/drug/${drug.drugCode}`
                                  );
                                  const detail = res.data;

                                  const updated = [...newPrescriptions];
                                  updated[i].drugName = detail.drugName;
                                  updated[i].drugCode = detail.drugCode;
                                  updated[i].unit = detail.unit;
                                  updated[i].unitPrice = detail.unitPrice;
                                  updated[i].quantity = detail.quantity;
                                  setNewPrescriptions(updated);

                                  setDrugSuggestions([]); // 자동완성 닫기
                                } catch (err) {
                                  console.error("약품 상세조회 실패:", err);
                                }
                              }}
                              className={`px-2 py-1 text-sm cursor-pointer ${
                                isShort
                                  ? "text-red-500 bg-red-50 cursor-not-allowed"
                                  : "hover:bg-blue-100"
                              }`}
                            >
                              {drug.drugName} ({drug.unit}){" "}
                              <span className="text-sm text-gray-500">
                                {drug.quantity}개
                              </span>
                            </li>
                          );
                        })}
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
                    type="number"
                    name="dosage"
                    placeholder="1회 투약량"
                    min={0}
                    value={p.dosage ?? ""}
                    onChange={(e) => {
                      handlePrescriptionChange(i, e);
                      checkShortage(i);
                    }}
                    className="border p-2 rounded w-20"
                  />
                  <input
                    type="number"
                    name="duration"
                    placeholder="기간"
                    value={p.duration ?? ""}
                    onChange={(e) => {
                      handlePrescriptionChange(i, e);
                      checkShortage(i);
                    }}
                    className="border p-2 rounded w-20"
                    min={1}
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
                      <div>
                        <ul className="absolute bg-white border rounded w-full shadow max-h-40 overflow-y-auto z-10">
                          {drugSuggestions.map((drug) => (
                            <li
                              key={drug.drugCode}
                              onClick={async () => {
                                if (drug.quantity <= 0) return;
                                try {
                                  const res = await axios.get(
                                    `http://localhost:8080/api/drug/${drug.drugCode}`
                                  );
                                  const detail = res.data;

                                  const updated = [...newPrescriptions];
                                  updated[i].injectionName = detail.drugName;
                                  updated[i].unit = detail.unit;
                                  updated[i].unitPrice = detail.unitPrice;
                                  updated[i].drugCode = detail.drugCode;
                                  setNewPrescriptions(updated);
                                  setDrugSuggestions([]);
                                } catch (err) {
                                  console.error("💉 주사 상세조회 실패:", err);
                                }
                              }}
                              className={`px-2 py-1  cursor-pointer text-sm 
                                ${
                                  drug.quantity <= 0
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "hover:bg-blue-100"
                                }`}
                            >
                              {drug.drugName} ({drug.unit})
                            </li>
                          ))}
                          {isShort && (
                            <p className="text-red-500 text-xs mt-1">
                              재고가 부족합니다.
                            </p>
                          )}
                        </ul>
                      </div>
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
                    type="number"
                    name="dosage"
                    min={0}
                    placeholder="용량(예: 5ml)"
                    value={p.dosage || ""}
                    onChange={(e) => {
                      handlePrescriptionChange(i, e);
                      checkShortage(i);
                    }}
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
                                `http://localhost:8080/api/testFee/${test.testCode}`
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
                                totalCost:
                                  (prev.totalCost || 0) + detail.basePrice,
                              }));
                            }}
                            className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm"
                          >
                            {test.testName} ({test.basePrice.toLocaleString()}
                            원)
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
                      if (!p.testDate)
                        return alert("먼저 검사 날짜를 선택하세요.");
                      if (!p.testCode)
                        return alert("검사명을 먼저 선택하세요.");
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
                  onClick={() => removePrescriptionRow(i, p.type)}
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

        {/* 3. 과거 진료 내역 */}
        <div className="bg-white p-6 rounded-lg shadow overflow-auto max-h-[350px]">
          <h2 className="text-lg font-bold text-gray-700 mb-3">
            📋 과거 진료 내역
          </h2>
          {/*<button*/}
          {/*    type="button"*/}
          {/*    disabled={!selectedRecord}*/}
          {/*    onClick={() => {*/}
          {/*        if (!selectedRecord) return alert("진료 내역을 먼저 선택하세요.");*/}
          {/*        window.open(`http://192.168.0.24:8080/api/prescriptions/pdf/${selectedRecord}`, "_blank");*/}
          {/*    }}*/}
          {/*    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"*/}
          {/*>*/}
          {/*    📄 처방전 다운로드*/}
          {/*</button>*/}
          {records.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              진료 내역이 없습니다.
            </p>
          ) : (
            <table className="w-full border-collapse text-sm text-center">
              <thead className="bg-blue-50 text-blue-800 font-semibold">
                <tr>
                  <th className="p-2 border-b w-24">날짜</th>
                  <th className="p-2 border-b text-left w-48">진단명</th>
                  <th className="p-2 border-b w-32">주치의</th>
                  <th className="p-2 border-b w-20">처방전</th>
                  <th className="p-2 border-b w-28">비용</th>
                  <th className="p-2 border-b w-28">상태</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.recordId}
                    className={`transition-all ${
                      selectedRecord === r.recordId
                        ? "bg-blue-100"
                        : "hover:bg-blue-50"
                    } cursor-pointer`}
                    onClick={() => handleRecordClick(r.recordId)}
                  >
                    {/* 날짜 */}
                    <td className="p-2 border-b text-gray-700 align-middle">
                      {r.createdAt?.substring(0, 10)}
                    </td>

                    {/* 진단명 (좌측 정렬) */}
                    <td className="p-2 border-b text-gray-700 text-left truncate max-w-[160px]">
                      {r.diagnosis}
                    </td>

                    {/* 주치의 */}
                    <td className="p-2 border-b text-gray-700 align-middle">
                      {r.doctorName}
                    </td>

                    {/* 처방전 아이콘 */}
                    <td className="p-2 border-b text-center align-middle">
                      <AiFillPrinter
                        size={20}
                        className="mx-auto text-blue-600 hover:text-blue-800 transition-colors"
                        title="처방전 다운로드"
                        onClick={(e) => {
                          e.stopPropagation(); // 행 클릭 이벤트 방지
                          window.open(
                            `http://localhost:8080/api/prescriptions/pdf/${r.recordId}`,
                            "_blank"
                          );
                        }}
                      />
                    </td>

                    {/* 비용 */}
                    <td className="p-2 border-b text-gray-700 align-middle">
                      {r.totalCost?.toLocaleString()}원
                    </td>

                    {/* 상태 */}
                    <td
                      className={`p-2 border-b font-medium align-middle ${
                        r.status === "COMPLETED"
                          ? "text-green-600"
                          : r.status === "IN_PROGRESS"
                          ? "text-orange-500"
                          : "text-gray-500"
                      }`}
                    >
                      {r.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 4. 처방 내역 */}
        <div className="bg-white p-6 rounded-lg shadow overflow-auto max-h-[350px]">
          <h2 className="text-lg font-bold text-gray-700 mb-3">💊 처방 내역</h2>
          {prescriptions.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              처방 내역이 없습니다.
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead className="bg-green-50 text-green-800 font-semibold">
                <tr>
                  <th className="p-2 border-b">유형</th>
                  <th className="p-2 border-b">항목명</th>
                  <th className="p-2 border-b">세부정보 1</th>
                  <th className="p-2 border-b">세부정보 2</th>
                  <th className="p-2 border-b">세부정보 3</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr
                    key={p.prescriptionId}
                    className="hover:bg-green-50 transition-all"
                  >
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
                        <td className="p-2 border-b text-gray-700">
                          {p.drugName}
                        </td>
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
                        <td className="p-2 border-b text-gray-700">
                          {p.testName}
                        </td>
                        <td className="p-2 border-b text-gray-700">
                          {p.testArea || "-"}
                        </td>
                        <td className="p-2 border-b text-gray-700">
                          {p.testDate ? p.testDate.substring(0, 10) : "-"}
                        </td>
                        <td className="p-2 border-b text-center">
                          <button
                            onClick={() =>
                              window.open(
                                `http://localhost:8080/api/testResult/${p.reservationId}/pdf`,
                                "_blank"
                              )
                            }
                            className="text-blue-500 hover:text-blue-700 font-medium mr-2"
                          >
                            🔍 결과 보기
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSurgeryReserve({
                                recordId: selectedRecord,
                                adminId: form.adminId,
                                patientId: form.patientId,
                                diagnosis: p.testName, // 수술명 기본값
                                patientName: p.patientName || "환자", // optional
                              });
                            }}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                            title="수술 예약"
                          >
                            🏥 예약
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
          <h2 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
            🧪 검사 결과 알림
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({testNotifications.length})
            </span>
          </h2>

          {testNotifications.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              아직 수신된 검사 결과가 없습니다.
            </p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {testNotifications.map((n) => (
                <li
                  key={n.id}
                  className="flex justify-between items-center border-b pb-2 text-sm hover:bg-blue-50 transition"
                >
                  <div>
                    <span className="font-semibold text-gray-800">
                      {n.patientName}
                    </span>
                    <span className="font-semibold text-gray-800 ml-2">
                      {n.testName}
                    </span>
                    <span className="text-gray-500 ml-2">{n.time}</span>
                  </div>
                  <button
                    onClick={() =>
                      window.open(
                        `http://localhost:8080/api/testResult/${n.reservationId}/pdf`,
                        "_blank"
                      )
                    }
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    보기
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
      />
      <TimeSlotModal
        testCode={
          modalTargetIndex !== null
            ? newPrescriptions[modalTargetIndex].testCode
            : ""
        }
        testDate={
          modalTargetIndex !== null
            ? newPrescriptions[modalTargetIndex].testDate
            : ""
        }
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
      {/*수술 시간 예약용 모달*/}
      <SurgeryReserveModal
        mode="surgery"
        open={surgeryModalOpen}
        onClose={() => setSurgeryModalOpen(false)}
        test={{
          recordId: selectedSurgery?.recordId,
          adminId: selectedSurgery?.adminId,
          patientId: selectedSurgery?.patientId,
          testName: selectedSurgery?.diagnosis || "수술",
          patientName: selectedSurgery?.patientName,
        }}
      />
      {/* 사전 문진 모달 */}
      <PreExamModal
        isOpen={preExamModalOpen}
        onClose={() => setPreExamModalOpen(false)}
        data={selectedPreExam}
        patientName={currentPatientName}
      />
    </div>
  );
}
