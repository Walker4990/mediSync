import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import AdminHeader from "../../component/AdminHeader";
import AdminDetailModal from "../../component/AdminDetailModal";
import StaffForm, {
  POSITION_OPTIONS,
  STATUS_OPTIONS,
} from "../../component/StaffEditForm";

// API 기본 URL
const API_BASE_URL = "http://localhost:8080/api/admins/staffs";

// 입사일 포맷 함수 (날짜만)
const formatDateOnly = (dateString) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "yyyy-MM-dd");
  } catch (error) {
    return dateString;
  }
};

// ENUM 레이블 찾기
const getPositionLabel = (value) =>
  POSITION_OPTIONS.find((opt) => opt.value === value)?.label || value;
const getStatusLabel = (value) =>
  STATUS_OPTIONS.find((opt) => opt.value === value)?.label || value;

export default function MedicalStaffList() {
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [apiError, setApiError] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 초기 데이터 불러오기
  useEffect(() => {
    fetchStaff();
  }, []);

  // 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // API 호출: 의료진 목록 조회 (GET)
  const fetchStaff = async () => {
    setApiError(false);
    try {
      const res = await axios.get(API_BASE_URL);
      setStaffList(res.data);
    } catch (err) {
      console.error("의료진 조회 실패:", err);
      // API 연결 오류 시 처리
      if (
        axios.isAxiosError(err) &&
        (!err.response || err.response.status === 500)
      ) {
        console.warn(`API 연결(${API_BASE_URL})에 실패했습니다.`);
        setApiError(true);
      } else {
        setApiError(true);
      }
    }
  };

  // 폼 닫기 핸들러 (isRefreshed가 true면 목록 새로고침)
  const handleCloseForm = (isRefreshed = false) => {
    setViewMode("list");
    setEditingStaff(null);
    if (isRefreshed) {
      fetchStaff();
    }
  };

  // 삭제 확인 모달 열기
  const confirmDelete = (staff) => {
    setDeletingStaff(staff);
  };

  // 최종 삭제 실행
  const handleDelete = async () => {
    if (!deletingStaff) return;

    try {
      if (!apiError) {
        const res = await axios.delete(
          `${API_BASE_URL}/${deletingStaff.staffId}`
        );
        alert(
          res.data.message ||
            `${deletingStaff.name} 의료진 정보가 삭제되었습니다.`
        );
        fetchStaff();
      } else {
        setStaffList((prevStaffList) =>
          prevStaffList.filter((d) => d.staffId !== deletingStaff.staffId)
        );
        alert(`(모의) ${deletingStaff.name} 의료진 정보가 삭제되었습니다.`);
      }
    } catch (err) {
      console.error(
        "삭제 실패:",
        err.response ? err.response.data : err.message
      );
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    } finally {
      setDeletingStaff(null); // 모달 닫기
    }
  };

  // 검색 필터링 (useMemo로 최적화)
  const filteredStaff = useMemo(() => {
    return staffList.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || "").includes(search) ||
        (s.deptName || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.licenseNo || "").toLowerCase().includes(search.toLowerCase()) ||
        getPositionLabel(s.position || "").includes(search)
    );
  }, [staffList, search]);

  // 페이징 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 뷰 모드에 따라 렌더링할 내용 상이 (등록/수정 모달)
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50">
        <StaffForm staffData={editingStaff} onClose={handleCloseForm} />
      </div>
    );
  }

  // 목록 뷰 렌더링
  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />

      {/* 컨텐츠 영역 */}
      <main className="max-w-7xl mx-auto pt-24 px-8 mb-12">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 flex justify-between items-center">
          <span>
            의료진 정보 목록
            <span className="font-normal text-xl ml-2 text-gray-500">
              (총 {staffList.length}명)
            </span>
          </span>
        </h1>

        {/* API 연결 오류 경고 메시지 */}
        {apiError && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg relative mb-6 shadow-sm"
            role="alert"
          >
            <p className="font-bold">API 연결 또는 처리 오류:</p>
            <p className="text-sm">
              백엔드 서버(`{API_BASE_URL}`)에 연결할 수 없어 **모의 데이터**를
              표시합니다. CRUD 동작은 프론트엔드에서만 반영됩니다.
            </p>
          </div>
        )}

        {/* 검색창 */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="relative w-full sm:w-1/3 min-w-[250px] flex-grow">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 직무, 진료과, 연락처 검색"
              className="w-[400px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md text-sm">
            <thead className="bg-gray-100 text-gray-800 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left w-16">ID</th>
                <th className="py-3 px-4 text-left w-24">이름</th>
                <th className="py-3 px-4 text-left w-28">직무</th>
                <th className="py-3 px-4 text-left w-32">소속 진료과</th>
                <th className="py-3 px-4 text-left w-32">자격번호</th>
                <th className="py-3 px-4 text-left w-28">연락처</th>
                <th className="py-3 px-4 text-left w-28">입사일</th>
                <th className="py-3 px-4 text-left w-28">재직 상태</th>
                <th className="py-3 px-4 text-center w-24">관리</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((s) => (
                <tr
                  key={s.staffId}
                  className="border-b border-gray-100 hover:bg-indigo-50/50 text-gray-700 transition-colors"
                >
                  <td className="py-2 px-4 text-gray-600">{s.adminId}</td>
                  <td
                    className="py-2 px-4 text-blue-600 cursor-pointer hover:font-bold"
                    onClick={() => {
                      setSelectedStaffId(s.adminId);
                    }}
                  >
                    {s.name}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.position === "NURSE"
                          ? "bg-blue-100 text-blue-800"
                          : s.position === "ADMIN"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getPositionLabel(s.position)}
                    </span>
                  </td>
                  <td className="py-2 px-4">{s.deptName || "-"}</td>
                  <td className="py-2 px-4 font-mono text-xs">{s.licenseNo}</td>
                  <td className="py-2 px-4 text-xs">{s.phone || "-"}</td>
                  <td className="py-2 px-4 text-gray-500 text-xs">
                    {formatDateOnly(s.hiredDate)}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : s.status === "LEAVE"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getStatusLabel(s.status)}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        setEditingStaff(s);
                        setViewMode("edit");
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition duration-150 ease-in-out"
                    >
                      <Edit className="w-5 h-5" />{" "}
                    </button>
                    <button
                      onClick={() => confirmDelete(s)}
                      className="text-red-600 hover:text-red-800 text-xs font-bold transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />{" "}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-10 text-gray-500 italic bg-white"
                  >
                    등록된 의료진 정보가 없거나 검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 UI */}
        {filteredStaff.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            {/* 이전 버튼 */}
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

            {/* 페이지 번호 생성 */}
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

            {/* 다음 버튼 */}
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
        isOpen={!!selectedStaffId}
        onClose={() => setSelectedStaffId(null)}
        adminId={selectedStaffId}
      />

      {/* 삭제 확인 모달 렌더링 */}
      {deletingStaff && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <p className="text-lg font-semibold mb-4">삭제 확인</p>
            <p className="mb-6">
              '{deletingStaff.name}' 의료진 정보를 정말로 삭제하시겠습니까?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
