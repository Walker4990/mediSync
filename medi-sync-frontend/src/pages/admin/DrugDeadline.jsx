import axios from "axios";

import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import AdminHeader from "../../component/AdminHeader";

export default function DrugDeadline() {
  const [filter, setFilter] = useState("all"); // all / inspected / disposed
  const [drugList, setDrugList] = useState([]);
  const [inspectionList, setInspectionList] = useState([]);

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />

      <main className="max-w-7xl mx-auto pt-24 px-8">
        {/* 제목 + 탭 버튼 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-600">폐기 관리 페이지</h1>

          <div className="flex gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded font-medium ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              전체 약품
            </button>

            <button
              onClick={() => setFilter("inspected")}
              className={`px-4 py-2 rounded font-medium ${
                filter === "inspected"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              이번 달 검사
            </button>

            <button
              onClick={() => setFilter("disposed")}
              className={`px-4 py-2 rounded font-medium ${
                filter === "disposed"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              폐기 완료
            </button>
          </div>
        </div>

        {/* 메인 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 전체 약품 리스트 */}
          <div className="bg-white shadow-lg rounded-xl p-5 col-span-1 h-[600px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">전체 약품 목록</h2>

            {drugList.length === 0 ? (
              <p className="text-gray-500 text-center mt-20 text-sm">
                약품이 없습니다.
              </p>
            ) : (
              <ul className="divide-y">
                {drugList.map((drug) => (
                  <li
                    key={drug.drugCode}
                    className="p-3 hover:bg-blue-50 transition rounded cursor-pointer"
                  >
                    <div className="font-medium">{drug.drugName}</div>
                    <div className="text-sm text-gray-500">
                      코드 : {drug.drugCode}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 검사 리스트 + 폐기 버튼 */}
          <div className="bg-white shadow-lg rounded-xl p-5 col-span-2 h-[600px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {filter === "all" && "전체 약품 상세"}
              {filter === "inspected" && "이번 달 검사 결과"}
              {filter === "disposed" && "폐기 완료 내역"}
            </h2>

            {inspectionList.length === 0 ? (
              <p className="text-gray-500 mt-10 text-sm text-center">
                표시할 항목이 없습니다.
              </p>
            ) : (
              <ul className="divide-y">
                {inspectionList.map((item) => (
                  <li
                    key={item.checkId}
                    className="flex justify-between items-center p-4 hover:bg-gray-50 rounded transition"
                  >
                    <div>
                      <p className="font-medium">{item.drugName}</p>
                      <p className="text-sm text-gray-500">
                        검사일 : {item.date}
                      </p>
                    </div>

                    {/* 폐기 버튼 */}
                    {filter !== "disposed" && (
                      <button className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700">
                        폐기 처리
                      </button>
                    )}

                    {filter === "disposed" && (
                      <span className="text-green-600 font-medium">
                        폐기 완료
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
