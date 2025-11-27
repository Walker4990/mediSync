import React, { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

const Insurance = () => {
    const [treatmentHistory, setTreatmentHistory] = useState([]);
    const [insurers, setInsurers] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedInsuranceId, setSelectedInsuranceId] = useState("");
    const [selectedClaimItems, setSelectedClaimItems] = useState([]);
    const [currentClaimHistory, setCurrentClaimHistory] = useState([]);
    const [patientInsurances, setPatientInsurances] = useState([]);

    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const patientId = decoded?.userId || null; // 추후 로그인 세션으로 대체 예정
    // ------------------------------
    // ✅ 1. 진료 수납 내역 + 보험사 목록 조회
    // ------------------------------


    useEffect(() => {
        if (!patientId) return;
        axios
            .get(`http://192.168.0.24:8080/api/claim/treatment/${patientId}`)
            .then((res) => setTreatmentHistory(res.data))
            .catch((err) => console.error("❌ 진료 내역 조회 실패:", err));

        axios
            .get(`http://192.168.0.24:8080/api/claim/insurance/list`)
            .then((res) => setInsurers(res.data))
            .catch((err) => console.error("❌ 보험사 목록 조회 실패:", err));
        axios
            .get(`http://192.168.0.24:8080/api/patient-insurance/${patientId}`)
            .then((res) => {
                console.log("✅ 환자 보험 목록 응답 원본:", res);
                console.log("✅ 응답 데이터:", res.data);
                setPatientInsurances(res.data)
            })
            .catch((err) => console.error("❌ 환자 보험 목록 조회 실패:", err));
    }, [patientId]);



    // ------------------------------
    // ✅ 2. 헬퍼 함수 (기존 로직 그대로 유지)
    // ------------------------------
    const getAlreadyClaimedItemsName = (history) => {
        return (history || []).flatMap((h) => h.items);
    };

    const getRemainingClaimableItems = (item) => {
        if (!item || item.isClaimed) return [];

        const allClaimedItems = getAlreadyClaimedItemsName(item.claimedItemsHistory);
        return (item.claimableItems || []).filter(
            (claimable) => !allClaimedItems.includes(claimable)
        );
    };

    const getAlreadyClaimedItems = (item) => {
        if (!item) return [];
        const allClaimableItems = item.claimableItems || [];
        const allClaimedItems = getAlreadyClaimedItemsName(item.claimedItemsHistory);
        return allClaimableItems.filter((claimable) =>
            allClaimedItems.includes(claimable)
        );
    };

    // ------------------------------
    // ✅ 3. 진료 항목 선택
    // ------------------------------
    const handleItemSelect = (item) => {
        if (item.amount <= 0) return;

        // ✅ 임시 기본값 세팅
        item.claimableItems = item.claimableItems || ["진찰료", "검사료", "약제비"];
        item.claimedItemsHistory = item.claimedItemsHistory || [];
        item.isClaimed = item.isClaimed || false;

        setSelectedItem(item);
        setCurrentClaimHistory(item.claimedItemsHistory);

        if (!item.isClaimed) {
            const allClaimedItems = getAlreadyClaimedItemsName(item.claimedItemsHistory);
            const remainingClaimableItems = (item.claimableItems || []).filter(
                (claimable) => !allClaimedItems.includes(claimable)
            );
            setSelectedClaimItems(remainingClaimableItems);
            setSelectedInsuranceId("");
        } else {
            setSelectedClaimItems([]);
            setSelectedInsuranceId("");
        }
    };


    // ------------------------------
    // ✅ 4. 청구 항목 선택/해제
    // ------------------------------
    const handleClaimItemToggle = (item) => {
        if (selectedItem && !selectedItem.isClaimed) {
            setSelectedClaimItems((prev) =>
                prev.includes(item)
                    ? prev.filter((i) => i !== item)
                    : [...prev, item]
            );
        }
    };

    // ------------------------------
    // ✅ 5. 보험금 청구 (DB 연동)
    // ------------------------------
    const handleClaimSubmit = async () => {
        if (
            !selectedItem ||
            !selectedInsuranceId ||
            selectedClaimItems.length === 0
        ) {
            alert("진료 내역, 보험사, 청구 항목을 모두 선택해야 합니다.");
            return;
        }

        try {
            const selectedAmounts = selectedItem.treatmentDetails
                ?.filter(d => selectedClaimItems.includes(d.name))
                .reduce((sum, d) => sum + d.amount, 0);

            const payload = {
                recordId: selectedItem.recordId,
                insurerCode: selectedInsuranceId,
                claimAmount: selectedAmounts,
                claimItems: selectedClaimItems.map(name=>({
                    itemName: name,
                    amount: selectedItem.treatmentDetails?.find(d=>d.name === name)?.amount || 0
                })),  // 어떤 항목을 청구했는지 전달

            };

            //  axios 요청 (JSON Body)
            const res = await axios.post(
                "http://192.168.0.24:8080/api/claim/submit",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            alert("✅ 청구 완료: " + res.data.message);

            //  상태 갱신 (claimStatus로 전환)
            setTreatmentHistory(prev =>
                prev.map(item =>
                    item.recordId === selectedItem.recordId
                        ? { ...item, status: "SENT" } // DB 기준 상태값 반영
                        : item
                )
            );

            setSelectedItem(null);
            setSelectedInsuranceId("");
            setSelectedClaimItems([]);
            setCurrentClaimHistory([]);
        } catch (err) {
            console.error("❌ 보험 청구 실패:", err);
            alert("청구 처리 중 오류가 발생했습니다.");
        }
    };

    // ------------------------------
    // ✅ 6. 렌더링
    // ------------------------------
    return (
        <div className="flex justify-center px-4 min-h-screen bg-gray-50 pb-10">
            <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-600 pb-4 mb-8">
                    📋 보험금 청구
                </h2>
                <p className="mb-6 text-gray-500 text-base">
                    진료 수납 내역을 확인하고, 청구할 항목을 선택한 후 보험사를 지정해주세요. <br />
                    ** 모든 청구 가능 항목이 접수되어야 '접수 완료'로 처리됩니다. **
                </p>

                {/* ✅ 1단계: 진료 수납 내역 선택 */}
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
                        <div className="w-[15%] text-right">금액</div>
                        <div className="w-[15%] text-center">상태</div>
                    </div>

                    {/* 테이블 바디 */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {treatmentHistory.map((item) => (
                            <div
                                key={item.recordId}
                                onClick={() => {
                                    if (["SENT", "APPROVED", "PAID"].includes(item.status)) return; // ⛔ 클릭 막기
                                    handleItemSelect(item);
                                }}
                                className={`flex items-center p-3 text-sm transition
        ${
                                    ["SENT", "APPROVED", "PAID"].includes(item.status)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" // ⛔ 비활성화 스타일
                                        : "cursor-pointer hover:bg-gray-50"
                                }
        ${selectedItem && selectedItem.recordId === item.recordId ? "bg-blue-100 border-l-4 border-blue-600" : ""}
    `}
                            >
                                <div className="w-[10%] text-center">{item.date?.slice(5)}</div>
                                <div className="w-[15%] text-left">{item.time || "-"}</div>
                                <div className="w-[20%] text-left">{item.department || "-"}</div>
                                <div className="w-[25%] text-left truncate">{item.diagnosis || "-"}</div>
                                <div className="w-[15%] text-right font-bold">{item.amount?.toLocaleString()}원</div>
                                <div className="w-[15%] text-center font-semibold">
                                    {item.status === "SENT" && <span className="text-blue-600">접수 완료</span>}
                                    {item.status === "APPROVED" && <span className="text-green-600">승인</span>}
                                    {item.status === "REJECTED" && <span className="text-red-500">거절</span>}
                                    {item.status === "PAID" && <span className="text-500">지급 완료</span>}
                                    {!item.status && <span className="text-gray-400">미완료</span>}
                                </div>
                            </div>
                        ))}
                        {treatmentHistory.length === 0 && (
                            <div className="p-5 text-center text-gray-500">청구 가능한 내역이 없습니다.</div>
                        )}
                    </div>
                </div>

                {/* ✅ 2단계: 선택 후 상세 영역 */}
                {selectedItem && (
                    <div className="p-6 border rounded-lg shadow-md bg-blue-50">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
                            선택된 내역 정보 : {selectedItem.department}
                        </h3>

                        {/* 청구 항목 */}
                        <div className="mb-6">
                            <strong className="block mb-3 text-base text-gray-700">
                                청구 항목 선택:
                            </strong>
                            <div className="flex flex-wrap gap-4">
                                {getRemainingClaimableItems(selectedItem).map((item) => (
                                    <label key={item} className="flex items-center text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedClaimItems.includes(item)}
                                            onChange={() => handleClaimItemToggle(item)}
                                            className="mr-2 text-blue-600"
                                        />
                                        {item}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 보험사 선택 */}
                        <div className="mb-6">
                            <strong className="block mb-3 text-base text-gray-700">보험사 선택:</strong>
                            <div className="flex gap-5 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                                {patientInsurances.length > 0 ? (
                                    insurers
                                        .filter(ins => patientInsurances.some(pi => pi.insurerCode === ins.insurerCode))
                                        .map((ins) => (
                                            <div
                                                key={ins.insurerCode}
                                                className={`inline-flex flex-col items-center justify-center 
                p-4 border-2 rounded-xl cursor-pointer w-36 h-32 bg-white transition-all flex-shrink-0
                ${
                                                    selectedInsuranceId === ins.insurerCode
                                                        ? "border-blue-600 ring-2 ring-blue-300 scale-105 shadow-md"
                                                        : "border-gray-200 hover:border-blue-400 hover:shadow-sm"
                                                }`}
                                                onClick={() => setSelectedInsuranceId(ins.insurerCode)}
                                            >
                                                <img
                                                    src={`/images/insurer/${ins.insurerCode}.png`}
                                                    alt={ins.insurerName}
                                                    className="w-16 h-16 object-contain mb-2"
                                                />
                                                <span className="text-sm font-medium text-gray-800 text-center leading-tight">
                  {ins.insurerName}
                </span>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-gray-400 text-sm">가입된 보험이 없습니다.</p>
                                )}
                            </div>
                        </div>


                        {/* 청구 버튼 */}
                        <button
                            onClick={handleClaimSubmit}
                            disabled={selectedClaimItems.length === 0 || !selectedInsuranceId}
                            className={`w-full py-3 text-lg font-bold rounded-lg transition mt-4
              ${
                                selectedClaimItems.length === 0 || !selectedInsuranceId
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            보험금 청구하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Insurance;
