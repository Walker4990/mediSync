import { useState } from "react";

export default function DrugDisposedPage({
  drugList,
  drugLog,
  fetchDisposedList,
  sortOrder,
  setSelectedDrugDeadline,
  selectedDrugDeadline,
  setSortOrder,
  page,
  setPage,
}) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 col-span-2 h-[650px] flex-col overflow-y-auto">
      {/*헤더 */}
      <h1 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800">
        폐기 기록 조회
      </h1>
      {/*필터 영역 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/*정렬 기준 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">
            정렬 기준
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border p-2 rounded-lg bg-gray-50 hover:bg-white transition shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>

        {/*약품 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">
            약품 선택
          </label>
          <select
            value={selectedDrugDeadline}
            onChange={(e) => setSelectedDrugDeadline(e.target.value)}
            className="border p-2 rounded-lg bg-gray-50 hover:bg-white transition shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="">전체 약품</option>
            {drugList.map((drug) => (
              <option key={drug.drugCode} value={drug.drugCode}>
                {drug.drugName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/*리스트 출력 */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 shadow-inner">
        {/*폐기 기록 리스트 */}
        {drugLog.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">
            조회된 폐기 기록이 없습니다.
          </p>
        ) : (
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                  약품명
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                  코드
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                  유형
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                  수량
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                  이전 재고
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                  이후 재고
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                  메모
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                  폐기일
                </th>
              </tr>
            </thead>

            <tbody>
              {drugLog.map((log, idx) => {
                return (
                  <tr
                    key={log.logId}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2 text-sm text-center">
                      {log.drugName}
                    </td>

                    <td className="px-4 py-2 text-sm text-center">
                      {log.drugCode}
                    </td>

                    <td className="px-4 py-2 text-sm text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium text-center ${
                          log.type === "DISPOSE"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>

                    <td className="px-4 py-2 text-sm text-center">
                      {log.quantity}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      {log.beforeStock}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      {log.afterStock}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 text-center">
                      {log.memo}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      {log.createdAt?.replace("T", " ").substring(0, 16)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${
              page === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowd"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            이전
          </button>

          <span className="px-3 py-1">{page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={drugLog.length < 10}
            className={`px-3 py-1 rounded ${
              drugLog.length < 10
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
