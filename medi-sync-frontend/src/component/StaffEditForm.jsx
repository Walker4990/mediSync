import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Loader2 } from "lucide-react"; // 로딩 아이콘 추가

// API 기본 URL
const API_BASE_URL = "http://localhost:8080/api/admins/staffs";
const DEPT_API_URL = "http://localhost:8080/api/departments";

// 직무(Position) 옵션
export const POSITION_OPTIONS = [
  { value: "NURSE", label: "간호사" },
  { value: "RADIOLOGIST", label: "방사선사" },
  { value: "LAB_TECH", label: "임상병리사" },
  { value: "ASSISTANT", label: "진료보조" },
  { value: "ADMIN", label: "원무/행정" },
];

// 재직 상태(Status) 옵션
export const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직 중" },
  { value: "LEAVE", label: "휴직" },
  { value: "RETIRED", label: "퇴사" },
];

const StaffEditForm = ({ staffData, onClose }) => {
  const isEditing = !!staffData;
  const today = format(new Date(), "yyyy-MM-dd");

  const initialData = staffData || {
    name: "",
    department: "",
    position: POSITION_OPTIONS[0].value,
    licenseNo: "",
    phone: "",
    status: STATUS_OPTIONS[0].value,
    hiredDate: today,
  };

  const [formData, setFormData] = useState(initialData);
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
    if (!formData.name || !formData.position) {
      setError("필수 항목(이름, 직무)을 모두 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      let res;
      const dataToSend = { ...formData };
      delete dataToSend.deptName; // 서버 전송 시 제외

      if (isEditing) {
        // 수정: PUT
        res = await axios.put(
          `${API_BASE_URL}/${dataToSend.adminId}`,
          dataToSend
        );
        console.log("수정 성공:", res.data);
      } else {
        // 등록: POST
        const postData = { ...formData };
        delete postData.adminId;
        res = await axios.post(API_BASE_URL, postData);
        console.log("등록 성공:", res.data);
      }

      alert(
        res.data.message ||
          `${formData.name} 의료진 정보가 ${
            isEditing ? "수정" : "등록"
          }되었습니다.`
      );

      onClose && onClose(true); // 성공 시 목록 새로고침 트리거
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

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await axios.get(DEPT_API_URL);
        setDeptList(res.data);
      } catch (err) {
        console.error("부서 목록 로드 실패:", err);
      }
    };
    loadDepartments();
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600 border-b pb-2">
        {isEditing ? "의료진 정보 수정" : "새 의료진 등록"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing && (
          <div className="bg-indigo-50 p-3 rounded-md text-sm border border-indigo-200">
            <label className="block text-indigo-600 font-semibold">
              ID / 사번
            </label>
            <p className="font-bold text-gray-800">
              {staffData.adminId} / {staffData.empId}
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

        {/* 직무 유형 (Position) */}
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

        {/* 진료과명 / 소속 */}
        <div>
          <label
            htmlFor="deptId"
            className="block text-sm font-medium text-gray-700"
          >
            소속 진료과 (또는 부서)
          </label>
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

        {/* 면허번호 (등록 시에만 입력 가능) */}
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

        {/* 재직 상태 (Status) */}
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
            className={`px-4 py-2 text-white rounded-md shadow-md transition-colors flex items-center justify-center ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 처리 중...
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

export default StaffEditForm;
