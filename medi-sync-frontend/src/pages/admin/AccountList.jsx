import React, { useState, useEffect } from "react";
import { Search, Plus, Settings, Trash2, Edit } from "lucide-react";
import AdminHeader from "../../component/AdminHeader";

const API_URL = "http://192.168.0.24:8080/api/accounts";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 로딩 함수
  const fetchAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}`);
      if (!response.ok) {
        // HTTP 오류 코드가 반환된 경우
        const errorText = await response.text();
        throw new Error(
          `계정 데이터를 불러오는데 실패했습니다. (상태: ${
            response.status
          }, 내용: ${errorText.substring(0, 100)}...)`
        );
      }

      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      console.error("Fetch Accounts Error:", err);
      setError(
        "데이터 로드 중 오류가 발생했습니다. 서버 연결 상태 및 CORS 설정을 확인하세요."
      );
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 검색 필터링 로직
  const filteredAccounts = accounts.filter((account) => {
    const searchString = searchTerm.toLowerCase();
    return (
      account.name.toLowerCase().includes(searchString) ||
      account.empId.toLowerCase().includes(searchString) ||
      account.phone?.includes(searchString) ||
      account.email?.toLowerCase().includes(searchString)
    );
  });

  // 날짜 형식 포맷팅 함수 (YYYY-MM-DD)
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return date
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, "-")
        .replace(/\.$/, "");
    } catch {
      return isoString.split("T")[0]; // 오류 발생 시 T 앞부분만 반환
    }
  };

  // 역할(Role)에 따른 스타일 및 텍스트 반환
  const getRoleDisplay = (role) => {
    let style = "px-3 py-1 rounded-full text-xs font-semibold ";
    let text = role;
    if (role === "ADMIN") {
      style += "bg-red-100 text-red-700";
      text = "관리자";
    } else if (role === "USER") {
      style += "bg-green-100 text-green-700";
      text = "사용자";
    } else {
      style += "bg-gray-100 text-gray-700";
    }
    return <span className={style}>{text}</span>;
  };

  // 테이블 헤더 정의
  const headers = [
    { key: "adminId", label: "ID", width: "w-16" },
    { key: "name", label: "이름", width: "w-24" },
    { key: "empId", label: "사번/직원ID", width: "w-32" },
    { key: "role", label: "역할", width: "w-24" },
    { key: "phone", label: "연락처", width: "w-32" },
    { key: "email", label: "이메일", width: "w-48" },
    { key: "staffId", label: "의료진ID", width: "w-24" },
    { key: "doctorId", label: "의사ID", width: "w-24" },
    { key: "createdAt", label: "생성일", width: "w-32" },
    { key: "actions", label: "관리", width: "w-24" },
  ];

  // 수정 및 삭제 기능
  const handleEdit = (id) => {
    alert(`ID ${id} 계정 수정`);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`ID ${id} 계정을 정말로 삭제하시겠습니까?`)) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`삭제에 실패했습니다. (상태: ${response.status})`);
        }
        alert(`ID ${id} 계정 삭제`);
        fetchAccounts();
      } catch (error) {
        console.error("Delete Error:", error);
        alert(`삭제 중 오류 발생: ${error.message}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 border border-red-300 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-600 flex items-center">
            계정 정보 목록
            <span className="ml-3 text-lg font-semibold text-blue-400">
              (총 {filteredAccounts.length}명)
            </span>
          </h1>
        </header>

        {/* 검색 및 액션 버튼 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="이름, ID, 연락처, 이메일 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => alert("기능 추가 예정")}
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition shadow-sm"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 계정 목록 테이블 */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header.key}
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${header.width}`}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* 테이블 바디 */}
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <tr
                      key={account.adminId}
                      className="hover:bg-blue-50/50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {account.adminId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        {account.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {account.empId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getRoleDisplay(account.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {account.phone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs">
                        {account.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {account.staffId || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {account.doctorId || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(account.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(account.adminId)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-100 transition"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.adminId)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-100 transition"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className="px-6 py-10 text-center text-gray-500 text-lg"
                    >
                      {searchTerm
                        ? `"${searchTerm}"에 해당하는 계정이 없습니다.`
                        : "등록된 계정 정보가 없습니다."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountList;
