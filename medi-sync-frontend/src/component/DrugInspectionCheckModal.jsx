import { motion } from "framer-motion";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function DrugInspectionCheckModal({
  selectedDrug,
  setSelectedDrug,
  fetchInspectionList,
  fetchDrugList,
  filter,
}) {
  //검사 완료 표시
  const checkDrugInspection = async (detailId) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/inspection/check/${detailId}`
      );

      // 🔥 프론트에서 즉시 상태 업데이트
      setSelectedDrug((prev) => {
        if (!prev) return prev;

        const updatedResults = prev.results.map((r) =>
          r.detailId === detailId ? { ...r, isChecked: "CHECK" } : r
        );

        return { ...prev, results: updatedResults };
      });
    } catch (err) {
      console.error("체크 실패 : ", err);
    }
  };

  //검사한거 폐기처리하기
  const disposDrug = async (detailId, quantity, purchaseId) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/inspection/dispose/${detailId}/${quantity}/${purchaseId}`
      );
      await fetchInspectionList();
      await fetchDrugList();
      setSelectedDrug(null);
      console.log("폐기처리 완료");
      alert("폐기처리가 완료되었습니다.");
    } catch (err) {
      console.error("약품 폐기 실패", err);
    }
  };
  const closeModal = () => {
    setSelectedDrug(null);
  };
  useEffect(() => {
    if (filter === "inspected") {
      fetchInspectionList();
    }
  }, [filter]);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-[800px] relative"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          {selectedDrug.drugName} 상세 정보
        </h2>

        {/* 좌 - 구분선 - 우 */}
        <div className="grid grid-cols-[1fr_auto_1.5fr] gap-6">
          {/* LEFT */}
          <div className="flex flex-col justify-around h-full text-sm text-gray-700">
            <p>
              <span className="font-semibold">위치:</span>{" "}
              {selectedDrug.location}
            </p>
            <p>
              <span className="font-semibold">수량: </span>{" "}
              {selectedDrug.totalQuantity}개
            </p>
            <p>
              <span className="font-semibold">종류:</span> {selectedDrug.unit}
            </p>
            <p>
              <span className="font-semibold">유통기한:</span>{" "}
              {selectedDrug.expirationDate}
            </p>
            <p>
              <span className="font-semibold">검사 ID:</span>{" "}
              {selectedDrug.checkId}
            </p>
            <p>
              <span className="font-semibold">제조업자:</span>{" "}
              {selectedDrug.supplier}
            </p>

            <p>
              <span className="font-semibold">보험 코드:</span>{" "}
              {selectedDrug.insuranceCode}
            </p>
            <p>
              <span className="font-semibold">장소 코드:</span>{" "}
              {selectedDrug.purchaseId}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-300" />

          {/* RIGHT: 검사결과 */}
          <div className="space-y-4">
            {selectedDrug.results.map((r) => {
              // 상태별 색상
              const colorMap = {
                PASS: "text-blue-600 border-blue-300",
                WARNING: "text-blue-600 border-blue-300",
                DISPOSE: "text-blue-600 border-blue-300",
              };

              const tagColor = {
                PASS: "bg-green-400",
                WARNING: "bg-yellow-400",
                DISPOSE: "bg-red-400",
              };

              return (
                <div
                  key={r.status}
                  className={`p-4 bg-white border-2 rounded-xl shadow-sm ${
                    colorMap[r.status]
                  }`}
                >
                  {/* 상태 태그 + 텍스트 */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* 색상 표시 원 */}
                    <span
                      className={`w-3 h-3 rounded-full ${tagColor[r.status]}`}
                    ></span>

                    {/* STATUS 제목 */}
                    <p
                      className={`font-bold ${
                        colorMap[r.status].split(" ")[0]
                      }`}
                    >
                      {r.status}
                    </p>
                  </div>

                  {/* 개수 */}
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">개수:</span> {r.quantity}개
                  </p>

                  {/* 비고 */}
                  {r.note && (
                    <p className="text-xs bg-gray-50 border rounded p-2 mb-3">
                      비고: {r.note}
                    </p>
                  )}
                  {/*버튼 영역*/}

                  {r.isChecked === "CHECK" ? (
                    <div className="flex gap-3 justify-end">
                      <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded shadow">
                        확인 완료
                      </button>
                    </div>
                  ) : r.quantity === 0 || r.status == "PASS" ? (
                    <div className="flex gap-3 justify-end">
                      <button
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 shadow"
                        onClick={() => {
                          checkDrugInspection(r.detailId);
                        }}
                      >
                        확인
                      </button>
                    </div>
                  ) : (
                    r.status !== "PASS" && (
                      <div className="flex gap-3 justify-end">
                        <button
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 shadow"
                          onClick={() =>
                            disposDrug(
                              r.detailId,
                              r.quantity,
                              selectedDrug.purchaseId
                            )
                          }
                        >
                          폐기
                        </button>
                        <button
                          className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400 shadow"
                          onClick={() => {
                            checkDrugInspection(r.detailId);
                          }}
                        >
                          반려
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
