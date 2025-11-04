import React, { useState, useEffect } from "react";

// 보험사 청구를 위한 더미데이터 생성
const mockTreatmentData = [
  {
    id: 1,
    date: "2025-11-04",
    time: "오전 9시",

    department: "정형외과",
    details: "진료비 수납",
    amount: 55000,
    isClaimed: false,
    claimableItems: ["진찰료", "물리치료비"],
    claimedItemsHistory: [],
    treatmentDetails: [
      { name: "진찰료", amount: 20000, isClaimable: true, isPaid: true },
      { name: "물리치료비", amount: 35000, isClaimable: true, isPaid: true },
    ],
  },
  {
    id: 3,
    date: "2025-11-07",
    time: "오후 11시",

    department: "영상의학과",
    details: "MRI 촬영 수납",
    amount: 450000,
    isClaimed: false,
    claimableItems: ["MRI 비용(비급여)", "판독료"],
    claimedItemsHistory: [
      {
        items: ["MRI 비용(비급여)"],
        insuranceName: "삼성화재",
        claimDate: "2025-11-10",
      },
    ],
    treatmentDetails: [
      {
        name: "MRI 비용(비급여)",
        amount: 400000,
        isClaimable: true,
        isPaid: true,
      },
      { name: "판독료", amount: 50000, isClaimable: true, isPaid: true },
      { name: "일반 진료비", amount: 0, isClaimable: false, isPaid: true },
    ],
  },
  {
    id: 5,
    date: "2025-11-18",
    time: "오후 2시",

    department: "피부과",
    details: "피부염 진료 수납",
    amount: 60000,
    isClaimed: true,
    claimableItems: ["진찰료", "처방약"],
    claimedItemsHistory: [
      {
        items: ["진찰료", "처방약"],
        insuranceName: "KB손해보험",
        claimDate: "2025-11-20",
      },
    ],
    treatmentDetails: [
      { name: "진찰료", amount: 25000, isClaimable: true, isPaid: true },
      { name: "처방약", amount: 35000, isClaimable: true, isPaid: true },
    ],
  },
];

// 임시 보험사 데이터
const mockInsuranceCompanies = [
  { id: "SAMSUNG", name: "삼성화재", logo: "/samsung.png" },
  { id: "HYUNDAI", name: "현대해상", logo: "/hyundai.png" },
  { id: "DB", name: "DB손해보험", logo: "/dbins.png" },
  { id: "KB", name: "KB손해보험", logo: "/kbins.png" },
  { id: "MERITZ", name: "메리츠화재", logo: "/meritz.png" },
];

