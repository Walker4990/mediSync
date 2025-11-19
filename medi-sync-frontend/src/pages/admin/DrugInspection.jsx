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

  const [details, setDetails] = useState([
    { status: "Pass", quantity: 0, note: "" },
  ]);

  //행 추가
  const addDetailRow = () => {
    if (details.length >= 3) return;
    setDetails([...details, { status: "PASS", quantity: 0, note: "" }]);
  };

  //행 삭제
  const removeDetailRow = (index) => {
    if (details.length === 1) {
      // 최소 1행은 유지
      return;
    }
    setDetails(details.filter((_, i) => i !== index));
  };

  //개별 값 변경
  const updateDetail = (index, key, value) => {
    const copy = [...details];
    copy[index][key] = value;
    setDetails(copy);
  };

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
  //선택한 값 찾아서 넣기
  const fetchDrugInsectionByCode = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/inspection/getInfo`
      );
      setSelectedModal(res.data);
    } catch (err) {
      console.error("상세 정보 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchDrugInsection();
  }, []);

  //모달 열기
  const openMocal = (drug) => {
    setSelectedModal(drug);
    setIsModalOpen(true);
  };

  //모달 열기
  const closeModal = () => {
    setSelectedModal(null);
    setInspectionStatus("PASS");
    setIsModalOpen(false);
  };

  const totalChecked = useMemo(() => {
    return details.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
  });

  const SubmitEvent = async () => {
    if (!selectedDrug) return;
    // validation: 수량이 0이면 보내지 않기
    for (const d of details) {
      if (d.status !== "PASS" && (!d.quantity || d.quantity <= 0)) {
        alert("이상/폐기 요망 상태인 경우 수량을 입력해야 합니다.");
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
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          약품 검사 페이지
        </h1>
        {/*검사 페이지 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/*약품 목록 */}
          <div className="bg-white shadow rounded-xl p-5 col-span-1 max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">약품 목록</h2>

            {drugInfo.length === 0 ? (
              <p className="text-gray-500 text-sm">등록된 약품이 없습니다.</p>
            ) : (
              <ul className="divide-y">
                {drugInfo.map((drug) => (
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
          <div className="bg-white shadow rounded-xl p-5 col-span-2">
            {selectedDrug ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {selectedDrug.drugName} 상세 정보
                </h2>

                <div className="mb-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">
                      약품 코드 : {selectedDrug.drugCode}
                    </p>
                    <p className="text-gray-600">
                      제약사 : {selectedDrug.supplier}
                    </p>
                    <p className="text-gray-600">
                      수량 : {selectedDrug.totalQuantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      만료일 : {selectedDrug.expirationDate}
                    </p>
                    <p className="text-gray-600">
                      가격 : {selectedDrug.unitPrice}원
                    </p>
                    <p className="text-gray-600">
                      위치 : {selectedDrug.location}
                    </p>
                  </div>
                </div>
                {/*검사 상태 입력 */}
                <div className="space-y-3">
                  <label className="font-medium">검사 상태</label>
                  {details.map((d, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap2 mb-2 items-center"
                    >
                      {/*상태 입럭 */}
                      <select
                        value={d.status}
                        onChange={(e) =>
                          updateDetail(idx, "status", e.target.value)
                        }
                        className="col-span-3 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="PASS">이상 없음(PASS)</option>
                        <option value="WARNING">이상 (WARNING)</option>
                        <option value="DISPOSE">폐기 요망(DISPOSE)</option>
                      </select>
                      {/*수량*/}

                      <input
                        type="number"
                        value={d.quantity}
                        onChange={(e) =>
                          updateDetail(idx, "quantity", e.target.value)
                        }
                        className="col-span-3 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 "
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
                        className="col-span-5 border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="비고"
                      />
                      {/*행 삭제 버튼 */}
                      <button
                        onClick={() => removeDetailRow(idx)}
                        className="col-span-1 text-red-500 font-bold hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {/*행 추가 버튼*/}
                  <button
                    onClick={addDetailRow}
                    className={`bg-gray-100 p px-4 py-1 rounded-lg text-sm font-medium${
                      details.length >= 3
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    + 결과 추가
                  </button>
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
              <p className="text-gray-500 text-sm">
                좌측에서 약품을 선택하세요.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
