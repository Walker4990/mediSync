import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import AdminHeader from "../../component/AdminHeader";
import ConfirmModal from "../admin/ConfirmModal";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";

// API 기본 URL
const API_BASE_URL = "http://192.168.0.24:8080/api/doctors";

// API 연결 실패 시 사용할 모의 데이터 (Mock Data)
const MOCK_DOCTORS = [
  {
    doctorId: 1,
    name: "김현우",
    department: "내과",
    licenseNo: "M2023-001",
    phone: "010-2345-1111",
    createdAt: "2025-10-22T12:20:40",
  },
  {
    doctorId: 2,
    name: "이서연",
    department: "정형외과",
    licenseNo: "M2022-112",
    phone: "010-8475-2288",
    createdAt: "2025-10-22T12:20:40",
  },
  {
    doctorId: 3,
    name: "박지훈",
    department: "소아청소년과",
    licenseNo: "M2021-092",
    phone: "010-3399-4477",
    createdAt: "2025-10-22T12:20:40",
  },
];

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [apiError, setApiError] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deletingDoctor, setDeletingDoctor] = useState(null);

  const DoctorForm = ({ doctorData, onClose }) => {
    const isEditing = !!doctorData;
    const initialData = doctorData || {
      doctorName: "",
      department: "",
      licenseNo: "",
      phone: "",
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

      try {
        let res;
        if (isEditing) {
          res = await axios.put(API_URL, formData);
          alert(
            res.data.message ||
              `${formData.doctorName} 의사 정보가 수정되었습니다.`
          );
        } else {
          // 등록 시 doctorId는 백엔드에서 자동 생성되므로 폼 데이터에서 제거
          const postData = { ...formData };
          delete postData.doctorId;

          res = await axios.post(API_URL, postData);
          alert(
            res.data.message || `${formData.doctorName} 의사가 등록되었습니다.`
          );
        }
        onClose && onClose(true);
      } catch (err) {
        console.error(
          "저장/수정 실패:",
          err.response ? err.response.data : err.message
        );
        const errorMessage =
          err.response?.data?.message ||
          (isEditing ? "수정 실패" : "등록 실패");
        setError(
          `${errorMessage}: 필수 항목을 확인하거나 중복된 정보(면허번호)가 아닌지 확인해주세요.`
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          {isEditing ? "의사 정보 수정" : "새 의사 등록"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing && (
            <div className="bg-gray-100 p-3 rounded-md text-sm">
              <label className="block text-gray-600">ID / 면허번호</label>
              <p className="font-semibold text-gray-800">
                {doctorData.doctorId} / {doctorData.licenseNo}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="doctorName"
              className="block text-sm font-medium text-gray-700"
            >
              이름 *
            </label>
            <input
              type="text"
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700"
            >
              진료과명
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 등록 시에만 면허번호 입력 가능, 수정 시에는 변경 불가 */}
          {!isEditing && (
            <div>
              <label
                htmlFor="licenseNo"
                className="block text-sm font-medium text-gray-700"
              >
                면허번호 *
              </label>
              <input
                type="text"
                id="licenseNo"
                name="licenseNo"
                value={formData.licenseNo}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-3 pt-4">
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
              className={`px-4 py-2 text-white rounded-md shadow-sm transition-colors ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
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

  // 초기 데이터 불러오기
  useEffect(() => {
    fetchDoctors();
  }, []);

  // API 호출: 의사 목록 조회 (GET)
  const fetchDoctors = async () => {
    setApiError(false);
    try {
      const res = await axios.get(API_BASE_URL);
      setDoctors(res.data);
    } catch (err) {
      console.error("의사 조회 실패:", err);
      if (axios.isAxiosError(err) && !err.response) {
        console.warn("API 연결에 실패했습니다. 모의 데이터를 로드합니다.");
        setApiError(true);
        setDoctors(MOCK_DOCTORS);
      } else {
        setApiError(true);
      }
    }
  };

  // 날짜 포맷 함수
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    try {
      const isoDateString = dateString.includes("T")
        ? dateString
        : dateString.replace(" ", "T");
      return format(new Date(isoDateString), "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      return dateString;
    }
  };

  // 폼 닫기 핸들러 (isRefreshed가 true면 목록 새로고침)
  const handleCloseForm = (isRefreshed = false) => {
    setViewMode("list");
    setEditingDoctor(null);
    if (isRefreshed) {
      fetchDoctors();
    }
  };

  // 삭제 확인 모달 열기
  const confirmDelete = (doctor) => {
    setDeletingDoctor(doctor);
  };

  // 최종 삭제 실행
  const handleDelete = async () => {
    if (!deletingDoctor) return;

    try {
      if (!apiError) {
        const res = await axios.delete(
          `${API_BASE_URL}/${deletingDoctor.doctorId}`
        );
        alert(
          res.data.message ||
            `${deletingDoctor.doctorName} 의사 정보가 삭제되었습니다.`
        );
        fetchDoctors();
      } else {
        // 모의 데이터 삭제
        setDoctors((prevDoctors) =>
          prevDoctors.filter((d) => d.doctorId !== deletingDoctor.doctorId)
        );
        alert(
          `(모의) ${deletingDoctor.doctorName} 의사 정보가 삭제되었습니다.`
        );
      }
    } catch (err) {
      console.error(
        "삭제 실패:",
        err.response ? err.response.data : err.message
      );
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    } finally {
      setDeletingDoctor(null); // 모달 닫기
    }
  };

  // 검색 필터링
  const filtered = doctors.filter(
    (d) =>
      (d.doctorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.phone || "").includes(search) ||
      (d.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.licenseNo || "").toLowerCase().includes(search.toLowerCase())
  );

  // 뷰 모드에 따라 렌더링할 내용 상이
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-8 z-50">
        <DoctorForm doctorData={editingDoctor} onClose={handleCloseForm} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />

      {/* 컨텐츠 영역 */}
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          의사 정보 목록
          <span className="font-normal text-xl ml-2">
            (총 {doctors.length}명)
          </span>
        </h1>

        {/* API 연결 오류 경고 메시지 */}
        {apiError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 shadow-md"
            role="alert"
          >
            <strong className="font-bold">API 연결 오류 발생:</strong>
            <span className="block sm:inline">
              {" "}
              백엔드 서버(`{API_BASE_URL}`)에 연결할 수 없어 모의 데이터(Mock
              Data)를 표시합니다.
            </span>
          </div>
        )}

        {/* 검색창 + 버튼 그룹 */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-1/3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 전화번호, 진료과 검색"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="space-x-3">
            <button
              onClick={() => {
                setViewMode("add");
                setEditingDoctor(null);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-md"
            >
              + 의사 추가
            </button>
            <button
              onClick={fetchDoctors}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
            >
              새로고침
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md text-sm">
            <thead className="bg-gray-100 text-gray-800 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">이름</th>
                <th className="py-3 px-4 text-left">진료과명</th>
                <th className="py-3 px-4 text-left">면허번호</th>
                <th className="py-3 px-4 text-left">연락처</th>
                <th className="py-3 px-4 text-left">등록일</th>
                <th className="py-3 px-4 text-center">관리</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.doctorId}
                  className="border-b hover:bg-gray-50 text-gray-700"
                >
                  <td className="py-2 px-4">{d.doctorId}</td>
                  <td className="py-2 px-4 font-medium">{d.doctorName}</td>
                  <td className="py-2 px-4">{d.department}</td>
                  <td className="py-2 px-4">{d.licenseNo}</td>
                  <td className="py-2 px-4">{d.phone}</td>
                  <td className="py-2 px-4 text-gray-500 text-xs">
                    {formatDateTime(d.createdAt)}
                  </td>
                  <td className="py-2 px-4 text-center whitespace-nowrap space-x-2">
                    {/* 수정 버튼 (Edit Icon) */}
                    <button
                      onClick={() => {
                        setEditingDoctor(d);
                        setViewMode("edit");
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition duration-150 ease-in-out"
                      title="수정"
                    >
                      <FaEdit className="w-5 h-5" />{" "}
                    </button>
                    {/* 삭제 버튼 (Delete Icon) */}
                    <button
                      onClick={() => confirmDelete(d)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md transition duration-150 ease-in-out"
                      title="삭제"
                    >
                      <FaTrashAlt className="w-5 h-5" />{" "}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500 italic"
                  >
                    등록된 의사 정보가 없거나 검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 삭제 확인 모달 렌더링 */}
      {deletingDoctor && (
        <ConfirmModal
          message={`'${deletingDoctor.doctorName}' 의사 정보를 정말로 삭제하시겠습니까?`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingDoctor(null)}
        />
      )}
    </div>
  );
}
