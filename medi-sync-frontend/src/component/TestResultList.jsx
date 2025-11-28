import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function TestResultList({ title }) {
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);

    // 페이징
    const [page, setPage] = useState(1);
    const [size] = useState(5); // 페이지당 5개
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadResults();
    }, [page]);

    const loadResults = () => {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const patientId = decoded?.userId;

        axios
            .get(`http://192.168.0.24:8080/api/testResult/list/${patientId}`, {
                params: { page, size }
            })
            .then((res) => {
                const items = res.data.items ?? [];        // null-safe
                const pages = res.data.totalPages ?? 1;    // null-safe
                setResults(items);
                setTotalPages(pages);
            })
            .catch((err) => console.log("검사결과 조회 실패 : ", err));
    };

    // 상세 조회
    const handleClick = (resultId) => {
        axios.get(`http://192.168.0.24:8080/api/testResult/${resultId}`)
            .then((res) => setSelectedResult(res.data))
            .catch((err) => console.log("상세 조회 실패 : ", err));
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">

            <div className="grid grid-cols-2 gap-6">

                {/* 왼쪽 리스트 */}
                <div className="space-y-4">

                    {results.length === 0 && (
                        <p className="text-gray-500">조회 가능한 검사 결과가 없습니다.</p>
                    )}

                    {results.map((r) => (
                        <div
                            key={r.testResultId}
                            className={`p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-50 transition
                                ${selectedResult?.testResultId === r.testResultId ? "border border-blue-400" : ""}
                            `}
                            onClick={() => handleClick(r.testResultId)}
                        >
                            <div className="p-4 bg-white border-l-4 border-blue-500 shadow-md rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{r.testName}</h3>
                                    <p className="text-gray-500">{r.testDate} | {r.testArea}</p>
                                </div>
                                <span className={`px-3 py-1 text-sm rounded-full ${
                                    r.status === "COMPLETED"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                }`}>
    {r.status}
  </span>
                            </div>

                        </div>
                    ))}

                    {/* 페이징 UI */}
                    <div className="flex justify-center gap-3 mt-4">

                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            이전
                        </button>

                        <span className="px-3 py-1 font-semibold">
                            {page} / {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            다음
                        </button>

                    </div>

                </div>

                {/* 오른쪽 상세 패널 */}
                <div className="bg-white shadow p-6 rounded-lg min-h-[300px]">
                    {!selectedResult ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">

                            <p className="text-gray-500">검사 결과를 선택하세요.</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-blue-700">
                                {selectedResult?.testName}
                            </h3>

                            <div className="space-y-2 mb-6">
                                <p className="text-gray-700">
                                    <span className="font-semibold">검사일:</span> {selectedResult?.testDate}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">부위:</span> {selectedResult?.testArea}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">상태:</span>{" "}
                                    <span
                                        className={
                                            selectedResult?.status === "COMPLETED"
                                                ? "text-green-600 font-bold"
                                                : "text-yellow-600 font-bold"
                                        }
                                    >
                        {selectedResult?.status}
                    </span>
                                </p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="font-semibold text-blue-800">검사 결과</p>
                                <p className="text-sm text-gray-700 mt-1">
                                    {selectedResult?.resultValue}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-semibold text-gray-800">비고</p>
                                <p className="text-sm text-gray-700 mt-1">
                                    {selectedResult?.resultNote}
                                </p>
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}
