import React, { useState, useEffect } from "react";
import axios from "axios";
import { Camera, XCircle } from "lucide-react";

// 직책(Position) 옵션
const POSITION_OPTIONS = [
  { value: "NURSE", label: "간호사" },
  { value: "RADIOLOGIST", label: "방사선사" },
  { value: "LAB_TECH", label: "임상병리사" },
  { value: "ASSISTANT", label: "진료보조" },
  { value: "ADMIN", label: "원무/행정" },
  { value: "DOCTOR", label: "의사" },
];

// 재직 상태(Status) 옵션
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직 중" },
  { value: "LEAVE", label: "휴직" },
  { value: "RETIRED", label: "퇴사" },
];

// 옵션 배열에서 value에 해당하는 label을 찾아주는 헬퍼 함수
const getOptionLabel = (options, value) => {
  const option = options.find((opt) => String(opt.value) === String(value));
  return option ? option.label : value;
};

// --- [비밀번호 변경 모달 컴포넌트] ---
const PasswordChangeModal = ({ isOpen, onClose, adminId }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = "http://localhost:8080/api/admins";

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("비밀번호와 확인 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("입력한 두 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 백엔드 비밀번호 변경 API 호출 (PUT /api/admins/{adminId}/password) 가정
      const response = await axios.put(`${API_URL}/${adminId}/password`, {
        password: newPassword, // 새 비밀번호
      });

      if (response.status === 200 || response.status === 204) {
        alert("✅ 비밀번호가 성공적으로 변경되었습니다.");
        onClose();
      } else {
        throw new Error(
          response.data?.message || "비밀번호 변경에 실패했습니다."
        );
      }
    } catch (err) {
      console.error("비밀번호 변경 오류:", err);
      setError("❌ 서버 오류: 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
          비밀번호 변경 (ID: {adminId})
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-md transition ${
                isSubmitting
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "변경 중..." : "비밀번호 변경"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDetail = ({ adminId, onBackToList }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [departmentOptions, setDepartmentOptions] = useState([
    { value: "", label: "부서 목록 로딩 중...", disabled: true },
  ]);
  const [isDeptLoading, setIsDeptLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const API_URL = "http://localhost:8080/api/admins";
  const BASE_URL = "http://localhost:8080";
  const DEPT_API_URL = "http://localhost:8080/api/departments";
  const UPLOAD_API_URL = "http://localhost:8080/api/uploads/profile";

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/${adminId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setAdmin(null);
            setFormData({});
            return;
          }
          throw new Error("데이터를 불러오는 데 실패했습니다.");
        }
        const data = await response.json();
        setAdmin(data);
        setFormData(data || {});
      } catch (error) {
        console.error("데이터 로드 오류:", error);
        setAdmin(null);
        setFormData({});
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [adminId, API_URL]);

  // 부서 정보
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get(DEPT_API_URL);
        if (!mounted) return;
        const opts = Array.isArray(res.data)
          ? res.data.map((d) => ({
              value: String(d.deptId),
              label: String(d.deptName),
            }))
          : [];
        setDepartmentOptions([
          { value: "", label: "부서 선택", disabled: true },
          ...opts,
        ]);
      } catch (err) {
        console.warn("부서 로드 실패:", err);
        setDepartmentOptions([
          { value: "", label: "부서 로드 실패", disabled: true },
        ]);
      } finally {
        setIsDeptLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💡 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 기존 미리보기 URL 해제
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 💡 프로필 이미지 업로드 함수
  const uploadProfileImage = async (file) => {
    const form = new FormData();
    form.append("file", file);
    // 서버에 파일 업로드 요청
    const res = await axios.post(UPLOAD_API_URL, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // 서버 응답에서 새 이미지 경로(URL) 반환
    return res.data.url;
  };

  // 💡 저장 핸들러 (이미지 업로드 로직 통합)
  const handleSave = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      let finalFormData = { ...formData };

      if (selectedFile) {
        const form = new FormData();
        form.append("file", selectedFile);
        const uploadRes = await axios.post(UPLOAD_API_URL, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalFormData.profileImgUrl = uploadRes.data.url;
      }

      const res = await axios.put(`${API_URL}/${adminId}`, finalFormData);
      setAdmin(res.data);
      setFormData(res.data);
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      alert("저장 완료");
    } catch (err) {
      alert("저장 실패");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData(admin || {});
    setIsEditing(false);
  };

  // 헬퍼 함수: 필드 값을 가져오고, 없으면 '-' 반환 (조회 모드용)
  const displayValue = (fieldName, options = []) => {
    const value = formData[fieldName];
    if (value === undefined || value === null || value === "") {
      return "-";
    }
    if (options.length > 0) {
      return getOptionLabel(options, value);
    }
    return value;
  };

  // 로딩 및 데이터 없음 처리
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-500 text-lg font-medium">
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-500 p-8 bg-white shadow-lg rounded-lg border border-gray-100 mt-8">
        <svg
          className="w-12 h-12 mb-3 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
        <p className="text-xl font-semibold">
          직원 ID: {adminId}에 대한 상세 정보를 찾을 수 없습니다.
        </p>
        <p className="text-sm mt-2">
          DB 연결 상태 또는 해당 ID의 존재 여부를 확인해주세요.
        </p>
        {onBackToList && (
          <button
            onClick={onBackToList}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
          >
            목록으로 돌아가기
          </button>
        )}
      </div>
    );
  }

  // 필드 정의
  const adminFields = [
    { label: "직원 ID", name: "adminId", readonly: true },
    { label: "사번", name: "empId", readonly: !isEditing },
    { label: "이름", name: "name", readonly: !isEditing },
    { label: "휴대폰 번호", name: "phone", readonly: !isEditing, type: "tel" },
    { label: "이메일", name: "email", readonly: !isEditing, type: "email" },
    { label: "면허 번호", name: "licenseNo", readonly: !isEditing },
  ];

  const optionFields = [
    {
      label: "직책",
      name: "position",
      readonly: !isEditing,
      type: "select",
      options: POSITION_OPTIONS,
    },
    {
      label: "부서명",
      name: "deptId",
      readonly: !isEditing,
      type: "select",
      options: departmentOptions,
    },
    {
      label: "재직 상태",
      name: "status",
      readonly: !isEditing,
      type: "select",
      options: STATUS_OPTIONS,
    },
    { label: "입사일", name: "hiredDate", readonly: true, type: "date" },
    { label: "계정 생성일", name: "createdAt", readonly: true },
  ];

  // 입력 필드 렌더링
  const renderInput = (field) => {
    // DB에서 불러온 데이터가 null이거나 해당 필드가 null일 경우 "-"로 표시
    const value =
      formData[field.name] === undefined ||
      formData[field.name] === null ||
      formData[field.name] === ""
        ? "-"
        : formData[field.name];

    if (field.readonly && field.name === "createdAt") {
      return (
        <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-600">
          {value !== "-" ? new Date(value).toLocaleString() : "-"}
        </span>
      );
    }
    if (field.readonly && field.name === "hiredDate") {
      return (
        <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-600">
          {value !== "-" ? new Date(value).toLocaleDateString() : "-"}
        </span>
      );
    }

    // 조회 모드일 때
    if (field.readonly && !isEditing) {
      let displayVal = value;
      if (field.name === "position")
        displayVal = getOptionLabel(POSITION_OPTIONS, value);
      if (field.name === "status")
        displayVal = getOptionLabel(STATUS_OPTIONS, value);

      // deptId 일 때 부서명(Label)을 찾아 표시
      if (field.name === "deptId")
        displayVal = getOptionLabel(departmentOptions, value);

      return (
        <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-600">
          {displayVal !== "" ? displayVal : "-"}
        </span>
      );
    }

    // 편집 가능 모드
    if (field.type === "select") {
      const selectValue = formData[field.name] || "";
      return (
        <div className="relative">
          <select
            name={field.name}
            value={selectValue}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none pr-8 bg-white"
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      );
    }

    return (
      <input
        type={field.type || "text"}
        name={field.name}
        value={value === "-" ? "" : value}
        onChange={handleChange}
        className="p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        readOnly={field.readonly}
      />
    );
  };

  // 데이터 조회 성공 시
  return (
    <div className="space-y-5 pb-10">
      <div className="flex justify-left items-center mb-6 px-2 border-b-2 border-blue-200">
        <h1 className="text-4xl font-bold text-blue-600 pb-4 mr-16">
          직원 상세 정보
          <span className="text-gray-500 text-2xl font-semibold">
            (ID: {adminId})
          </span>
        </h1>
        {/* ... (정보 수정 버튼 등) ... */}
        <button
          onClick={onBackToList}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-md flex items-center mr-4"
        >
          🧾 리스트로
        </button>
        {isEditing ? (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-5 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200 shadow-md font-medium"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200 shadow-md font-medium"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200 shadow-md font-medium"
          >
            정보 수정
          </button>
        )}
      </div>

      {/* 1. 개인 정보 섹션 */}
      <div className="bg-white p-6 shadow-xl rounded-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
          👨‍⚕️ 개인 정보
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 프로필 이미지 영역 */}
          <div className="flex flex-col items-center md:col-span-1 space-y-4">
            <div className="relative w-40 h-40">
              <img
                // 💡 미리보기 URL이 있으면 그것을 사용하고, 없으면 기존 이미지 URL 사용
                src={
                  previewUrl
                    ? previewUrl
                    : formData.profileImgUrl
                    ? `${BASE_URL}${formData.profileImgUrl}`
                    : "/no_image.png"
                }
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-md"
              />

              {isEditing && (
                <>
                  {/* 💡 파일 인풋 (hidden) */}
                  <input
                    id="profile-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    onClick={(e) => {
                      e.target.value = null;
                    }} // 같은 파일 재선택 가능하게
                  />

                  {/* 💡 카메라 아이콘 (업로드 버튼) */}
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("profile-file-input")?.click()
                    }
                    className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full
                    hover:bg-blue-600 transition-colors shadow-md"
                    title="프로필 이미지 변경"
                  >
                    <Camera className="w-5 h-5" />
                  </button>

                  {/* 💡 이미지 취소 버튼 (새 이미지 선택했을 때만 표시) */}
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-white/80 text-red-600 rounded-full shadow-lg hover:bg-white"
                      title="새 이미지 취소"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>
            {/* 💡 비밀번호 변경 버튼: isEditing 모드일 때만 표시 */}
            {isEditing && (
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                비밀번호 변경
              </button>
            )}
          </div>

          {/* 주요 정보 필드 */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminFields.map((field) => (
              <div key={field.name} className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  {field.label}
                </label>
                {renderInput(field)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 근무 및 시스템 옵션 섹션 */}
      <div className="bg-white p-6 shadow-xl rounded-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
          ⚙️ 근무 및 시스템 옵션
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {optionFields.map((field) => (
            <div key={field.name} className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-500">
                {field.label}
              </label>
              {renderInput(field)}
            </div>
          ))}
        </div>
      </div>

      {/* 💡 비밀번호 변경 모달 렌더링 (adminId가 있을 때만) */}
      {adminId && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          adminId={adminId}
        />
      )}
    </div>
  );
};

export default AdminDetail;
