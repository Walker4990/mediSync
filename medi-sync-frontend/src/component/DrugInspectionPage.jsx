export default function DrugInspectionPage({ inspectionList }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-5 h-[600px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">이번 달 검사 결과</h2>

      {inspectionList.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">데이터 없음</p>
      ) : (
        <ul className="divide-y">
          {inspectionList.map((item) => (
            <li
              key={item.checkId}
              className="p-4 border rounded-xl hover:bg-blue-50 cursor-pointer"
            >
              <p className="font-semibold">{item.drugName}</p>
              <p className="text-sm text-gray-500">위치 : {item.location}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
