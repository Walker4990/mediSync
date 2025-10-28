import React, { useEffect, useState } from "react";
import { addDrug, deleteDrug, getDrugs, updateDrug } from "../../api/drugApi";
import DrugTable from "../../component/DrugTable";
import DrugModal from "../../component/DrugModal";
import AdminHeader from "../../component/AdminHeader";

import {FaPlusCircle} from "react-icons/fa";

export default function DrugPage() {
    const [drugs, setDrugs] = useState([]);
    const [filteredDrugs, setFilteredDrugs] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");


    // 데이터 로드
    const fetchData = async () => {
        try {
            const res = await getDrugs();
            setDrugs(res.data);
            setFilteredDrugs(res.data);
        } catch (error) {
            console.error("❌ 약품 목록 불러오기 실패:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 저장 (등록/수정)
    const handleSave = async (data) => {
        try {
            if (editData) await updateDrug(data);
            else await addDrug(data);
            fetchData();
        } catch (error) {
            console.error("❌ 저장 실패:", error);
        } finally {
            setModalOpen(false);
        }
    };

    // 삭제
    const handleDelete = async (code) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteDrug(code);
            fetchData();
        } catch (error) {
            console.error("❌ 삭제 실패:", error);
        }
    };

    // 검색
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        if (!term) {
            setFilteredDrugs(drugs);
        } else {
            const filtered = drugs.filter((drug) =>
                [drug.drugName, drug.insurerCode, drug.supplier]
                    .filter(Boolean)
                    .some((v) => v.toLowerCase().includes(term))
            );
            setFilteredDrugs(filtered);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* 상단 관리자 헤더 */}
            <AdminHeader />

            {/* 메인 컨텐츠 */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-20">
                {/* 페이지 제목 + 검색 + 등록버튼 */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">💊 약품 관리</h1>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* 검색창 */}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="약품명 / 보험코드 / 공급처 검색"
                            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-72 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
                        />
                        {/* 등록 버튼 */}
                        <button
                            onClick={() => {
                                setEditData(null);
                                setModalOpen(true);
                            }}
                            className="flex items-center text-green-600 hover:text-green-800 p-1 rounded-md transition duration-150 ease-in-out"
                        >
                            <FaPlusCircle className="w-5 h-5 mr-1" />
                        </button>
                    </div>
                </div>

                {/* 약품 테이블 영역 */}
                <section className="bg-white rounded-xl shadow border border-gray-100 p-4">
                    {filteredDrugs.length > 0 ? (
                        <DrugTable
                            drugs={filteredDrugs}
                            onEdit={(d) => {
                                setEditData(d);
                                setModalOpen(true);
                            }}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="text-center text-gray-500 py-10 text-sm">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </section>
            </main>

            {/* 등록 / 수정 모달 */}
            <DrugModal
                visible={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editData={editData}
            />
        </div>
    );
}
