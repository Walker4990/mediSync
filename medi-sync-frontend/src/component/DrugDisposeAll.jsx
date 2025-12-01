import { useState } from "react";

export default function DrugDisposeAll({
  setSelectedDrugDispose,
  setDisposeQty,
  drugList,
}) {
  const [search, setSearch] = useState("");
  //검색 필터
  const filteredDrugList = drugList.filter(
    (drug) =>
      drug.drugName.toLowerCase().includes(search.toLowerCase()) ||
      drug.drugCode.toLowerCase().includes(search.toLowerCase())
  );
  return (
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
                  <p className="text-sm text-gray-500">코드: {drug.drugCode}</p>
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
                  <span className="font-medium">위치:</span> {drug.location}
                </p>

                <p className="col-span-2">
                  <span className="font-medium">보험사:</span>{" "}
                  {drug.insurerName || "-"}
                </p>

                <p className="col-span-2 text-xs text-gray-400 mt-1">
                  마지막 수정: {new Date(drug.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
