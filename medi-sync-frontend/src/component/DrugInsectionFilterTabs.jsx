export default function DrugInsectionFilterTabs({ filter, setFilter }) {
  return (
    <div className="flex gap-3 mb-8">
      <button
        onClick={() => setFilter("all")}
        className={`px-4 py-2 rounded font-medium ${
          filter === "all"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        전체
      </button>

      <button
        onClick={() => setFilter("unchecked")}
        className={`px-4 py-2 rounded font-medium ${
          filter === "unchecked"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        이번달 미검사
      </button>
    </div>
  );
}
