import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import AdminHeader from "../../component/AdminHeader";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import ConfirmModal from "../../component/ConfirmModal";

// API 기본 URL (백엔드 MedicalStaffController 경로와 일치)
const API_BASE_URL = "http://192.168.0.24:8080/api/staffs";

// 직무(Position) 옵션
const POSITION_OPTIONS = [
  { value: "NURSE", label: "간호사" },
  { value: "RADIOLOGIST", label: "방사선사" },
  { value: "LAB_TECH", label: "임상병리사" },
  { value: "ASSISTANT", label: "진료보조" },
  { value: "ADMIN", label: "원무/행정" },
];

// 재직 상태(Status) 옵션
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직 중" },
  { value: "LEAVE", label: "휴직" },
  { value: "RETIRED", label: "퇴사" },
];

// 날짜 포맷 함수
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  try {
    const isoDateString = dateString.includes("T")
      ? dateString
      : dateString.replace(" ", "T");
    return format(new Date(isoDateString), "yyyy-MM-dd HH:mm");
  } catch (error) {
    return dateString;
  }
};

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

// --- StaffForm 컴포넌트 (등록/수정 모달 내용) ---

const StaffForm = ({ staffData, onClose }) => {
  const isEditing = !!staffData;
  const today = format(new Date(), "yyyy-MM-dd");

  const initialData = staffData || {
    staffName: "",
    department: "",
    position: POSITION_OPTIONS[0].value, // 기본값 설정
    licenseNo: "",
    phone: "",
    status: STATUS_OPTIONS[0].value, // 기본값 설정
    hiredDate: today, // 기본값 설정
  };

  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 필수 필드 검증 (이름, 직무, 등록 시 면허번호)
    if (
      !formData.staffName ||
      !formData.position ||
      (!isEditing && !formData.licenseNo)
    ) {
      setError("필수 항목(이름, 직무, 면허번호)을 모두 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (isEditing) {
        // 수정 시에는 staffId가 포함된 formData 그대로 전송
        res = await axios.put(API_URL, formData);
        console.log("수정 성공:", res.data);
      } else {
        // 등록 시 staffId는 백엔드에서 자동 생성되므로 제거 (새로운 등록)
        const postData = { ...formData };
        delete postData.staffId;

        res = await axios.post(API_URL, postData);
        console.log("등록 성공:", res.data);
      }

      // alert() 대신 커스텀 모달이나 토스트 알림 사용 권장
      alert(
        res.data.message ||
          `${formData.staffName} 의료진 정보가 ${
            isEditing ? "수정" : "등록"
          }되었습니다.`
      );

      onClose && onClose(true); // 성공 시 목록 새로고침
    } catch (err) {
      console.error(
        "저장/수정 실패:",
        err.response ? err.response.data : err.message
      );
      const errorMessage =
        err.response?.data?.message || (isEditing ? "수정 실패" : "등록 실패");
      setError(
        `${errorMessage}: 필수 항목을 확인하거나 중복된 정보(면허번호)가 아닌지 확인해주세요.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600 border-b pb-2">
        {isEditing ? "의료진 정보 수정" : "새 의료진 등록"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing && (
          <div className="bg-indigo-50 p-3 rounded-md text-sm border border-indigo-200">
            <label className="block text-indigo-600 font-semibold">
              고유 ID
            </label>
            <p className="font-bold text-gray-800">{staffData.staffId}</p>
          </div>
        )}

        {/* 1. 이름 */}
        <div>
          <label
            htmlFor="staffName"
            className="block text-sm font-medium text-gray-700"
          >
            이름 *
          </label>
          <input
            type="text"
            id="staffName"
            name="staffName"
            value={formData.staffName}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* 2. 직무 유형 (Position) */}
        <div>
          <label
            htmlFor="position"
            className="block text-sm font-medium text-gray-700"
          >
            직무 유형 *
          </label>
          <select
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
          >
            {POSITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. 진료과명 / 소속 */}
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700"
          >
            소속 진료과 (또는 부서)
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* 4. 면허번호 (등록 시에만 입력 가능) */}
        <div className={isEditing ? "opacity-50" : ""}>
          <label
            htmlFor="licenseNo"
            className="block text-sm font-medium text-gray-700"
          >
            자격/면허번호 {isEditing ? "(수정 불가)" : "*"}
          </label>
          <input
            type="text"
            id="licenseNo"
            name="licenseNo"
            value={formData.licenseNo}
            onChange={handleChange}
            required={!isEditing}
            disabled={isEditing}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 disabled:bg-gray-100"
          />
        </div>

        {/* 5. 연락처 */}
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

        {/* 6. 재직 상태 (Status) */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            재직 상태
          </label>
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

        {/* 7. 입사일 (Hired Date) */}
        <div>
          <label
            htmlFor="hiredDate"
            className="block text-sm font-medium text-gray-700"
          >
            입사일
          </label>
          <input
            type="date"
            id="hiredDate"
            name="hiredDate"
            value={formData.hiredDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

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
            className={`px-4 py-2 text-white rounded-md shadow-md transition-colors ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={loading}
          >
            {loading ? "처리 중..." : isEditing ? "수정 완료" : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- MedicalStaffList 메인 컴포넌트 ---

export default function MedicalStaffList() {
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [apiError, setApiError] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);

  // 초기 데이터 불러오기
  useEffect(() => {
    fetchStaff();
  }, []);

  // API 호출: 의료진 목록 조회 (GET)
  const fetchStaff = async () => {
    setApiError(false);
    try {
      const res = await axios.get(API_BASE_URL);
      setStaffList(res.data);
    } catch (err) {
      console.error("의료진 조회 실패:", err);
      // API 연결 오류 시 모의 데이터 로드
      if (
        axios.isAxiosError(err) &&
        (!err.response || err.response.status === 500)
      ) {
        console.warn(
          `API 연결(${API_BASE_URL})에 실패했습니다. 모의 데이터를 로드합니다.`
        );
        setApiError(true);
      } else {
        setApiError(true); // 기타 오류 시에도 오류 상태 표시
      }
    }
  };

  const StaffDetail = (id) => {
    alert(id);
    return <div>인사정보 페이지</div>;
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
            `${deletingStaff.staffName} 의료진 정보가 삭제되었습니다.`
        );
        fetchStaff();
      } else {
        // 모의 데이터 삭제 (프론트엔드에서만 처리)
        setStaffList((prevStaffList) =>
          prevStaffList.filter((d) => d.staffId !== deletingStaff.staffId)
        );
        alert(
          `(모의) ${deletingStaff.staffName} 의료진 정보가 삭제되었습니다.`
        );
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
        (s.staffName || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || "").includes(search) ||
        (s.department || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.licenseNo || "").toLowerCase().includes(search.toLowerCase()) ||
        getPositionLabel(s.position || "").includes(search)
    );
  }, [staffList, search]);

  // 뷰 모드에 따라 렌더링할 내용 상이 (모달 처리)
  if (viewMode === "add" || viewMode === "edit") {
    // 기존 코드의 DropdownMenu, AdminHeader, ConfirmModal 컴포넌트가 임포트된 곳에 MedicalStaffList가 위치한다고 가정
    // 모달 대신 전체 화면 Form으로 처리
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
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          의료진 정보 목록
          <span className="font-normal text-xl ml-2">
            (총 {staffList.length}명)
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

        {/* 검색창 + 버튼 그룹 */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
          <div className="relative w-1/3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 직무, 진료과, 연락처 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="space-x-3 flex">
            <button
              onClick={() => {
                setViewMode("add");
                setEditingStaff(null);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md transform hover:scale-[1.02]"
            >
              신규 등록
            </button>
            <button
              onClick={fetchStaff}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md transform hover:scale-[1.02]"
            >
              ♻
            </button>
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
                <th className="py-3 px-4 text-left w-28">입사일</th>
                <th className="py-3 px-4 text-left w-28">재직 상태</th>
                <th className="py-3 px-4 text-left w-28">연락처</th>
                <th className="py-3 px-4 text-left w-36">등록일시</th>
                <th className="py-3 px-4 text-center w-24">관리</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.map((s) => (
                <tr
                  key={s.staffId}
                  className="border-b border-gray-100 hover:bg-indigo-50/50 text-gray-700 transition-colors"
                >
                  <td className="py-2 px-4 text-gray-600">{s.staffId}</td>
                  <td
                    className="py-2 px-4 font-bold text-gray-900"
                    onClick={() => {
                      StaffDetail(s.staffId);
                    }}
                  >
                    {s.staffName}
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
                  <td className="py-2 px-4">{s.department || "-"}</td>
                  <td className="py-2 px-4 font-mono text-xs">{s.licenseNo}</td>
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
                  <td className="py-2 px-4 text-xs">{s.phone || "-"}</td>
                  <td className="py-2 px-4 text-gray-500 text-xs">
                    {formatDateTime(s.createdAt)}
                  </td>
                  <td className="py-2 px-4 text-center whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        setEditingStaff(s);
                        setViewMode("edit");
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition duration-150 ease-in-out"
                    >
                      <FaEdit className="w-5 h-5" />{" "}
                    </button>
                    <button
                      onClick={() => confirmDelete(s)}
                      className="text-red-600 hover:text-red-800 text-xs font-bold transition-colors"
                    >
                      <FaTrashAlt className="w-5 h-5" />{" "}
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
      </main>

      {/* 삭제 확인 모달 렌더링 (ConfirmModal 컴포넌트가 존재한다고 가정) */}
      {/* {deletingStaff && (
                <ConfirmModal
                    message={`'${deletingStaff.staffName}' 의료진 정보를 정말로 삭제하시겠습니까?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingStaff(null)}
                />
            )}
            */}
      {/* 임시 alert/confirm 대체 (ConfirmModal이 없는 경우를 대비) */}
      {deletingStaff && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <p className="text-lg font-semibold mb-4">삭제 확인</p>
            <p className="mb-6">
              '{deletingStaff.staffName}' 의료진 정보를 정말로 삭제하시겠습니까?
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
