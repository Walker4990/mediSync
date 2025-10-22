import { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";
import { format } from "date-fns";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  // 초기 데이터 불러오기
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://192.168.0.24:8080/api/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("환자 조회 실패:", err);
    }
  };

  // 검색 필터링
  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  // 날짜 형식 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return ""; // 날짜 값이 없는 경우 빈 문자열 반환
    try {
      const date = new Date(dateString);
      // 'yyyy-MM-dd HH:mm:ss' 형식으로 포맷
      return format(date, "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      console.error("날짜 포맷 오류:", error);
      return dateString; // 오류 발생 시 원본 문자열 반환
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />

      {/* 컨텐츠 영역 */}
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          환자 관리 목록
        </h1>

        {/* 검색창 + 새로고침 버튼 */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-1/3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 또는 전화번호 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={fetchPatients}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            새로고침
          </button>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md text-sm">
            <thead className="bg-gray-100 text-gray-800 font-semibold">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">이름</th>
                <th className="py-3 px-4">주민번호</th>
                <th className="py-3 px-4">전화번호</th>
                <th className="py-3 px-4">주소</th>
                <th className="py-3 px-4">보험사</th>
                <th className="py-3 px-4">보험 동의</th>
                <th className="py-3 px-4">상태</th>
                <th className="py-3 px-4">등록일</th>
                <th className="py-3 px-4">수정일</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.patientId}
                  className="border-b hover:bg-gray-50 text-gray-700"
                >
                  <td className="py-2 px-4">{p.patientId}</td>
                  <td className="py-2 px-4 font-medium">{p.name}</td>
                  <td className="py-2 px-4">{p.residentNo}</td>
                  <td className="py-2 px-4">{p.phone}</td>
                  <td className="py-2 px-4">{p.address}</td>
                  <td className="py-2 px-4">{p.insurerCode}</td>

                  {/* 보험 동의 여부 표시 */}
                  <td className="py-2 px-4 text-center">
                    {p.consentInsurance ? (
                      <span className="text-green-500 font-semibold">동의</span>
                    ) : (
                      <span className="text-gray-400">미동의</span>
                    )}
                  </td>

                  {/* 상태 표시 */}
                  <td className="py-2 px-4 text-center">
                    {p.status === "ACTIVE" ? (
                      <span className="text-green-600 font-semibold">활성</span>
                    ) : (
                      <span className="text-red-500 font-semibold">비활성</span>
                    )}
                  </td>

                  <td className="py-2 px-4 text-gray-500">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="py-2 px-4 text-gray-500">
                    {formatDate(p.updatedAt)}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-6 text-gray-500 italic"
                  >
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
}
