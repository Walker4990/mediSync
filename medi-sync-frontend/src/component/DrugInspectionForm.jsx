import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";

export default function DrugInspectionForm({ selectedDrug, onFinish }) {
  const API_URL = "http://192.168.0.24:8080/api/inspection";
  const TEST_URL = "http://localhost:8080/api/inspection";

  const [allLocation, setAllLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  const fetchDrugLocation = async () => {
    try {
      console.log("약 코드 : ", selectedDrug.drugCode);
      const res = await axios.get(
        `http://localhost:8080/api/inspection/drug/location/${selectedDrug.drugCode}`
      );
      setAllLocation(res.data);

      console.log("약 주소 리스트 : ", res.data);
    } catch (err) {
      console.error("주소 목록 가져오기 실패", err);
    }
  };

  useEffect(() => {
    if (!selectedDrug) return;
    fetchDrugLocation(selectedDrug.drugCode);
  }, [selectedDrug]);

  const submitInspection = async () => {
    console.log("총 검사 수량 : ", totalChecked);

    console.log("selectedLocation:", selectedLocation, typeof selectedLocation);
    if (!selectedLocation) {
      alert("주소를 선택해주세요.");
      return;
    }

    if (totalChecked !== selectedLocation.quantity) {
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
        purchaseId: selectedLocation.purchaseId,
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

      <select
        value={selectedLocation?.purchaseId || ""}
        onChange={(e) => {
          const loc = allLocation.find((l) => l.purchaseId == e.target.value);
          setSelectedLocation(loc);
        }}
        className="border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="" className="text-gray-500 text-sm">
          주소를 선택해주세요.
        </option>

        {allLocation.map((loc) => (
          <option key={loc.purchaseId} value={loc.purchaseId}>
            {loc.location} (보유 : {loc.quantity}개)
          </option>
        ))}
      </select>
      <br />
      <br />
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
