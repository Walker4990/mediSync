import AdminHeader from "../../component/AdminHeader";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DrugInOutState() {
  const TEST_URL = "http://localhost:8080/api/inout";
  const URL = "http://192.168.0.24:3306/api/inout";

  const [mode, setMode] = useState("");
  const [search, setSearch] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [inQty, setInQty] = useState(0);
  const [memo, setMemo] = useState("");
  const [newDrug, setNewDrug] = useState({
    drugName: "",
    drugCode: "",
    insuranceCode: "",
    unitPrice: "",
    expirationDate: "",
    location: "",
    quantity: "",
  });

  /*검색*/
  const handleSearch = async (keyword) => {
    setSearch(keyword);

    if (keyword.trim() === "") {
      setSearchList([]);
      fetchSearchList();
      return;
    }
    try {
      const res = await axios.get(`${TEST_URL}/search/${keyword}`);
      setSearchList(res.data);
    } catch (err) {
      console.error("검색 조회 실패", err);
    }
  };

  /*입고 등록 */
  const handleInsert = async () => {
    if (!selectedDrug || inQty <= 0) return alert("입고 수량을 입력해주세요.");

    try {
      await axios.post(`${TEST_URL}/insert`, {
        drugCode: selectedDrug.drugCode,
        quantity: inQty,
        memo,
      });

      alert("입고 등록이 완료되었습니다.");
      setSelectedDrug(null);
      setMemo("");
      setInQty(0);
      await handleSearch();
    } catch (err) {
      console.error("입고 등록 실패", err);
    }
  };
  const handleNewDrugInsert = async () => {
    try {
      await axios.post(`${TEST_URL}/new`, newDrug);
    } catch (err) {
      console.error("신규 등록 실패", err);
    }
  };

  /*리스트 가져오기 */
  const fetchSearchList = async () => {
    try {
      const res = await axios.get(`${TEST_URL}`);
      setSearchList(res.data);
    } catch (err) {
      console.error("처음 약품 리스트 가져오기 실패", err);
    }
  };
  useEffect(() => {
    fetchSearchList();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <div className="max-w-5xl mx-auto">
          {/*전체 페이지 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
            {/*탭 버튼 */}
            <div className="flex gap-4 mb-6 border-b pb-3">
              <button
                onClick={() => setMode("existing")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  mode === "existing"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                기존 약품 입고
              </button>

              <button
                onClick={() => setMode("new")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  mode == "new"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                신규 약품 목록
              </button>
            </div>
            {mode === "existing" && (
              <div className="space-y-6">
                {/*검색 영역*/}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    약품 검색
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="약품명 또는 코드 입력"
                    className="mt-2 w-full p-3 border rounded-lg forcus:ring-2 focu:ring-blue-400 outline-none"
                  />
                </div>
                {/*검색 결과*/}
                {searchList.length > 0 && (
                  <div className="border rounded-xl p-4 bg-gray-50 max-g-56 overflow-y-auto shadow-inner">
                    {searchList.map((drug) => (
                      <div
                        key={drug.drugCode}
                        onClick={() => setSelectedDrug(drug)}
                        className="p-3 mb-2 bg-white rounded-lg shadow hover:bg-blue-50 cursor-pointer flex justify-between"
                      >
                        <div>
                          <p className="font-medium">{drug.drugName}</p>
                          <p className="text-xs text-gray-500">
                            {drug.drugCode}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          재고 :{" "}
                          <span className="font-bold">{drug.quantity}</span>개
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/*약품 선택 후 재고 입력 */}
            {selectedDrug && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="p-5 bg-white rounded-xl shadow-xl w-[500px] relative">
                  {/*닫기 버튼 */}

                  <button
                    onClick={() => {
                      setSelectedDrug(null);
                      setMemo("");
                      setInQty(0);
                    }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
                  >
                    X
                  </button>
                  <h3 className="text-lg font-semibold text-blue-600 mb-3">
                    입고 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <span className="font-medium">약품명 : </span>
                      {selectedDrug.drugName}
                    </p>
                    <p>
                      <span className="font-medium">코드 : </span>
                      {selectedDrug.drugCode}
                    </p>
                    <p>
                      <span className="font-medium">현재 재고 : </span>
                      {selectedDrug.quantity}
                    </p>
                    <p>
                      <span className="font-medium">위치 : </span>
                      {selectedDrug.location}
                    </p>
                  </div>

                  {/*수량 입력 */}
                  <div className="mt-4">
                    <label className="font-medium text-gray-700">
                      입고 수량
                    </label>
                    <input
                      type="number"
                      value={inQty}
                      onChange={(e) => setInQty(e.target.value)}
                      min="1"
                      className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="입고 수량 입력"
                    />
                  </div>

                  {/*메모*/}
                  <div className="mt-4">
                    <label className="font-medium text-gray-700">
                      메모 (선택)
                    </label>
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="w-full mt-2 p-3 border rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="예: 신규 입고, 증량 사유 등"
                    />
                  </div>

                  {/*저장 버튼*/}
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={handleInsert}
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700"
                    >
                      입고 등록
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/*신규 약품 등록 */}
            {mode == "new" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">약품명</label>
                    <input
                      type="text"
                      value={newDrug.drugName}
                      onChange={(e) =>
                        setNewDrug({ ...newDrug, drugName: e.target.value })
                      }
                      placeholder="예 : 타이레놀 50mg"
                      className="w-full p-3 border mt-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">
                      약품코드
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border mt-2 rounded-lg"
                      value={newDrug.drugCode}
                      onChange={(e) =>
                        setNewDrug({ ...newDrug, drugCode: e.target.value })
                      }
                      placeholder="예:DR001"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">
                      보험 코드
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border mt-2 rounded-lg"
                      value={newDrug.insuranceCode}
                      onChange={(e) =>
                        setNewDrug({
                          ...newDrug,
                          insuranceCode: e.target.value,
                        })
                      }
                      placeholder="예 : INS005"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">가격</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full p-3 border mt-2 rounded-lg"
                      value={newDrug.unitPrice}
                      onChange={(e) =>
                        setNewDrug({ ...newDrug, unitPrice: e.target.value })
                      }
                      placeholder="예: 1500"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">
                      유통기한
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border mt-2 rounded-lg"
                      value={newDrug.expirationDate}
                      onChange={(e) =>
                        setNewDrug({
                          ...newDrug,
                          expirationDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="font-medium text-gray-700">
                      입고 위치
                    </label>
                    <input
                      type="text"
                      value={newDrug.location}
                      onChange={(e) =>
                        setNewDrug({ ...newDrug, location: e.target.value })
                      }
                      placeholder="예: A-12"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">수량</label>
                    <input
                      type="number"
                      className="w-full p-3 border mt-2 rounded-lg"
                      value={newDrug.quantity}
                      onChange={(e) =>
                        setNewDrug({ ...newDrug, quantity: e.target.value })
                      }
                      placeholder="예: 50"
                      min={1}
                    />
                  </div>
                </div>
                {/*저장 버튼 */}
                <div className="flex justify-end">
                  <button
                    onClick={handleNewDrugInsert}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl shadow hover:bg-green-700"
                  >
                    신규 약품 등록
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
