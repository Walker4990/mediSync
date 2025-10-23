import React, { useState } from "react";
import axios from "axios";

export default function DrugSearchModal({ isOpen, onClose, onSelect }) {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);

    if (!isOpen) return null;

    const handleSearch = async () => {
        try {
            const res = await axios.get(`http://192.168.0.24:8080/api/drug/search?keyword=${keyword}`);
            setResults(res.data);
        } catch {
            setResults([]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
                <h2 className="text-lg font-bold mb-4 text-blue-700">💊 약품 검색</h2>
                <div className="flex mb-3">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="약품명 또는 코드 입력"
                        className="flex-1 border p-2 rounded"
                    />
                    <button
                        onClick={handleSearch}
                        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        검색
                    </button>
                </div>

                <table className="w-full border text-sm">
                    <thead className="bg-blue-50 text-blue-700">
                    <tr>
                        <th className="p-2 border">코드</th>
                        <th className="p-2 border">이름</th>
                        <th className="p-2 border">제형</th>
                        <th className="p-2 border">단가</th>
                        <th className="p-2 border"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.length > 0 ? (
                        results.map((drug) => (
                            <tr key={drug.drugCode} className="hover:bg-blue-50">
                                <td className="p-2 border">{drug.drugCode}</td>
                                <td className="p-2 border">{drug.drugName}</td>
                                <td className="p-2 border">{drug.form}</td>
                                <td className="p-2 border">{drug.unitPrice}</td>
                                <td className="p-2 border text-center">
                                    <button
                                        onClick={() => {
                                            onSelect(drug);
                                            onClose();
                                        }}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                    >
                                        선택
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center p-3 text-gray-500">
                                검색 결과 없음
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                <button
                    onClick={onClose}
                    className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded"
                >
                    닫기
                </button>
            </div>
        </div>
    );
}
