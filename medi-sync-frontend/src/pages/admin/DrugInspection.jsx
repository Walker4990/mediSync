import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import AdminHeader from "../../component/AdminHeader";

export default function DrugInspection() {
  //약품 검사 작성
  const [drugInfo, setDrugInfo] = useState([]);
  //해당 약품 글릭 시 약 정보 저장할 장소
  const [selectedDrug, setSelectedModal] = useState(null);

  //모달 열림 여부
  const [isModalOpen, setIsModalOpen] = useState(false);

  //검사 작성 값
  const [inspectionStatus, setInspectionStatus] = useState("PASS");
  const [inspectionQuantity, setInspectionQuantity] = useState();
  const [inspectionNote, setInpectionNote] = useState("");

  const [filter, setFilter] = useState("all");

  const [details, setDetails] = useState([
    { status: "Pass", label: "정상 (PASS)", quantity: 0, note: "" },
    { status: "WARNING", label: "이상 (WARNING)", quantity: 0, note: "" },
    { status: "DISPOSE", label: "폐기 요망 (DISPOSE)", quantity: 0, note: "" },
  ]);

  //개별 값 변경
  const updateDetail = (index, key, value) => {
    const copy = [...details];
    copy[index][key] = value;
    setDetails(copy);
  };

  const filteredDrugInfo =
    filter === "all" ? drugInfo : drugInfo.filter((d) => d.isChecked === false);

  //약품 정보 리스트로 가져오기(dto)
  const fetchDrugInsection = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/inspection`);
      setDrugInfo(res.data);
      console.log("검사가 필요한 약품 데이터 : ", res.data);
    } catch (err) {
      console.error("약품 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchDrugInsection();
  }, []);

  //모달 열기
  const openMocal = (drug) => {
    setSelectedModal(drug);
    setIsModalOpen(true);

    setDetails([
      { status: "Pass", label: "정상 (PASS)", quantity: 0, note: "" },
      { status: "WARNING", label: "이상 (WARNING)", quantity: 0, note: "" },
      {
        status: "DISPOSE",
        label: "폐기 요망 (DISPOSE)",
        quantity: 0,
        note: "",
      },
    ]);
  };

  //총합 계산
  const totalChecked = useMemo(() => {
    return details.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
  });

  //제출
  const SubmitEvent = async () => {
    if (!selectedDrug) return;
    // validation: 수량이 0이면 보내지 않기
    for (const d of details) {
      const q = d.quantity;
      if (!/^\d+$/.test(q)) {
        alert("수량에는 숫자만 입력할 수 있습니다.");
        return;
      }
      if (d.quantity === "" || d.quantity === null) {
        alert("수량을 입력해야 합니다.");
        return;
      }
      if (d.quantity < 0) {
        alert("수량은 0 이상이어야 합니다.");
        return;
      }
    }

    //총 검사 수량 검증
    if (totalChecked !== selectedDrug.totalQuantity) {
      alert(
        `총 검사 수량(${totalChecked})이 실제 재고(${selectedDrug.totalQuantity})와 일치해야 합니다.`
      );
      return;
    }

    const payload = {
      drugCode: selectedDrug.drugCode, // 약품 식별 코드
      inspections: details.map((d) => ({
        status: d.status,
        quantity: d.quantity,
        note: d.note,
      })),
    };

    try {
      const res = await axios.post(
        "http://localhost:8080/api/inspection/register",
        payload
      );
      console.log("등록 성공");
      alert("검사 등록 완료!");
      //등록 후 초기화
      setDetails([{ status: "PASS", quantity: 0, note: "" }]);
      setSelectedModal(null);
    } catch (err) {
      console.error("약품 검사 실패", err);
      alert("검사 등록 실패");
    }
  };

  //약 검사 페이지
  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />

      {/* 컨텐츠 영역 */}
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-600">약품 검사 페이지</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded font-medium ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("unchecked")}
              className={`px-4 py-2 rounded font-medium ${
                filter === "unchecked"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              이번 달 미검사
            </button>
          </div>
        </div>
        {/*검사 페이지 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/*약품 목록 */}
          <div className="bg-white shadow-xl rounded-xl p-5 col-span-1 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">약품 목록</h2>

            {filteredDrugInfo.length === 0 ? (
              <p className="text-gray-500  text-center mt-20 text-sm">
                등록된 약품이 없습니다.
              </p>
            ) : (
              <ul className="divide-y">
                {filteredDrugInfo.map((drug) => (
                  <li
                    key={drug.drugCode}
                    className="p-3 cursor-pointer hover:bg-blue-50 rounded transtion"
                    onClick={() => openMocal(drug)}
                  >
                    <div className="font-medium">{drug.drugName}</div>
                    <div className="text-sm text-gray500">
                      코드: {drug.drugCode}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/*약품 상세 + 검사 입력 */}
          <div className="bg-white shadow-xl rounded-xl p-5 col-span-2">
            {selectedDrug ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {selectedDrug.drugName} 상세 정보
                </h2>

                <div className="mb-5 grid grid-cols-2 gap-4 text-gray-600">
                  <div>
                    <p>약품 코드 : {selectedDrug.drugCode}</p>
                    <p>제약사 : {selectedDrug.supplier}</p>
                    <p>수량 : {selectedDrug.totalQuantity}</p>
                  </div>
                  <div>
                    <p>만료일 : {selectedDrug.expirationDate}</p>
                    <p>가격 : {selectedDrug.unitPrice}원</p>
                    <p>위치 : {selectedDrug.location}</p>
                  </div>
                </div>
                {/*검사 상태 입력 */}
                <div className="space-y-3">
                  <label className="font-medium black mb-2">
                    검사 결과 입력
                  </label>

                  <div className="space-y-3">
                    {details.map((d, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap3 mb-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        {/*상태 입럭 */}
                        <div className="col-span-3 font-medium">{d.label}</div>
                        {/*수량*/}
                        <input
                          type="number"
                          value={d.quantity}
                          onChange={(e) =>
                            updateDetail(idx, "quantity", e.target.value)
                          }
                          className="col-span-3 border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-400 "
                          placeholder="검사에서 확인한 수량을 입력하세요."
                          min={0}
                        />

                        {/*비고 */}
                        <input
                          type="text"
                          value={d.note}
                          onChange={(e) =>
                            updateDetail(idx, "note", e.target.value)
                          }
                          className="col-span-6 border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-400"
                          placeholder="비고"
                        />
                      </div>
                    ))}
                  </div>

                  {/*합계 안내 */}
                  <div className="mt-3 text-sm text-gray-600">
                    총 검사 수량:{" "}
                    <span className="font-bold">{totalChecked}</span>
                    {selectedDrug.totalChecked}
                  </div>
                </div>
                {details.some((d) => d.status !== "PASS") && (
                  <p className="text-red-500 text-sm">
                    ※ 이상/폐기 요망 시 수량을 반드시 확인하세요.
                  </p>
                )}
                <button
                  onClick={SubmitEvent}
                  className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  검사 등록
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-sm text-center mt-40">
                좌측에서 약품을 선택하세요.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
