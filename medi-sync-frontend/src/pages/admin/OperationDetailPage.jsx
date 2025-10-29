import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";

export default function OperationDetailPage() {
    const { operationId } = useParams();
    const [operation, setOperation] = useState(null);
    const [patient, setPatient] = useState(null);
    const [logs, setLogs] = useState([]);
    const [history, setHistory] = useState([]);
    const [newStaff, setNewStaff] = useState({ name: "", role: "" });
    const [activeTab, setActiveTab] = useState("history"); // history | conditions
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        fetchDetail();
        fetchLogs();
    }, [operationId]);

    const fetchDetail = async () => {
        const res = await axios.get(`http://192.168.0.24:8080/api/operation/${operationId}`);
        setOperation(res.data);
        if (res.data.patientId) {
            fetchPatient(res.data.patientId);
        }
    };

    const fetchPatient = async (patientId) => {
        const res = await axios.get(`http://192.168.0.24:8080/api/patients/${patientId}/detail`);
        setPatient(res.data);
        // 추가 API로 과거 진료, 기저질환 불러오기
        const [hRes, pRes] = await Promise.all([
            axios.get(`http://192.168.0.24:8080/api/patients/${patientId}/records`),
            axios.get(`http://192.168.0.24:8080/api/patients/${patientId}/prescriptions`),
        ]);
        setHistory(hRes.data);
        setPrescriptions(pRes.data);
    };

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
        if (!newStaff.name || !newStaff.role) return alert("이름과 역할을 입력하세요.");
        await axios.post(`http://192.168.0.24:8080/api/operation/${operationId}/staff`, newStaff);
        alert("✅ 의료진 추가 완료");
        setNewStaff({ name: "", role: "" });
        fetchDetail();
    };

    if (!operation) return <p className="p-8 text-gray-500 text-center">⏳ 수술 정보를 불러오는 중...</p>;

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader />

            <div className="max-w-6xl mx-auto p-10 space-y-10">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">
                    🏥 수술 상세 정보 (ID: {operationId})
                </h2>

                {/* ✅ 환자 요약 섹션 */}
                {patient && (
                    <section className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">👤 환자 정보</h3>
                        <div className="grid grid-cols-4 gap-4 mt-3 text-gray-800">
                            <div><strong>이름:</strong> {patient.name}</div>
                            <div><strong>성별:</strong> {patient.gender}</div>
                            <div><strong>나이:</strong> {patient.age}세</div>
                            <div><strong>연락처:</strong> {patient.phone}</div>
                            <div><strong>주소:</strong> {patient.address}</div>
                            <div><strong>보험사:</strong> {patient.insurerName}</div>
                            <div><strong>상태:</strong> {patient.status}</div>
                            <div><strong>등록일:</strong> {patient.createdAt}</div>
                        </div>
                    </section>
                )}

                {/* ✅ 수술 정보 */}
                <section className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">수술 정보</h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-gray-600">수술명</label>
                            <input
                                className="border w-full rounded-md p-2 mt-1"
                                value={operation.operationName || ""}
                                onChange={(e) =>
                                    setOperation({ ...operation, operationName: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">마취 유형</label>
                            <input
                                className="border w-full rounded-md p-2 mt-1"
                                value={operation.anesthesiaType || ""}
                                onChange={(e) =>
                                    setOperation({ ...operation, anesthesiaType: e.target.value })
                                }
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm text-gray-600">결과 기록</label>
                            <textarea
                                className="border w-full rounded-md p-3 mt-1 h-32"
                                value={operation.resultNote || ""}
                                onChange={(e) =>
                                    setOperation({ ...operation, resultNote: e.target.value })
                                }
                            />
                        </div>
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
                <section className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">👨‍⚕️ 참여 의료진 등록</h3>
                    <div className="flex gap-2">
                        <input
                            placeholder="이름"
                            value={newStaff.name}
                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                            className="border p-2 flex-1 rounded-md"
                        />
                        <input
                            placeholder="역할 (집도의 / 간호사 등)"
                            value={newStaff.role}
                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                            className="border p-2 flex-1 rounded-md"
                        />
                        <button
                            onClick={handleAddStaff}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            ➕ 추가
                        </button>
                    </div>
                </section>
                {/* ✅ 하단 탭: 과거 진료 / 기저질환 */}
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

                    {/* ✅ 과거 진료내역 */}
                    {activeTab === "history" ? (
                        history.length === 0 ? (
                            <p className="text-gray-500">진료내역 없음</p>
                        ) : (
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
                                {history.map((h) => (
                                    <tr key={h.recordId} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{h.createdAt}</td>
                                        <td className="p-2">{h.deptName}</td>
                                        <td className="p-2">{h.diagnosis}</td>
                                        <td className="p-2">{h.doctorName}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )
                    ) : /* ✅ 처방내역 */ prescriptions.length === 0 ? (
                        <p className="text-gray-500">처방내역 없음</p>
                    ) : (
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
                            {prescriptions.map((p) => (
                                <tr key={p.prescriptionId}>
                                    <td>{p.createdAt}</td>
                                    <td>{p.type}</td>
                                    <td>
                                        {p.type === "DRUG" && `${p.drugName}×${p.dosage}ml`}
                                        {p.type === "TEST" && `${p.testName} (${p.testArea})`}
                                        {p.type === "INJECTION" && `${p.injectionName} ×${p.dosage}ml`}
                                    </td>
                                    <td>{p.doctorName}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* ✅ 로그 */}
                <section className="bg-white rounded-2xl shadow p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">🗂 변경 로그</h3>
                    {logs.length === 0 ? (
                        <p className="text-gray-500 text-sm">로그 없음</p>
                    ) : (
                        <ul className="divide-y">
                            {logs.map((log) => (
                                <li key={log.logId} className="py-2 text-gray-700 text-sm">
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
