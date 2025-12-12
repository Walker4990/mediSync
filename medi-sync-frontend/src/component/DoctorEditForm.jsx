import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ChevronDown, Loader2 } from "lucide-react";

// API 기본 URL
const API_BASE_URL = "http://192.168.0.24:8080/api/admins/doctors";
const DEPT_API_URL = "http://192.168.0.24:8080/api/departments";

// 재직 상태(Status) 옵션
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직 중" },
  { value: "LEAVE", label: "휴직" },
  { value: "RETIRED", label: "퇴사" },
];

const DoctorEditForm = ({ adminData, onClose, onShowMessage }) => {
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
  }, [onShowMessage]);

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

export default DoctorEditForm;
