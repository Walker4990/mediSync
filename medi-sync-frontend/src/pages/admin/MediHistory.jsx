import React, { useState } from "react";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import AdminHeader from "../../component/AdminHeader";

// 더미 데이터 추가
const dummyRecords = [
  {
    id: 1,
    date: "2025-10-20",
    doctor: "김철수",
    department: "내과",
    diagnosis: "감기",
    status: "진료 완료",
  },
  {
    id: 2,
    date: "2025-09-05",
    doctor: "이영희",
    department: "치과",
    diagnosis: "충치",
    status: "진료 완료",
  },
  {
    id: 3,
    date: "2025-08-15",
    doctor: "박민준",
    department: "정형외과",
    diagnosis: "허리 통증",
    status: "예약 취소",
  },
  {
    id: 4,
    date: "2025-07-01",
    doctor: "최유리",
    department: "피부과",
    diagnosis: "여드름",
    status: "진료 완료",
  },
];

const MediHistory = () => {
  const [records, setRecords] = useState(dummyRecords);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (record) => {
    alert(`진료 기록 수정: ${record.id}`);
  };

  const handleDelete = (record) => {
    if (
      window.confirm(`ID ${record.id}의 진료 기록을 정말로 삭제하시겠습니까?`)
    ) {
      setRecords(records.filter((r) => r.id !== record.id));
    }
  };

  // 검색 로직
  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          진료 기록 조회
        </h1>

        {/* 검색 및 필터 영역 */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="진료일시, 의사명, 진단명으로 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-150"
            onClick={() => alert("insert modal here")}
          >
            + 새 진료 기록 등록
          </button>
        </div>

        {/* 진료 기록 테이블 */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  No.
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  진료일시
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  의사명
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  진료과
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  진단명
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  상태
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                      {record.id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                      {record.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                      {record.doctor}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                      {record.department}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                      {record.diagnosis}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === "진료 완료"
                            ? "bg-green-100 text-green-800"
                            : record.status === "예약 취소"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap space-x-2">
                      {/* 수정 버튼 */}
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition duration-150 ease-in-out"
                        title="수정"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleDelete(record)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-md transition duration-150 ease-in-out"
                        title="삭제"
                      >
                        <FaTrashAlt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default MediHistory;
