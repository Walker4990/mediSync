export default function DrugDisposeTab({ filter, setFilter }) {
  return (
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
  );
}
