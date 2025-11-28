import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// 컴포넌트 임포트
import AdminHeader from "../../component/AdminHeader";
import ConfirmModal from "../../component/ConfirmModal";
import AdminDetailModal from "../../component/AdminDetailModal";
import AdminDoctorForm from "../../component/DoctorEditForm";

// API 기본 URL
const API_BASE_URL = "http://localhost:8080/api/admins/doctors";

// 알림 모달
const InfoModal = ({ message, onClose, title = "알림" }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-[100]">
    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  </div>
);

// 재직 상태(Status) 옵션
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직 중" },
  { value: "LEAVE", label: "휴직" },
  { value: "RETIRED", label: "퇴사" },
];

const getStatusLabel = (value) =>
  STATUS_OPTIONS.find((opt) => opt.value === value)?.label || value;

const DoctorList = () => {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  // 정렬 상태 관리 (key: 컬럼명, direction: 오름차순/내림차순)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API 호출: 의사 목록 조회 (GET)
  const fetchAdmins = async () => {
    setApiError(false);
    try {
      const res = await axios.get(API_BASE_URL);
      setAdmins(res.data);
    } catch (err) {
      console.error("의사 조회 실패 (API 연결 오류):", err);
      setApiError(true);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (error) {
      return dateString;
    }
  };

  const handleCloseForm = (isRefreshed = false) => {
    setViewMode("list");
    setEditingAdmin(null);
    if (isRefreshed) {
      fetchAdmins();
    }
  };

  const handleShowMessage = (msg, title = "알림") => {
    setMessage({ text: msg, title: title });
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  const confirmDelete = (admin) => {
    setDeletingAdmin(admin);
  };

  const handleDelete = async () => {
    if (!deletingAdmin) return;
    const adminToDelete = deletingAdmin;
    setDeletingAdmin(null);

    try {
      if (!apiError) {
        const res = await axios.delete(
          `${API_BASE_URL}/${adminToDelete.adminId}`
        );
        const successMessage =
          res.data.message ||
          `${adminToDelete.name} 의사 정보(직원 계정)가 삭제되었습니다.`;
        handleShowMessage(successMessage);
        fetchAdmins();
      } else {
        setAdmins((prevAdmins) =>
          prevAdmins.filter((a) => a.adminId !== adminToDelete.adminId)
        );
        handleShowMessage(
          `(모의) ${adminToDelete.name} 의사 정보가 삭제되었습니다.`
        );
      }
    } catch (err) {
      console.error(
        "삭제 실패:",
        err.response ? err.response.data : err.message
      );
      const errorMessage =
        err.response?.data?.message || "삭제에 실패했습니다.";
      handleShowMessage(errorMessage, "오류");
    }
  };

  // 정렬 핸들러
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // 필터링 및 정렬
  const processedData = useMemo(() => {
    // 검색 필터링
    let data = admins.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.phone || "").includes(search) ||
        (a.deptName || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.licenseNo || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.empId || "").toLowerCase().includes(search.toLowerCase())
    );

    // 정렬
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key] || ""; // null 처리
        const bValue = b[sortConfig.key] || "";

        // ID가 숫자라면 숫자 비교, 문자라면 문자열 비교
        if (sortConfig.key === "adminId") {
          if (Number(aValue) < Number(bValue))
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (Number(aValue) > Number(bValue))
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return data;
  }, [admins, search, sortConfig]);

  // 페이징 처리
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 정렬 아이콘
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    if (sortConfig.direction === "ascending")
      return <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />;
    return <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />;
  };

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-8 z-50">
        <AdminDoctorForm
          adminData={editingAdmin}
          onClose={handleCloseForm}
          onShowMessage={handleShowMessage}
        />
        {message && (
          <InfoModal
            message={message.text}
            title={message.title}
            onClose={handleCloseMessage}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />

      <main className="max-w-7xl mx-auto pt-24 px-4 sm:px-8 mb-12">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 flex justify-between items-center">
          <span>
            의사 정보 목록
            <span className="font-normal text-xl ml-2 text-gray-500">
              (총 {admins.length}명)
            </span>
          </span>
        </h1>

        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="relative w-full sm:w-1/3 min-w-[250px] flex-grow">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 사번, 진료과, 면허번호 검색"
              className="w-[400px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md text-sm">
            <thead className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-200 sticky top-0">
              <tr>
                <th
                  className="py-3 px-4 text-left w-12 cursor-pointer hover:bg-gray-200 transition-colors group"
                  onClick={() => handleSort("adminId")}
                >
                  <div className="flex items-center">
                    ID {renderSortIcon("adminId")}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left w-24 cursor-pointer hover:bg-gray-200 transition-colors group"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    이름 {renderSortIcon("name")}
                  </div>
                </th>

                <th className="py-3 px-4 text-left w-32">진료과명</th>
                <th className="py-3 px-4 text-left w-28">면허번호</th>
                <th className="py-3 px-4 text-left w-24">연락처</th>

                <th
                  className="py-3 px-4 text-left w-24 cursor-pointer hover:bg-gray-200 transition-colors group"
                  onClick={() => handleSort("hiredDate")}
                >
                  <div className="flex items-center">
                    입사일 {renderSortIcon("hiredDate")}
                  </div>
                </th>

                <th
                  className="py-3 px-4 text-left w-20 cursor-pointer hover:bg-gray-200 transition-colors group"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    재직 상태 {renderSortIcon("status")}
                  </div>
                </th>

                <th className="py-3 px-4 text-center w-24">관리</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((a) => (
                <tr
                  key={a.adminId}
                  className="border-b border-gray-100 hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <td className="py-2 px-4">{a.adminId || "-"}</td>
                  <td
                    className="py-2 px-4 text-blue-600 cursor-pointer hover:font-bold"
                    onClick={() => {
                      setSelectedAdminId(a.adminId);
                    }}
                  >
                    {a.name || "-"}
                  </td>
                  <td className="py-2 px-4">{a.deptName || "-"}</td>
                  <td className="py-2 px-4 font-mono text-xs">
                    {a.licenseNo || "-"}
                  </td>
                  <td className="py-2 px-4 text-xs">{a.phone || "-"}</td>
                  <td className="py-2 px-4 text-gray-500 text-xs">
                    {formatDate(a.hiredDate)}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : a.status === "LEAVE"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getStatusLabel(a.status)}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        setEditingAdmin(a);
                        setViewMode("edit");
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition duration-150 ease-in-out hover:bg-blue-100"
                      title="수정"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(a)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md transition duration-150 ease-in-out hover:bg-red-100"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {processedData.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-10 text-gray-500 italic bg-white"
                  >
                    등록된 의사 정보가 없거나 검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 UI */}
        {processedData.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md border border-gray-300 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    currentPage === number
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md border border-gray-300 ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      <AdminDetailModal
        isOpen={!!selectedAdminId}
        onClose={() => setSelectedAdminId(null)}
        adminId={selectedAdminId}
      />

      {deletingAdmin && (
        <ConfirmModal
          message={`'${deletingAdmin.name}' 의사 정보(직원 계정)를 정말로 삭제하시겠습니까?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingAdmin(null)}
        />
      )}

      {message && (
        <InfoModal
          message={message.text}
          title={message.title}
          onClose={handleCloseMessage}
        />
      )}
    </div>
  );
};

export default DoctorList;
