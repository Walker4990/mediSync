import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import AdminHeader from "../../component/AdminHeader";
import DrugInsectionFilterTabs from "../../component/DrugInsectionFilterTabs";
import DrugInspectionList from "../../component/DrugInspectionList";
import DrugInsectionDetail from "../../component/DrugInsectionDetail";
import DrugInspectionForm from "../../component/DrugInspectionForm";

export default function DrugInspection() {
  //해당 약품 글릭 시 약 정보 저장할 장소
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [filter, setFilter] = useState("all");

  //약 검사 페이지
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />

      {/* 컨텐츠 영역 */}
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <DrugInsectionFilterTabs filter={filter} setFilter={setFilter} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/*검사 페이지 레이아웃 */}
          <DrugInspectionList
            filter={filter}
            onSelectDrug={(drug) => setSelectedDrug(drug)}
          />

          {/*약품 상세 + 검사 입력 */}
          <div className="bg-white shadow-xl rounded-xl p-5 col-span-2">
            {selectedDrug ? (
              <>
                <DrugInsectionDetail drug={selectedDrug} />
                <DrugInspectionForm
                  selectedDrug={selectedDrug}
                  onFinish={() => setSelectedDrug(null)}
                />
              </>
            ) : (
              <p className="text-gray-500 text-center mt-40">
                좌측에서 약품을 선택하세요.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
