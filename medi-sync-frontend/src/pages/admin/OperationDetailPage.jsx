import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";
import { FaTrashAlt } from "react-icons/fa";

export default function OperationDetailPage() {
    const { operationId } = useParams();

    const [operation, setOperation] = useState({
        operationName: "",
        anesthesiaType: "",
        scheduledDate: "",
        scheduledTime: "",
        roomId: "",
        doctorName: "",
        cost: "",
        insuranceCovered: "N",
        status: "SCHEDULED",
        resultNote: "",
    });

    const [patient, setPatient] = useState(null);
    const [logs, setLogs] = useState([]);
    const [history, setHistory] = useState([]);
    const [newStaff, setNewStaff] = useState({ name: "", position: "" });
    const [activeTab, setActiveTab] = useState("history");
    const [prescriptions, setPrescriptions] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [staffList, setStaffList] = useState([]);

    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [prescPage, setPrescPage] = useState(1);
    const [prescTotal, setPrescTotal] = useState(0);

    const [patientIdState, setPatientIdState] = useState(null);

    // ────────────────────────────────────────────────
    // 초기 세팅 : 수술 상세 + 로그 + 환자ID 저장
    // ────────────────────────────────────────────────
    useEffect(() => {
        fetchDetail();
        fetchLogs();
    }, [operationId]);

    useEffect(() => {
        axios
            .get("http://192.168.0.24:8080/api/operation/room")
            .then((res) => setRooms(res.data))
            .catch((err) => console.error("❌ 수술실 목록 불러오기 실패:", err));
    }, []);

    const fetchDetail = async () => {
        const res = await axios.get(`http://192.168.0.24:8080/api/operation/${operationId}`);
        setOperation(res.data);

        if (res.data.patientId) {
            setPatientIdState(res.data.patientId);
            fetchPatient(res.data.patientId);
        }

        fetchStaffList();
    };

    const fetchPatient = async (patientId) => {
        const res = await axios.get(`http://192.168.0.24:8080/api/patients/${patientId}/detail`);
        setPatient(res.data);
    };

    const fetchStaffList = async () => {
        try {
            const res = await axios.get(
                `http://192.168.0.24:8080/api/operation/${operationId}/operationStaffs`
            );
            setStaffList(res.data);
        } catch (error) {
            console.log("참여 의료진 조회 실패 : ", error);
        }
    };

    // ────────────────────────────────────────────────
    // 페이징 적용된 진료 기록
    // ────────────────────────────────────────────────
    const fetchHistory = async (patientId, page = 1) => {
        try {
            const res = await axios.get(
                `http://192.168.0.24:8080/api/patients/${patientId}/records`,
                { params: { page, size: 10 } }
            );
            setHistory(prev => [...prev, ...(res.data.items || [])]);

            setHistoryTotal(res.data.totalCount || 0);
        } catch (err) {
            console.error("❌ 진료기록 조회 실패:", err);
            setHistory([]); // undefined 방지
        }
    };

    // ────────────────────────────────────────────────
    // 페이징 적용된 처방 기록
    // ────────────────────────────────────────────────
    const fetchPrescriptions = async (patientId, page = 1) => {
        try {
            const res = await axios.get(
                `http://192.168.0.24:8080/api/patients/${patientId}/prescriptions`,
                { params: { page, size: 10 } }
            );
            setPrescriptions(prev => [...prev, ...(res.data.items || [])]);
            setPrescTotal(res.data.totalCount || 0);
        } catch (err) {
            console.error("❌ 처방 내역 조회 실패:", err);
            setPrescriptions([]); // undefined 방지
        }
    };
    // 탭 변경하면 내역 초기화
    useEffect(() => {
        if (activeTab === "history") {
            setHistory([]);
            setHistoryPage(1);
        } else {
            setPrescriptions([]);
            setPrescPage(1);
        }
    }, [activeTab]);

    // ⭐ patientIdState가 준비되기 전에는 절대 호출되지 않음
    useEffect(() => {
        if (!patientIdState) return;

        if (activeTab === "history") {
            fetchHistory(patientIdState, historyPage);
        } else {
            fetchPrescriptions(patientIdState, prescPage);
        }
    }, [activeTab, historyPage, prescPage, patientIdState]);

    const fetchLogs = async () => {
        const res = await axios.get(`http://192.168.0.24:8080/api/operation/${operationId}/logs`);
        setLogs(res.data);
    };

    const handleUpdate = async () => {
        await axios.put(`http://192.168.0.24:8080/api/operation/${operationId}/update`, operation);
        alert("✅ 수술 정보가 수정되었습니다.");
        fetchDetail();
    };

    const handleAddStaff = async () => {
        if (!newStaff.name || !newStaff.position) return alert("이름과 직책을 입력하세요.");

        try {
            await axios.post(
                `http://192.168.0.24:8080/api/operation/${operationId}/staff`,
                newStaff
            );
            alert("✅ 의료진 추가 완료");
            setNewStaff({ name: "", position: "" });
            fetchDetail();
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data;
            if (typeof message === "string" && message.includes("이미 등록된 의료진")) {
                alert("⚠️ 이미 참여중인 의료진입니다.");
            } else {
                alert("❌ 의료진 등록 실패");
            }
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        if (timeString.includes("T")) return timeString.split("T")[1].slice(0, 5);
        return timeString.slice(0, 5);
    };

    const handleSearchStaff = async (inputValue) => {
        const value = inputValue.trim();
        setNewStaff({ ...newStaff, name: value });

        if (!value) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await axios.get("http://192.168.0.24:8080/api/staffs/search", {
                params: { keyword: value },
            });
            setSuggestions(res.data);
        } catch (err) {
            console.error("❌ 의료진 자동완성 실패:", err);
        }
    };

    const handleSelectSuggestion = (staff) => {
        setNewStaff({
            name: staff.name,
            position: staff.position || "",
            adminId: staff.adminId,
        });

        const inputEl = document.querySelector("input[placeholder='이름']");
        if (inputEl) inputEl.value = staff.name;

        setSuggestions([]);
    };

    const handleDeleteStaff = async (staffId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await axios.delete(
                `http://192.168.0.24:8080/api/operation/${operationId}/staff/${staffId}`
            );
            alert("삭제 완료");
            fetchDetail();
        } catch (err) {
            console.error("의료진 삭제 실패 : ", err);
        }
    };

    // ────────────────────────────────────────────────
    // ⛔ 렌더링 안전: history?.length 사용 (undefined 방지)
    // ────────────────────────────────────────────────
    const safeHistory = Array.isArray(history) ? history : [];
    const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <AdminHeader />

            <div className="max-w-6xl mx-auto p-10 space-y-10">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">
                    🏥 수술 상세 정보 (ID: {operationId})
                </h2>

                {/* ─────────────────────── 환자 정보 ─────────────────────── */}
                {patient && (
                    <section className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">👤 환자 정보</h3>
                        <div className="grid grid-cols-4 gap-4 mt-3 text-gray-800">
                            <div><strong>이름:</strong> {patient.name}</div>
                            <div><strong>성별:</strong> {patient.gender}</div>
                            <div><strong>나이:</strong> {patient.age}세</div>
                            <div><strong>연락처:</strong> {patient.phone}</div>
                            <div><strong>주소:</strong> {patient.address}</div>
                            <div><strong>등록일:</strong> {patient.createdAt}</div>
                        </div>
                    </section>
                )}

                {/* ─────────────────────── 수술 정보 ─────────────────────── */}
                <section className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">수술 정보</h3>

                    <div className="grid grid-cols-2 gap-6">
                        {/* 수술명 */}
                        <div>
                            <label className="text-sm text-gray-600">수술명</label>
                            <input
                                className="border w-full rounded-md p-2 mt-1"
                                value={operation.operationName || ""}
                                onChange={(e) =>
                                    setOperation({ ...operation, operationName: e.target.value })
                                }
                                placeholder="예: 백내장 제거술"
                            />
                        </div>

                        {/* 마취 유형 */}
                        <div>
                            <label className="text-sm text-gray-600">마취 유형</label>
                            <input
                                className="border w-full rounded-md p-2 mt-1"
                                value={operation.anesthesiaType || ""}
                                readOnly
                            />
                        </div>

                        {/* 수술 일자 */}
                        <div>
                            <label className="text-sm text-gray-600">수술 일자</label>
                            <input
                                type="date"
                                className="border w-full rounded-md p-2 mt-1"
                                value={operation.scheduledDate || ""}
                                readOnly
                            />
                        </div>

                        {/* 수술 시간 */}
                        <div>
                            <label className="text-sm text-gray-600">수술 시간</label>
                            <input
                                type="time"
                                className="border w-full rounded-md p-2 mt-1"
                                value={formatTime(operation.scheduledTime)}
                                readOnly
                            />
                        </div>

                        {/* 수술실 */}
                        <div>
                            <label className="text-sm text-gray-600">수술실</label>
                            <select
                                className="border w-full rounded-md p-2 mt-1 bg-gray-100 cursor-not-allowed"
                                value={operation.roomName || ""}
                                disabled
                            >
                                <option value="">{operation.roomName || "배정되지 않음"}</option>
                            </select>
                        </div>

                        {/* 담당의 */}
                        <div>
                            <label className="text-sm text-gray-600">담당의</label>
                            <input
                                className="border w-full rounded-md p-2 mt-1"
                                value={operation.doctorName || ""}
                                readOnly
                            />
                        </div>

                        {/* 수술 비용 */}
                        <div>
                            <label className="text-sm text-gray-600">수술 비용</label>
                            <input
                                type="number"
                                className="border w-full rounded-md p-2 mt-1"
                                value={operation.cost || ""}
                                onChange={(e) =>
                                    setOperation({ ...operation, cost: e.target.value })
                                }
                                placeholder="예: 1000000"
                            />
                        </div>

                        {/* 결과 기록 */}
                        <div className="col-span-2">
                            <label className="text-sm text-gray-600">결과 기록</label>
                            <textarea
                                className="border w-full rounded-md p-3 mt-1 h-32"
                                value={operation.resultNote || ""}
                                onChange={(e) =>
                                    setOperation({ ...operation, resultNote: e.target.value })
                                }
                                placeholder="수술 결과 및 주요 소견을 입력하세요."
                            />
                        </div>
                    </div>

                    {/* 예상 소요시간 */}
                    <div>
                        <label className="text-sm text-gray-600">예상 소요시간 (분)</label>
                        <input
                            type="number"
                            className="border w-full rounded-md p-2 mt-1"
                            value={operation.duration || ""}
                            onChange={(e) =>
                                setOperation({ ...operation, duration: e.target.value })
                            }
                            placeholder="예: 120"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleUpdate}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
                        >
                            💾 수정 저장
                        </button>
                    </div>
                </section>

                {/* ─────────────────────── 의료진 관리 ─────────────────────── */}
                <section className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">
                        👨‍⚕️ 참여 의료진 등록
                    </h3>

                    <div className="relative">
                        <div className="flex gap-2">
                            <input
                                placeholder="이름"
                                value={newStaff.name ?? ""}
                                onChange={(e) => handleSearchStaff(e.target.value)}
                                className="border p-2 flex-1 rounded-md"
                            />
                            <input
                                placeholder="역할 (집도의 / 간호사 등)"
                                value={newStaff.position}
                                onChange={(e) =>
                                    setNewStaff({ ...newStaff, position: e.target.value })
                                }
                                className="border p-2 flex-1 rounded-md"
                            />
                            <button
                                onClick={handleAddStaff}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                                ➕ 추가
                            </button>
                        </div>

                        {suggestions.length > 0 && (
                            <ul className="absolute z-10 bg-white border mt-1 rounded-md shadow w-full max-h-40 overflow-y-auto">
                                {suggestions.map((staff, idx) => (
                                    <li
                                        key={staff.staffId || `${staff.name}-${idx}`}
                                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm text-gray-700"
                                        onClick={() => handleSelectSuggestion(staff)}
                                    >
                                        {staff.name} — {staff.position || "직책 미등록"}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {staffList.length > 0 ? (
                        <table className="w-full text-sm text-left border mt-3">
                            <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-2">이름</th>
                                <th className="p-2">직책</th>
                                <th className="p-2">관리</th>
                            </tr>
                            </thead>
                            <tbody>
                            {staffList.map((s, idx) => (
                                <tr
                                    key={s.staffId || `staff-${idx}`}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2">{s.position}</td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => handleDeleteStaff(s.staffId)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-md"
                                        >
                                            <FaTrashAlt className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 text-sm mt-3">
                            현재 참여 의료진이 없습니다.
                        </p>
                    )}
                </section>
                {/* ─────────────────────── 진료/처방 기록 ─────────────────────── */}
                <section className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <div className="flex gap-4 border-b pb-2">
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-3 py-1 rounded-t ${
                                activeTab === "history"
                                    ? "bg-blue-100 text-blue-700 font-semibold"
                                    : "text-gray-500"
                            }`}
                        >
                            📋 과거 진료내역
                        </button>
                        <button
                            onClick={() => setActiveTab("prescriptions")}
                            className={`px-3 py-1 rounded-t ${
                                activeTab === "prescriptions"
                                    ? "bg-blue-100 text-blue-700 font-semibold"
                                    : "text-gray-500"
                            }`}
                        >
                            💊 처방내역
                        </button>
                    </div>

                    {/* ──────────── 진료내역 ──────────── */}
                    {activeTab === "history" ? (
                        safeHistory.length === 0 ? (
                            <p className="text-gray-500">진료내역 없음</p>
                        ) : (
                            <>
                                <table className="w-full text-sm text-left border-t">
                                    <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="p-2">날짜</th>
                                        <th className="p-2">진료과</th>
                                        <th className="p-2">진단명</th>
                                        <th className="p-2">담당의</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {safeHistory.map((h,idx) => (
                                        <tr key={`${h.recordId}-${idx}`} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{h.createdAt}</td>
                                            <td className="p-2">{h.deptName}</td>
                                            <td className="p-2">{h.diagnosis}</td>
                                            <td className="p-2">{h.doctorName}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div className="mt-2">
                                    {historyPage < Math.ceil(historyTotal / 10) && (
                                        <button
                                            onClick={() => setHistoryPage(historyPage + 1)}
                                            className="
                w-full py-3
                flex items-center justify-center
                bg-blue-50 hover:bg-blue-100
                text-blue-700 font-semibold
                border-t border-gray-200
                transition
            "
                                        >
                                        +</button>
                                    )}
                                </div>
                            </>
                        )
                    ) : (
                        /* ──────────── 처방내역 ──────────── */
                        safePrescriptions.length === 0 ? (
                            <p className="text-gray-500">처방내역 없음</p>
                        ) : (
                            <>
                                <table className="w-full text-sm text-left border-t">
                                    <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="p-2">처방일</th>
                                        <th className="p-2">약품명</th>
                                        <th className="p-2">용량</th>
                                        <th className="p-2">투여기간</th>
                                        <th className="p-2">담당의</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {safePrescriptions.map((p, idx) => (
                                        <tr key={p.prescriptionId || `presc-${idx}`}>
                                            <td>{p.createdAt}</td>
                                            <td>{p.type}</td>
                                            <td>
                                                {p.type === "DRUG" && `${p.drugName}×${p.dosage}ml`}
                                                {p.type === "TEST" && `${p.testName} (${p.testArea})`}
                                                {p.type === "INJECTION" && `${p.injectionName}×${p.dosage}ml`}
                                            </td>
                                            <td>{p.duration}</td>
                                            <td>{p.doctorName}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-center mt-6">
                                    {prescPage < Math.ceil(prescTotal / 10) && (
                                        <button
                                            onClick={() => setPrescPage(prescPage + 1)}
                                            className=" w-full py-3
                                                        flex items-center justify-center
                                                        bg-blue-50 hover:bg-blue-100
                                                        text-blue-700 font-semibold
                                                        border-t border-gray-200
                                                        transition"
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                            </>
                        )
                    )}
                </section>


                {/* ─────────────────────── 변경 로그 ─────────────────────── */}
                <section className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">🗂 변경 로그</h3>
                    {logs.length === 0 ? (
                        <p className="text-gray-500 text-sm">로그 없음</p>
                    ) : (
                        <ul className="divide-y">
                            {logs.map((log, idx) => (
                                <li key={log.logId || `log-${idx}`} className="py-2 text-gray-700 text-sm">
                                    <strong className="text-gray-800">{log.userName}</strong> — {log.action}
                                    <span className="text-gray-400 text-xs ml-2">{log.createdAt}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
