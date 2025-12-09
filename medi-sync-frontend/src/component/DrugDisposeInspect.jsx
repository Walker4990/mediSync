import React, { useState, useEffect } from "react";
import axios from "axios";
export default function DrugDisposeInspect({
  setSelectedDrug,
  filter,
  inspectionList,
  fetchInspectionList,
}) {
  //검사 모달 리스트 가져오기
  const fetchDrugDetail = async (checkId) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/inspection/month/detail/${checkId}`
      );

      const list = res.data; // detailList 그대로 받음

      if (!list || list.length === 0) return;

      // 공통 정보는 첫 번째 row에서 가져옴
      const base = list[0];

      // PASS/WARNING/DISPOSE 세 줄로 정리
      const results = list.map((item) => ({
        detailId: item.detailId,
        isChecked: item.isChecked,
        status: item.status,
        quantity: item.quantity,
        note: item.note,
      }));

      // WARNING 또는 DISPOSE 있으면 폐기 가능
      const canDispose = results.some(
        (r) => r.status === "WARNING" || r.status === "DISPOSE"
      );

      // 최종 정리된 객체
      const summary = {
        unit: base.unit,
        totalQuantity: base.totalQuantity,
        minStock: base.minStock,
        insuranceCode: base.insuranceCode,
        supplier: base.supplier,
        checkId: base.checkId,
        drugName: base.drugName,
        location: base.location,
        expirationDate: base.expirationDate,
        purchaseId: base.purchaseId,
        results, // 3줄 모두 저장
        canDispose,
      };

      setSelectedDrug(summary);
      console.log("검사 모달 상세 조회 : ", res.data);
    } catch (err) {
      console.error("검사 상세 조회 실패", err);
    }
  };

  useEffect(() => {
    if (filter === "inspected") {
      fetchInspectionList();
    }
  }, [filter]);

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 col-span-2 h-[600px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">이번 달 검사 결과</h2>

      {inspectionList.length === 0 ? (
        <p className="text-gray-500 mt-10 text-sm text-center">
          표시할 항목이 없습니다.
        </p>
      ) : (
        <ul className="divide-y-3">
          {inspectionList.map((item) => (
            <li
              key={item.checkId}
              onClick={() => fetchDrugDetail(item.checkId)}
              className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md hover:bg-blue-50/50 transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {item.drugName}
                  </p>
                  <p className="text-xs text-gray-500">종류: {item.unit}</p>
                  <p className="text-xs text-gray-500">
                    가격: {item.unitPrice}
                  </p>
                  <p className="text-xs text-gray-500">
                    제약사: {item.supplier}
                  </p>
                  <p className="text-xs text-gray-500">위치: {item.location}</p>
                </div>

                {/* 수량만 표시 */}
                <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                  {item.totalQuantity}개
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
