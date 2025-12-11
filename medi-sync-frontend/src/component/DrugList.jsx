import React, { useEffect, useState } from "react";
import {
  addDrug,
  deleteDrug,
  getDrugs,
  getDrugsPaged,
  updateDrug,
} from "../api/drugApi";
import DrugTable from "./DrugTable";
import DrugModal from "./DrugModal";
import AdminHeader from "./AdminHeader";

import { FaPlusCircle } from "react-icons/fa";

export default function DrugList() {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 데이터 로드
  const fetchData = async () => {
    try {
      const res = await getDrugsPaged(page, size);

      setDrugs(res.data.items);
      setFilteredDrugs(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("❌ 약품 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  // 저장 (등록/수정)
  const handleSave = async (data) => {
    console.log("💾 서버로 보내는 데이터:", data);
    const skipFields = [
      "insurerCode",
      "insurerName",
      "insuranceCode",
      "inventoryId",
    ];
    for (const [key, value] of Object.entries(data)) {
      if (skipFields.includes(key)) continue; // 검사 제외

      if (value === null || value === undefined || value === "") {
        console.warn(`⛔ '${key}' 값이 비어있어 저장 중단함.`);
        alert("값이 빈 채로 저장할 수 없습니다.");
        return; // 저장 막기
      }

      if (["unitPrice", "quantity"].includes(key)) {
        if (typeof value !== "number" || isNaN(value)) {
          console.warn(`⛔ '${key}' 값이 숫자가 아니라 저장 중단함.`);
          alert("수량, 가격란에는 숫자를 입력해야합니다.");
          return;
        }
      }

      if (["unitPrice", "quantity"].includes(key)) {
        if (value < 0) {
          console.warn(`⛔ '${key}' 가격/수량은 0 이상이어야함.`);
          alert("가격/수량은 0 이상이어야 합니다.");
          return;
        }
      }
    }
    try {
      if (editData) await updateDrug(data);
      else await addDrug(data);
      fetchData();
      alert("정보가 저장되었습니다.");
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-0 mt-0">
        {/* 제목 + 검색 + 등록버튼 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
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
        <div className="flex justify-center mt-6 gap-2">
          {/* 이전 버튼 */}
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
          >
            이전
          </button>

          {/* 페이지 번호 버튼 */}
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`
                    px-3 py-1 rounded 
                    ${
                      page === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }
                `}
              >
                {pageNum}
              </button>
            );
          })}

          {/* 다음 버튼 */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
          >
            다음
          </button>
        </div>
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