const Insurance = () => {
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState("");
  const [selectedClaimItems, setSelectedClaimItems] = useState([]);
  const [currentClaimHistory, setCurrentClaimHistory] = useState([]);

  useEffect(() => {
    const filteredData = mockTreatmentData.filter((item) =>
      [1, 3, 5].includes(item.id)
    );
    setTreatmentHistory(filteredData);
  }, []);

  const getAlreadyClaimedItemsName = (history) => {
    return (history || []).flatMap((h) => h.items);
  };

  const handleItemSelect = (item) => {
    if (item.amount <= 0) return;

    setSelectedItem(item);
    setCurrentClaimHistory(item.claimedItemsHistory || []);

    if (!item.isClaimed) {
      // 💡 미청구 항목만 선택 목록에 표시
      const allClaimedItems = getAlreadyClaimedItemsName(
        item.claimedItemsHistory
      );
      const remainingClaimableItems = item.claimableItems.filter(
        (claimable) => !allClaimedItems.includes(claimable)
      );

      setSelectedClaimItems(remainingClaimableItems);
      setSelectedInsuranceId("");
    } else {
      setSelectedClaimItems([]);
      setSelectedInsuranceId("");
    }
  };

  const handleClaimItemToggle = (item) => {
    if (selectedItem && !selectedItem.isClaimed) {
      setSelectedClaimItems((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    }
  };

  const handleClaimSubmit = () => {
    if (
      !selectedItem ||
      !selectedInsuranceId ||
      selectedClaimItems.length === 0 ||
      selectedItem.isClaimed
    ) {
      alert(
        "진료 내역, 보험사, 청구 항목을 모두 선택했거나, 이미 청구가 완료된 내역입니다."
      );
      return;
    }

    const selectedInsurance = mockInsuranceCompanies.find(
      (ins) => ins.id === selectedInsuranceId
    );
    const selectedInsuranceName = selectedInsurance?.name;
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");

    // 1. 새로운 청구 기록 객체 생성
    const newClaimRecord = {
      items: selectedClaimItems,
      insuranceName: selectedInsuranceName,
      claimDate: today,
    };

    // 2. 현재까지 청구된 항목 목록 생성 (중복 제거)
    const currentClaimedItems = getAlreadyClaimedItemsName(
      selectedItem.claimedItemsHistory
    );
    const updatedClaimedItems = Array.from(
      new Set([...currentClaimedItems, ...selectedClaimItems])
    );

    // 3. 💡 청구 가능 항목의 개수와 최종 청구 항목의 개수를 비교
    const isFullyClaimed =
      updatedClaimedItems.length === selectedItem.claimableItems.length;

    alert(
      `[${selectedInsuranceName}]로 보험금 청구가 접수되었습니다! (청구 항목: ${selectedClaimItems.join(
        ", "
      )})`
    );

    // 4. history 업데이트
    setTreatmentHistory((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              isClaimed: isFullyClaimed,
              claimedItemsHistory: [
                ...item.claimedItemsHistory,
                newClaimRecord,
              ],
            }
          : item
      )
    );

    // 5. 상태 초기화 (재선택된 항목의 상태를 업데이트하기 위해, 강제로 선택 해제 후 재선택 유도)
    setSelectedItem(null);
    setSelectedInsuranceId("");
    setSelectedClaimItems([]);
    setCurrentClaimHistory([]);
  };

  // 💡 미청구된 항목 목록을 계산하는 헬퍼 함수
  const getRemainingClaimableItems = (item) => {
    if (item.isClaimed) return [];
    const allClaimedItems = getAlreadyClaimedItemsName(
      item.claimedItemsHistory
    );
    return item.claimableItems.filter(
      (claimable) => !allClaimedItems.includes(claimable)
    );
  };

  // 💡 이미 청구된 항목 목록을 계산하는 헬퍼 함수
  const getAlreadyClaimedItems = (item) => {
    const allClaimableItems = item.claimableItems;
    const allClaimedItems = getAlreadyClaimedItemsName(
      item.claimedItemsHistory
    );
    return allClaimableItems.filter((claimable) =>
      allClaimedItems.includes(claimable)
    );
  };

  return (
    <div className="flex justify-center px-4 min-h-screen bg-gray-50 pb-10">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-600 pb-4 mb-8">
          📋 보험금 청구
        </h2>
        <p className="mb-6 text-gray-500 text-base">
          진료 수납 내역을 확인하고, 청구할 항목을 선택한 후 보험사를
          지정해주세요. <br />
          ** 모든 청구 가능 항목이 접수되어야 '접수 완료'로 처리됩니다. **
        </p>

        {/* 1단계: 진료 수납 내역 선택 */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4 mt-6 border-l-4 border-blue-500 pl-3">
          1단계: 진료 수납 내역 선택
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-8">
          {/* 테이블 헤더 */}
          <div className="flex bg-gray-50 font-bold text-sm text-gray-600 p-3 border-b border-gray-200">
            <div className="w-[10%] text-center">날짜</div>
            <div className="w-[15%] text-left">시간</div>
            <div className="w-[20%] text-left">진료과</div>
            <div className="w-[25%] text-left">수납 상세</div>
            <div className="w-[15%] text-right">수납 금액</div>
            <div className="w-[15%] text-center">상태</div>
          </div>

          {/* 테이블 바디 */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {treatmentHistory.map((item) => {
              const remainingItems = getRemainingClaimableItems(item);
              const isPartiallyClaimed =
                !item.isClaimed &&
                remainingItems.length < item.claimableItems.length;

              return (
                <div
                  key={item.id}
                  className={`
                    flex items-center p-3 cursor-pointer transition duration-150 ease-in-out text-sm
                    ${
                      selectedItem && selectedItem.id === item.id
                        ? "bg-blue-100 text-blue-800 border-l-4 border-blue-600 font-medium shadow-inner"
                        : "hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="w-[10%] text-center">
                    {item.date.slice(5)}
                  </div>
                  <div className="w-[15%] text-left">{item.time}</div>
                  <div className="w-[20%] text-left">{item.department}</div>
                  <div className="w-[25%] text-left truncate">
                    {item.details}
                  </div>
                  <div className="w-[15%] text-right font-bold">
                    {item.amount.toLocaleString()}원
                  </div>
                  <div
                    className={`w-[15%] text-center font-semibold
                      ${
                        item.isClaimed
                          ? "text-green-600"
                          : isPartiallyClaimed
                          ? "text-yellow-600"
                          : "text-blue-500"
                      }`}
                  >
                    {item.isClaimed
                      ? "접수 완료"
                      : isPartiallyClaimed
                      ? "부분 접수"
                      : "미완료"}
                  </div>
                </div>
              );
            })}
            {treatmentHistory.length === 0 && (
              <div className="p-5 text-center text-gray-500">
                청구 가능한 수납 내역이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 2단계: 청구 상태별 상세 정보 영역 */}
        {selectedItem && (
          <div
            className="p-6 border rounded-lg shadow-md
            ${selectedItem.isClaimed ? 'border-green-500 bg-green-50' : 'border-blue-400 bg-blue-50'}"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
              선택된 내역 정보 : {selectedItem.department}
            </h3>

            {/* 💡 2-1: 진료 수납 상세 (항목별 금액 테이블) */}
            <div className="mb-6 p-4 border rounded-lg bg-white/70">
              <strong className="block mb-3 text-base text-gray-700 font-bold">
                💰 진료 수납 상세 (총 금액:{" "}
                {selectedItem.amount.toLocaleString()}원)
              </strong>

              <div className="space-y-1 text-sm">
                {selectedItem.treatmentDetails.map((detail, index) => {
                  const isClaimedDetail = getAlreadyClaimedItemsName(
                    selectedItem.claimedItemsHistory
                  ).includes(detail.name);
                  const isRemainingClaimable =
                    detail.isClaimable && !isClaimedDetail;

                  return (
                    <div
                      key={index}
                      className={`flex justify-between p-2 rounded-md ${
                        isClaimedDetail
                          ? "bg-green-100/50"
                          : isRemainingClaimable
                          ? "bg-yellow-100/50"
                          : "bg-gray-100/50"
                      }`}
                    >
                      <div className="font-semibold text-gray-800 flex items-center">
                        {detail.name}
                        {detail.isClaimable && !isClaimedDetail && (
                          <span className="ml-2 text-xs text-blue-600">
                            (청구 가능)
                          </span>
                        )}
                        {isClaimedDetail && (
                          <span className="ml-2 text-xs text-green-700 font-bold">
                            {" "}
                            (접수됨)
                          </span>
                        )}
                      </div>
                      <div
                        className={`font-bold ${
                          isClaimedDetail
                            ? "text-green-600"
                            : isRemainingClaimable
                            ? "text-yellow-700"
                            : "text-gray-500"
                        }`}
                      >
                        {detail.amount.toLocaleString()}원
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 💡 2-2: 청구 기록 표시 영역 */}
            {currentClaimHistory.length > 0 && (
              <div className="mb-6 p-4 border rounded-lg bg-white/70">
                <strong className="block mb-2 text-base text-gray-700 font-bold">
                  📝 청구 기록 ({getAlreadyClaimedItems(selectedItem).length}/
                  {selectedItem.claimableItems.length} 항목 접수)
                </strong>
                <div className="space-y-3">
                  {currentClaimHistory.map((history, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-wrap gap-2">
                        {history.items.map((item) => (
                          <span
                            key={item}
                            className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="text-right text-gray-600 ml-4">
                        <span className="font-bold text-blue-600">
                          {history.insuranceName}
                        </span>{" "}
                        접수 완료 ({history.claimDate})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 💡 2-3: 미완료된 경우 (청구 가능 항목이 남아있는 경우) */}
            {!selectedItem.isClaimed && (
              <>
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
                  3단계: 미청구 항목 선택 및 보험사 지정
                </h3>

                {/* 청구 대상 항목 선택 */}
                <div className="mb-6">
                  <strong className="block mb-3 text-base text-gray-700">
                    청구 대상 항목 선택: (남은 항목:{" "}
                    {getRemainingClaimableItems(selectedItem).length}개)
                  </strong>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {/* 선택 가능한 항목은 미청구 항목만 표시 */}
                    {getRemainingClaimableItems(selectedItem).map((item) => (
                      <label
                        key={item}
                        className="flex items-center text-sm text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={item}
                          checked={selectedClaimItems.includes(item)}
                          onChange={() => handleClaimItemToggle(item)}
                          className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2">{item}</span>
                      </label>
                    ))}
                    {getRemainingClaimableItems(selectedItem).length === 0 && (
                      <p className="text-gray-500 text-sm">
                        청구할 항목이 남아있지 않습니다. (로직 오류)
                      </p>
                    )}
                  </div>
                </div>

                {/* 보험사 선택 */}
                <div className="mb-6">
                  <strong className="block mb-3 text-base text-gray-700">
                    보험사 선택:
                  </strong>
                  <div className="flex flex-wrap gap-4">
                    {mockInsuranceCompanies.map((ins) => (
                      <div
                        key={ins.id}
                        className={`
                          flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer
                          w-28 h-20 transition duration-200 ease-in-out bg-white
                          ${
                            selectedInsuranceId === ins.id
                              ? "border-blue-600 shadow-lg ring-2 ring-blue-500"
                              : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                          }
                        `}
                        onClick={() => setSelectedInsuranceId(ins.id)}
                      >
                        <img
                          src={ins.logo}
                          alt={ins.name}
                          className="max-w-full max-h-10 object-contain mb-1"
                        />
                        <span className="text-xs text-gray-600 font-medium">
                          {ins.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 청구 버튼 */}
                <button
                  onClick={handleClaimSubmit}
                  disabled={
                    selectedClaimItems.length === 0 || !selectedInsuranceId
                  }
                  className={`
                    w-full py-3 px-6 text-lg font-bold rounded-lg transition duration-200 ease-in-out mt-4
                    ${
                      selectedClaimItems.length === 0 || !selectedInsuranceId
                        ? "bg-blue-300 text-white cursor-not-allowed opacity-70"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    }
                  `}
                >
                  선택 항목 보험금 청구하기 ({selectedClaimItems.length}개)
                </button>
                <p className="mt-3 text-xs text-gray-500 text-center">
                  *청구 시 해당 내역에 대한 진료 기록 및 수납 영수증이 보험사로
                  전자적으로 전달됩니다.
                </p>
              </>
            )}

            {/* 💡 청구 완료된 경우 메시지 */}
            {selectedItem.isClaimed && (
              <div className="mt-4 text-center p-4 bg-white rounded-lg border-2 border-green-400">
                <p className="text-xl font-bold text-green-700">
                  모든 청구 가능 항목이 접수 완료되었습니다.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  총 {selectedItem.claimableItems.length}개 항목 청구 완료.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Insurance;
