import { div, li } from "framer-motion/client";
import React, { useState } from "react";

export default function DrugAllPage({
  drugList,
  setSelectedDrugDispose,
  setDisposeQty,
}) {
  const [search, setSearch] = useState("");

  const filtered = drugList.filter(
    (drug) =>
      drug.drugName.toLowerCase().includes(search.toLowerCase()) ||
      drug.drugCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 h-[600px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">전체 약품 목록</h2>
      <input
        type="text"
        placeholder="검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 mb-4 border rounded"
      />

      <ul className="divide-y">
        {filtered.map((drug) => (
          <li
            key={drug.drugCode}
            onClick={() => {
              setSelectedDrugDispose(drug);
              setDisposeQty(0);
            }}
            className="p-4 border rounded-xl shadow-sm hover:bg-blue-50 transition cursor-pointer"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-lg font-semibold">{drug.drugName}</p>
                <p className="text-sm text-gray-500">{drug.drugCode}</p>
              </div>
              <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                {drug.quantity}개
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
