import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";
import ConfirmModal from "../../component/ConfirmModal";
import AdminDetailModal from "../../component/AdminDetailModal";
import { format } from "date-fns";
import {
  ChevronDown,
  Edit,
  Trash2,
  Search,
  PlusCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// API 기본 URL
const API_BASE_URL = "http://localhost:8080/api/admins/doctors";
const DEPT_API_URL = "http://localhost:8080/api/departments";

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

// 등록/수정 모달
const AdminDoctorForm = ({
  adminData,
  onClose,
  departments,
  onShowMessage,
}) => {
  const isEditing = !!adminData?.adminId;
  const initialDeptId = adminData?.deptId ? String(adminData.deptId) : "";
  const today = format(new Date(), "yyyy-MM-dd");

  const [formData, setFormData] = useState({
    adminId: adminData?.adminId || null,
    name: adminData?.name || "",
    empId: adminData?.empId || "",
    password: "",
    deptId: initialDeptId,
    licenseNo: adminData?.licenseNo || "",
    phone: adminData?.phone || "",
    status: adminData?.status || STATUS_OPTIONS[0].value,
    hiredDate: adminData?.hiredDate
      ? format(new Date(adminData.hiredDate), "yyyy-MM-dd")
      : today,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deptList, setDeptList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 필수 필드 검증
    if (!formData.deptId || !formData.hiredDate) {
      setError("진료과와 입사일은 필수 입력 항목입니다.");
      setLoading(false);
      return;
    }
    if (!isEditing && (!formData.empId || !formData.password)) {
      setError("사번과 비밀번호는 필수 입력 항목입니다.");
      setLoading(false);
      return;
    }
    if (!formData.name || !formData.licenseNo) {
      setError("이름과 면허번호는 필수 입력 항목입니다.");
      setLoading(false);
      return;
    }

    try {
      let res;
      const dataToSend = { ...formData };
      delete dataToSend.deptName; // 서버 전송 시 제외

      if (isEditing) {
        // 수정: PUT
        if (dataToSend.password === "") {
          delete dataToSend.password; // 비밀번호 미입력 시 전송 안 함
        }
        res = await axios.put(
          `${API_BASE_URL}/${dataToSend.adminId}`,
          dataToSend
        );
        console.log("수정 성공:", res.data);
      } else {
        // 등록: POST
        delete dataToSend.adminId; // 등록 시 adminId 제거
        res = await axios.post(API_BASE_URL, dataToSend);
        console.log("등록 성공:", res.data);
      }

      const successMessage =
        res.data.message ||
        `${formData.name} 의사 정보가 ${
          isEditing ? "수정" : "등록"
        }되었습니다.`;

      onShowMessage(successMessage, "성공");
      onClose(true); // 성공 후 목록 새로고침
    } catch (err) {
      console.error(
        "저장/수정 실패:",
        err.response ? err.response.data : err.message
      );
      const errorMessage =
        err.response?.data?.message || (isEditing ? "수정 실패" : "등록 실패");

      setError(
        `${errorMessage}: 필수 항목을 확인하거나 중복된 정보(사번, 면허번호)가 아닌지 확인해주세요.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await axios.get(DEPT_API_URL);
        setDeptList(res.data);
      } catch (err) {
        console.error("부서 목록 로드 실패:", err);
        onShowMessage("부서 정보를 불러올 수 없습니다.", "오류");
      }
    };
    loadDepartments();
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600 border-b pb-2">
        {isEditing ? "의사 정보 수정" : "새 의사 등록"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID / 사번 */}
        {isEditing && (
          <div className="bg-indigo-50 p-3 rounded-md text-sm border border-indigo-200">
            <label className="block text-indigo-600 font-semibold">
              ID / 사번
            </label>
            <p className="font-bold text-gray-800">
              {adminData.adminId} / {adminData.empId}
            </p>
          </div>
        )}

        {/* 이름 */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            이름 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* 진료과명 */}
        <div>
          <label
            htmlFor="deptId"
            className="block text-sm font-medium text-gray-700"
          >
            진료과명 *
          </label>
          <div className="relative mt-1">
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              id="deptId"
              name="deptId"
              value={formData.deptId}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              <option value="" disabled>
                진료과를 선택하세요
              </option>
              {deptList.map((dept) => (
                <option key={dept.deptId} value={dept.deptId}>
                  {dept.deptName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 면허번호 (등록 시 필수, 수정 시 불가) */}
        <div className={isEditing ? "opacity-50" : ""}>
          <label
            htmlFor="licenseNo"
            className="block text-sm font-medium text-gray-700"
          >
            면허번호 {isEditing ? "(수정 불가)" : "*"}
          </label>
          <input
            type="text"
            id="licenseNo"
            name="licenseNo"
            value={formData.licenseNo}
            onChange={handleChange}
            required={!isEditing}
            disabled={isEditing}
            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 ${
              isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        {/* 연락처 */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            연락처
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* 재직 상태 */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            재직 상태
          </label>
          <div className="relative mt-1">
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 입사일 */}
        <div>
          <label
            htmlFor="hiredDate"
            className="block text-sm font-medium text-gray-700"
          >
            입사일 *
          </label>
          <input
            type="date"
            id="hiredDate"
            name="hiredDate"
            value={formData.hiredDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={() => onClose && onClose(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md shadow-md transition-colors flex items-center justify-center ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> 처리 중...
              </>
            ) : isEditing ? (
              "수정 완료"
            ) : (
              "등록"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ====================================================================
// 메인 APP 컴포넌트 (의사 목록 및 관리)
// ====================================================================

const DoctorList = () => {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [message, setMessage] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

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

  const filtered = admins.filter(
    (a) =>
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.phone || "").includes(search) ||
      (a.deptName || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.licenseNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.empId || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 뷰 모드에 따라 렌더링할 내용 상이 (add/edit은 모달로 처리)
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-8 z-50">
        <AdminDoctorForm
          adminData={editingAdmin}
          onClose={handleCloseForm}
          departments={uniqueDepartments}
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
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          의사 정보 목록
          <span className="font-normal text-xl ml-2">
            (총 {admins.length}명)
          </span>
        </h1>

        {/* 검색창 */}
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
                <th className="py-3 px-4 text-left w-12">ID</th>
                <th className="py-3 px-4 text-left w-24">이름</th>
                <th className="py-3 px-4 text-left w-32">진료과명</th>
                <th className="py-3 px-4 text-left w-28">면허번호</th>
                <th className="py-3 px-4 text-left w-24">연락처</th>
                <th className="py-3 px-4 text-left w-24">입사일</th>
                <th className="py-3 px-4 text-left w-20">재직 상태</th>
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

              {filtered.length === 0 && (
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
        {filtered.length > 0 && (
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

      {/* 상세 정보 모달 */}
      <AdminDetailModal
        isOpen={!!selectedAdminId}
        onClose={() => setSelectedAdminId(null)}
        adminId={selectedAdminId}
      />

      {/* 삭제 확인 모달 */}
      {deletingAdmin && (
        <ConfirmModal
          message={`'${deletingAdmin.name}' 의사 정보(직원 계정)를 정말로 삭제하시겠습니까?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingAdmin(null)}
        />
      )}

      {/* 알림 모달 */}
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
