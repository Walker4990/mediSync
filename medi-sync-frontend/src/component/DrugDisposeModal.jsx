import { motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function DrugDisposeAll({
  selectedDrugDispose,
  setSelectedDrugDispose,
  fetchDrugList,
  setDisposeQty,
  disposeQty,
}) {
  const [disposeMemo, setDisposeMemo] = useState("");
  let holdTimeout = useRef(null);
  let holdInterval = useRef(null);

  const startHold = (type) => {
    if (!selectedDrugDispose) return;

    const maxQty = selectedDrugDispose.quantity;

    // 🔥 1. 클릭 순간 +1 또는 -1 (즉시 반응)
    setDisposeQty((prev) =>
      type === "plus" ? Math.min(prev + 1, maxQty) : Math.max(prev - 1, 0)
    );

    // 혹시 남아 있는 interval/timeout 있으면 초기화
    clearTimeout(holdTimeout.current);
    clearInterval(holdInterval.current);

    // 🔥 2. 1초 유지해야 자동 반복 시작
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        setDisposeQty((prev) => {
          let newQty =
            type === "plus"
              ? Math.min(prev + 1, maxQty)
              : Math.max(prev - 1, 0);

          return newQty;
        });
      }, 80); // 연속 증가 속도
    }, 500); // 1초 대기
  };

  const stopHold = () => {
    clearTimeout(holdTimeout.current);
    clearInterval(holdInterval.current);
    holdTimeout.current = null;
    holdInterval.current = null;
  };

  //폐기 등록
  const inspectionDrug = async (drugCode, quantity, memo) => {
    if (quantity <= 0) {
      alert("폐기 수량은 최소 1개 이상 입니다.");
      return;
    }

    if (window.confirm("정말 폐기 하시겠습니까? (수량 : " + quantity + "개)")) {
      try {
        const res = await axios.put(
          `http://localhost:8080/api/inspection/drug/${drugCode}/${quantity}/${memo}`
        );
        alert("폐기 처리가 완료되었습니다.(폐기 수량 : " + quantity + "개)");
        setSelectedDrugDispose(null);
        fetchDrugList();
      } catch (err) {
        console.log("폐기 실패", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopHold();
    };
  }, []); // ← 언마운트 때만 실행됨
  {
    /*폐기 등록 모달 */
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      {/* 모달 박스 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-[600px] rounded-2xl shadow-2xl p-6 relative"
      >
        {/* x 버튼 */}
        <button
          onClick={() => {
            setSelectedDrugDispose(null);
            stopHold();
            setDisposeQty(0);
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
          폐기 등록
        </h2>

        {/* 내용 영역 */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
          {/* LEFT: 약 정보 */}
          <div className="text-sm text-gray-700 flex flex-col justify-center gap-2">
            <p>
              <span className="font-medium">약품명:</span>{" "}
              {selectedDrugDispose.drugName}
            </p>
            <p>
              <span className="font-medium">코드:</span>{" "}
              {selectedDrugDispose.drugCode}
            </p>
            <p>
              <span className="font-medium">수량:</span>{" "}
              {selectedDrugDispose.quantity}개
            </p>
            <p>
              <span className="font-medium">위치:</span>{" "}
              {selectedDrugDispose.location || "-"}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-300"></div>

          {/* RIGHT: 폐기 수량 조절 */}
          <div className="flex flex-col justify-center items-center gap-4">
            <p className="font-medium text-gray-700">폐기 수량</p>

            <div className="flex items-center gap-6 text-2xl font-bold text-gray-800">
              {/* minus 버튼 */}
              <button
                onPointerDown={() => {
                  console.log("◀ 버튼 눌림");
                  startHold("minus");
                }}
                onPointerUp={() => {
                  console.log("◀ 버튼 뗌");
                  stopHold();
                }}
                onPointerLeave={() => {
                  console.log("◀ 버튼 밖으로 이동");
                  stopHold();
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ◀
              </button>

              {disposeQty}

              {/* plus 버튼 */}
              <button
                onPointerDown={() => {
                  console.log("◀ 버튼 눌림");
                  startHold("plus");
                }}
                onPointerUp={() => {
                  console.log("◀ 버튼 뗌");
                  stopHold();
                }}
                onPointerLeave={() => {
                  console.log("◀ 버튼 밖으로 이동");
                  stopHold();
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
        {/* 메모 입력 */}
        <div className="mt-6">
          <label className="text-gray-700 font-medium">메모 (선택)</label>
          <textarea
            value={disposeMemo}
            onChange={(e) => setDisposeMemo(e.target.value)}
            placeholder="예: 유통기한 만료 / 품질 검사 불합격 / 약품 파손 등"
            className="w-full mt-2 p-3 border border-gray-300 rounded-xl resize-none h-24 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => {
              // TODO: 폐기 등록 API 연결
              console.log(
                "폐기 등록",
                selectedDrugDispose.drugCode,
                disposeQty
              );
              inspectionDrug(
                selectedDrugDispose.drugCode,
                disposeQty,
                disposeMemo
              );
            }}
            className="px-4 py-1 bg-red-500 text-white rounded-xl text-sm shadow hover:bg-red-600"
          >
            폐기
          </button>

          <button
            onClick={() => {
              setSelectedDrugDispose(null);
              stopHold();
              setDisposeQty(0);
            }}
            className="px-4 py-1 bg-gray-300 text-gray-800 rounded-xl text-sm shadow hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      </motion.div>
    </div>
  );
}
