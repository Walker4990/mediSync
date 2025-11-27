import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // 검색 + 페이지 변경 시 API 호출
    useEffect(() => {
        fetchPatients();
    }, [page, size, search]);

    const fetchPatients = async () => {
        const res = await axios.get(`http://192.168.0.24:8080/api/patients`, {
            params: { page, size, keyword: search }
        });

        setPatients(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
    };

    // 🔥 프론트 단 필터링 (안전장치 — API 검색이든 프론트 검색이든 무조건 정확하게 표시됨)
    const filtered = patients.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase());
        const phoneMatch = p.phone?.includes(search);
        return nameMatch || phoneMatch;
    });

    // 🔥 검색 중이면 filtered만 보여주고, 아니면 patients 그대로 사용
    const list = search ? filtered : patients;

    return (
        <div className="bg-gray-50 min-h-screen font-pretendard">
            <AdminHeader />

            <main className="max-w-7xl mx-auto pt-24 px-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-8">
                    환자 관리 목록
                </h1>

                {/* 검색 */}
                <div className="mb-6 flex justify-between items-center">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                        placeholder="이름 또는 전화번호 검색"
                        className="border border-gray-300 px-4 py-2 rounded-md w-1/3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <button
                        onClick={fetchPatients}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        새로고침
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md text-sm">
                        <thead className="bg-gray-100 text-gray-800 font-semibold">
                        <tr>
                            <th className="py-3 px-4">ID</th>
                            <th className="py-3 px-4">이름</th>
                            <th className="py-3 px-4">주민번호</th>
                            <th className="py-3 px-4">전화번호</th>
                            <th className="py-3 px-4">주소</th>
                            <th className="py-3 px-4">보험 동의</th>
                            <th className="py-3 px-4">상태</th>
                            <th className="py-3 px-4">등록일</th>
                            <th className="py-3 px-4">수정일</th>
                        </tr>
                        </thead>

                        <tbody>
                        {list.map((p) => (
                            <tr
                                key={p.patientId}
                                onClick={() => setSelectedPatient(p)}
                                className="border-b hover:bg-gray-50 text-gray-700 cursor-pointer"
                            >
                                <td className="py-2 px-4">{p.patientId}</td>
                                <td className="py-2 px-4 font-medium">{p.name}</td>
                                <td className="py-2 px-4">{p.residentNo}</td>
                                <td className="py-2 px-4">{p.phone}</td>
                                <td className="py-2 px-4">{p.address}</td>

                                <td className="py-2 px-4 text-center">
                                    {p.consentInsurance ? (
                                        <span className="text-green-500 font-semibold">동의</span>
                                    ) : (
                                        <span className="text-gray-400">미동의</span>
                                    )}
                                </td>

                                <td className="py-2 px-4 text-center">
                                    {p.status === "ACTIVE" ? (
                                        <span className="text-green-600 font-semibold">활성</span>
                                    ) : (
                                        <span className="text-red-500 font-semibold">비활성</span>
                                    )}
                                </td>

                                <td className="py-2 px-4 text-gray-500">{p.createdAt}</td>
                                <td className="py-2 px-4 text-gray-500">{p.updatedAt}</td>
                            </tr>
                        ))}

                        {list.length === 0 && (
                            <tr>
                                <td colSpan="10" className="text-center py-6 text-gray-500 italic">
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* 페이징 */}
                    <div className="flex justify-center mt-6 gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
                        >
                            이전
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-3 py-1 rounded ${
                                        page === pageNum
                                            ? "bg-emerald-500 text-white"
                                            : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
                        >
                            다음
                        </button>
                    </div>
                </div>
            </main>

            {/* 상세 보기 모달 */}
            {selectedPatient && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl p-8 relative animate-fadeInScale">
                        <button
                            type="button"
                            onClick={() => setSelectedPatient(null)}
                            className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            x
                        </button>

                        <h2 className="text-2xl font-bold text-blue-600 mb-4 border-b pb-3">
                            환자 상세 정보
                        </h2>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-sm leading-relaxed">
                            <p><span className="font-semibold text-gray-600">이름:</span> {selectedPatient.name}</p>
                            <p><span className="font-semibold text-gray-600">전화번호:</span> {selectedPatient.phone}</p>
                            <p><span className="font-semibold text-gray-600">주소:</span> {selectedPatient.address}</p>
                            <p><span className="font-semibold text-gray-600">주민번호:</span> {selectedPatient.residentNo}</p>
                            <p><span className="font-semibold text-gray-600">보험사:</span> {selectedPatient.insurerCode}</p>
                            <p><span className="font-semibold text-gray-600">보험 동의:</span> {selectedPatient.consentInsurance ? "동의" : "미동의"}</p>
                            <p><span className="font-semibold text-gray-600">상태:</span> {selectedPatient.status}</p>
                            <p><span className="font-semibold text-gray-600">등록일:</span> {selectedPatient.createdAt}</p>
                            <p><span className="font-semibold text-gray-600">수정일:</span> {selectedPatient.updatedAt}</p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                            >
                                닫기
                            </button>

                            <button
                                onClick={() => alert("진료 이력 보기")}
                                className="px-5 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition"
                            >
                                진료 이력 보기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
