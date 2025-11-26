import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useMemo, useRef } from "react";
import AdminHeader from "../../component/AdminHeader";
import { button, div, p, pre, span } from "framer-motion/client";

export default function DrugDeadline() {
  const [filter, setFilter] = useState("all"); // all / inspected / disposed
  const [drugList, setDrugList] = useState([]);
  const [inspectionList, setInspectionList] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [modalDrug, setModalDrug] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDrugDispose, setSelectedDrugDispose] = useState(null);
  const [disposeQty, setDisposeQty] = useState(0);

  //전체 조회
  const fetchDrugList = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/drug");
      setDrugList(res.data);
      console.log("약품 전체 조회 : ", res.data);
    } catch (err) {
      console.error("약품 전체조회 실패", err);
    }
  };
  //검색 필터
  const filteredDrugList = drugList.filter(
    (drug) =>
      drug.drugName.toLowerCase().includes(search.toLowerCase()) ||
      drug.drugCode.toLowerCase().includes(search.toLowerCase())
  );

  let holdTimeout = useRef(null);
  let holdInterval = useRef(null);

  const maxQtyRef = useRef(0);

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
  //검사 리스트 가져오기
  const fetchInspectionList = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/inspection/month");

      console.log("이번달 검사 리스트 조회 : ", res.data);
      setInspectionList(res.data);
    } catch (err) {
      console.error("이번달 검사 리스트 조회 실패", err);
    }
  };

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
        checkId: base.checkId,
        drugName: base.drugName,
        location: base.location,
        expirationDate: base.expirationDate,
        results, // 3줄 모두 저장
        canDispose,
      };

      setSelectedDrug(summary);
      console.log("검사 모달 상세 조회 : ", res.data);
    } catch (err) {
      console.error("검사 상세 조회 실패", err);
    }
  };

  //검사한거 폐기처리하기
  const disposDrug = async (detailId, quantity) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/inspection/dispose/${detailId}/${quantity}`
      );
      await fetchInspectionList();
      await fetchDrugList();
      setSelectedDrug(null);
      console.log("폐기처리 완료");
    } catch (err) {
      console.error("약품 폐기 실패", err);
    }
  };

  //그냥 폐기처리하기

  //폐기 기록 가져오기
  const fetchDisposedList = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/inspection/disponse"
      );
      console.log("폐기 기록 조회 : ", res.data);
    } catch (err) {
      console.error("폐기 기록 조회 실패", err);
    }
  };

  //모달 열기
  const openModal = (item) => {
    setSelectedDrug(item);
  };

  const closeModal = () => {
    setSelectedDrug(null);
  };

  //탭 바뀔때 데이터 가져오기
  useEffect(() => {
    fetchDrugList();
  }, []);

  useEffect(() => {
    return () => {
      stopHold();
    };
  }, []); // ← 언마운트 때만 실행됨

  useEffect(() => {
    if (filter === "all") {
      fetchDrugList();
    } else if (filter === "inspected") {
      fetchInspectionList();
    } else if (filter === "disposed") {
      fetchDisposedList();
    }
  }, [filter]);
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
              폐기 기록
            </button>
          </div>
        </div>

        {/* 메인 레이아웃 */}
        <div className="max-w-5xl mx-auto">
          {/*전체 페이지 */}
          {filter == "all" && (
            <div className="bg-white shadow-lg rounded-xl p-5 h-[600px] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">전체 약품 목록</h2>
              <input
                type="text"
                placeholder="약품명 또는 코드 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 mb-4 rounded-full border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
              />
              {filteredDrugList.length === 0 ? (
                <p className="text-gray-500 text-center mt-20 text-sm">
                  약품이 없습니다.
                </p>
              ) : (
                <ul className="divide-y">
                  {filteredDrugList.map((drug) => (
                    <li
                      key={drug.drugCode}
                      className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md hover:bg-blue-50 transition cursor-pointer"
                      onClick={() => {
                        setSelectedDrugDispose(drug);
                        setDisposeQty(0);
                      }}
                    >
                      {/* 상단 약품 정보 */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            {drug.drugName}
                          </p>
                          <p className="text-sm text-gray-500">
                            코드: {drug.drugCode}
                          </p>
                        </div>

                        <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                          {drug.quantity}개
                        </span>
                      </div>

                      {/* 하단 상세 정보 */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">가격:</span>{" "}
                          {drug.unitPrice.toLocaleString()}원
                        </p>
                        <p>
                          <span className="font-medium">위치:</span>{" "}
                          {drug.location}
                        </p>

                        <p className="col-span-2">
                          <span className="font-medium">보험사:</span>{" "}
                          {drug.insurerName || "-"}
                        </p>

                        <p className="col-span-2 text-xs text-gray-400 mt-1">
                          마지막 수정:{" "}
                          {new Date(drug.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/*폐기 등록 모달 */}
          {selectedDrugDispose && (
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
          )}

          {/* 검사 리스트 + 폐기 버튼 */}
          {filter === "inspected" && (
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
                          <p className="text-xs text-gray-500">
                            종류: {item.unit}
                          </p>
                          <p className="text-xs text-gray-500">
                            가격: {item.unitPrice}
                          </p>
                          <p className="text-xs text-gray-500">
                            제약사: {item.supplier}
                          </p>
                          <p className="text-xs text-gray-500">
                            위치: {item.location}
                          </p>
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
          )}

          {/*폐기 페이지 */}
          {filter == "disposed" && (
            <div className="bg-white shadow-lg rounded-xl p-5 col-span-2 h-[600px] overflow-y-auto">
              <p className="text-gray-500 mt-10 text-sm text-center">
                표시할 항목이 없습니다.
              </p>
            </div>
          )}
        </div>

        {/*모달 */}
        {selectedDrug && (
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
                    <span className="font-semibold">유통기한:</span>{" "}
                    {selectedDrug.expirationDate}
                  </p>
                  <p>
                    <span className="font-semibold">검사 ID:</span>{" "}
                    {selectedDrug.checkId}
                  </p>
                  <p>
                    <span className="font-semibold">Detail ID:</span>{" "}
                    {selectedDrug.detailId}
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
                            className={`w-3 h-3 rounded-full ${
                              tagColor[r.status]
                            }`}
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
                          <span className="font-semibold">개수:</span>{" "}
                          {r.quantity}개
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
                                  disposDrug(r.detailId, r.quantity)
                                }
                              >
                                폐기
                              </button>
                              <button className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400 shadow">
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
        )}
      </main>
    </div>
  );
}
