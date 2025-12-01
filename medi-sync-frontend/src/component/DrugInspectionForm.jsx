import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";

export default function DrugInspectionForm({ selectedDrug, onFinish }) {
  const API_URL = "http://192.168.0.24:8080/api/inspection";
  const TEST_URL = "http://localhost:8080/api/inspection";

  const [details, setDetails] = useState([
    { status: "PASS", label: "정상 (PASS)", quantity: 0, note: "" },
    { status: "WARNING", label: "이상 (WARNING)", quantity: 0, note: "" },
    { status: "DISPOSE", label: "폐기 요망 (DISPOSE)", quantity: 0, note: "" },
  ]);

  const totalChecked = useMemo(
    () => details.reduce((sum, d) => sum + Number(d.quantity || 0), 0),
    [details]
  );
  const hasHangul = (value) => {
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value);
  };
  const updateDetail = (i, key, value) => {
    const clone = [...details];
    clone[i][key] = value;
    setDetails(clone);
  };

  const submitInspection = async () => {
    if (totalChecked !== selectedDrug.totalQuantity) {
      alert("총 검사 수량이 실제 재고와 일치해야 합니다.");
      return;
    }

    // 🔥 quantity에 한글이 들어있으면 제출 막기
    for (const d of details) {
      if (hasHangul(String(d.quantity))) {
        alert("수량에는 숫자만 입력해야 합니다. (한글 입력 불가)");
        return;
      }
    }
    try {
      const res = await axios.post(`${TEST_URL}/register`, {
        drugCode: selectedDrug.drugCode,
        inspections: details,
      });

      alert("검사 등록 완료");
      onFinish();
    } catch (err) {
      console.error("검사 등록 실패", err);
      alert("검사 등록 실패");
    }
  };

  return (
    <>
      <h3 className="font-medium mb-2">검사 결과 입력</h3>
      {details.map((d, idx) => (
        <div
          key={idx}
          className="grid grid-cols-12 gap-3 bg-gray-50 p-3 rounded border mb-2"
        >
          <div className="col-span-3 font-medium">{d.label}</div>
          <input
            type="number"
            className="col-span-3 border rounded px-2 -y-1"
            value={d.quantity}
            min={0}
            onChange={(e) => updateDetail(idx, "quantity", e.target.value)}
          />
          <input
            type="text"
            className="col-span-6 border rounded px-3 py-1"
            value={d.note}
            onChange={(e) => updateDetail(idx, "note", e.target.value)}
            placeholder="비고"
          ></input>
        </div>
      ))}

      <p className="text-sm text-gray-600 mt-2">
        총 검사 수량: <span className="font-bold">{totalChecked}</span>
      </p>

      <button
        onClick={submitInspection}
        className="mt-5 bg-blue-600 text-white px-5 py-2 rounded"
      >
        검사 등록
      </button>
    </>
  );
}
