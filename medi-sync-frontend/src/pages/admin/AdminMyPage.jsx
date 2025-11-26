import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Camera,
  XCircle,
  User,
  Settings,
  Lock,
  Calendar,
  BarChart,
  ChevronDown,
} from "lucide-react";
import AdminHeader from "../../component/AdminHeader";

const API_URL = "http://localhost:8080/api/admins/mypage";
const BASE_URL = "http://localhost:8080";
const UPLOAD_API_URL = "http://localhost:8080/api/uploads/profile";
const DEPT_API_URL = "http://localhost:8080/api/departments";

const POSITION_OPTIONS = [
  { value: "NURSE", label: "간호사" },
  { value: "RADIOLOGIST", label: "방사선사" },
  { value: "LAB_TECH", label: "임상병리사" },
  { value: "ASSISTANT", label: "진료보조" },
  { value: "ADMIN", label: "원무/행정" },
  { value: "DOCTOR", label: "의사" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직 중" },
  { value: "LEAVE", label: "휴직" },
  { value: "RETIRED", label: "퇴사" },
];

const getOptionLabel = (options, value) => {
  const option = options.find((opt) => String(opt.value) === String(value));
  return option ? option.label : value;
};

// 사이드바 메뉴 버튼
const MenuButton = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors duration-200
                ${
                  isActive
                    ? "bg-blue-500 text-white font-semibold shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="text-sm">{label}</span>
    </button>
  );
};

// 비밀번호 변경 모달
const PasswordChangeModal = ({ isOpen, onClose, adminId }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ADMIN_API_URL = "http://localhost:8080/api/admins";

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

    if (newPassword.length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(`${ADMIN_API_URL}/${adminId}/password`, {
        password: newPassword,
      });

      if (response.status === 200 || response.status === 204) {
        alert("✅ 비밀번호가 성공적으로 변경되었습니다.");
        handleClose();
      } else {
        throw new Error(
          response.data?.message || "비밀번호 변경에 실패했습니다."
        );
      }
    } catch (err) {
      console.error("비밀번호 변경 오류:", err);
      const errorMessage =
        err.response?.data?.message || "❌ 서버 오류: 다시 시도해 주세요.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
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
              onClick={handleClose}
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

const ProfileManagement = ({
  isEditing,
  formData,
  handleChange,
  handleSave,
  handleCancel,
  uploading,
  previewUrl,
  handleFileChange,
  selectedFile,
  setSelectedFile,
  setPreviewUrl,
  departmentOptions,
  isDeptLoading,
}) => {
  // 입력 필드 렌더링 헬퍼 함수
  const renderInput = (field) => {
    const fieldName = field.name === "deptName" ? "deptId" : field.name;
    const value = formData[fieldName] ?? "";

    // 조회 모드 및 수정 불가 필드 처리
    if (field.readonly || !isEditing) {
      let displayVal = value;

      if (field.name === "position")
        displayVal = getOptionLabel(POSITION_OPTIONS, value);
      if (field.name === "status")
        displayVal = getOptionLabel(STATUS_OPTIONS, value);
      if (field.name === "hiredDate" && value)
        displayVal = new Date(value).toLocaleDateString();
      if (field.name === "createdAt" && value)
        displayVal = new Date(value).toLocaleString();

      if (field.name === "deptName") {
        const idValue = formData.deptId
          ? String(formData.deptId)
          : formData.deptName
          ? null
          : value;
        const dept = departmentOptions.find((opt) => opt.value === idValue);
        displayVal = dept ? dept.label : formData.deptName || "-";
      }

      return (
        <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-700 block min-h-[42px] flex items-center">
          {displayVal || "-"}
        </span>
      );
    }

    // 부서명(deptName) 필드를 부서 ID(deptId)로 변환
    if (field.name === "deptName" && isEditing) {
      const selectValue = formData.deptId ? String(formData.deptId) : "";

      return (
        <div className="relative">
          <select
            name="deptId"
            value={selectValue}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white h-[42px] pr-8"
            disabled={isDeptLoading}
          >
            <option value="" disabled>
              {isDeptLoading ? "로딩 중..." : "부서 선택"}
            </option>
            {departmentOptions
              .filter((opt) => opt.value !== "")
              .map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    // Select Box (직책, 상태)
    if (field.type === "select") {
      return (
        <div className="relative">
          <select
            name={field.name}
            value={value}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white h-[42px] pr-8"
          >
            <option value="" disabled>
              선택
            </option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    // 일반 Input (편집 모드)
    return (
      <input
        type={field.type || "text"}
        name={field.name}
        value={value}
        onChange={handleChange}
        className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[42px]"
        readOnly={field.readonly}
      />
    );
  };

  const adminFields = [
    { label: "직원 ID", name: "adminId", readonly: true },
    { label: "사번", name: "empId", readonly: true },
    { label: "이름", name: "name", readonly: !isEditing },
    { label: "휴대폰", name: "phone", readonly: !isEditing, type: "tel" },
    { label: "이메일", name: "email", readonly: !isEditing, type: "email" },
    { label: "면허번호", name: "licenseNo", readonly: true },
  ];

  const optionFields = [
    {
      label: "직책",
      name: "position",
      readonly: !isEditing,
      type: "select",
      options: POSITION_OPTIONS,
    },
    { label: "부서명", name: "deptName", readonly: !isEditing },
    {
      label: "상태",
      name: "status",
      readonly: !isEditing,
      type: "select",
      options: STATUS_OPTIONS,
    },
    { label: "입사일", name: "hiredDate", readonly: true },
    { label: "생성일", name: "createdAt", readonly: true },
  ];

  return (
    <>
      {/* 개인 정보 섹션 */}
      <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
              <User className="w-5 h-5" />
            </span>
            개인 정보 관리
          </h2>

          {/* 액션 버튼 그룹 */}
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={uploading}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow font-medium"
              >
                {uploading ? "업로드 중..." : "저장"}
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 shadow font-medium"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={handleChange}
              className="px-5 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 shadow font-medium hidden"
            >
              정보 수정
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => handleCancel()}
              className="px-5 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 shadow font-medium"
            >
              정보 수정
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 프로필 이미지 영역 */}
          <div className="flex flex-col items-center md:col-span-1 space-y-4 md:justify-center">
            <div className="relative w-40 h-40">
              <img
                src={
                  previewUrl
                    ? previewUrl
                    : formData.profileImgUrl
                    ? `${BASE_URL}${formData.profileImgUrl}`
                    : "/no_image.png"
                }
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-md"
                alt="프로필 이미지"
                onError={(e) => (e.target.src = "/no_image.png")}
              />

              {isEditing && (
                <>
                  <input
                    id="profile-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    onClick={(e) => {
                      e.target.value = null;
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("profile-file-input").click()
                    }
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                    title="프로필 이미지 변경"
                  >
                    <Camera className="w-5 h-5" />
                  </button>

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
          </div>

          {/* 주요 정보 필드 */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {adminFields.map((field) => (
              <div key={field.name} className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-600">
                  {field.label}
                </label>
                {renderInput(field)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 근무 정보 섹션 */}
      <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
          <span className="bg-green-100 p-2 rounded-full mr-3 text-green-600">
            <Settings className="w-5 h-5" />
          </span>
          근무 및 시스템 옵션
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {optionFields.map((field) => (
            <div key={field.name} className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-600">
                {field.label}
              </label>
              {renderInput(field)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const MySchedule = () => (
  <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
      <span className="bg-yellow-100 p-2 rounded-full mr-3 text-yellow-600">
        <Calendar className="w-5 h-5" />
      </span>
      나의 주간 일정 / 당직표
    </h2>
    <div className="text-gray-600 h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
      <p className="text-lg italic">
        나의 주간/월간 스케줄 데이터가 여기에 표시됩니다.
      </p>
    </div>
  </div>
);

const MyStatistics = () => (
  <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
      <span className="bg-red-100 p-2 rounded-full mr-3 text-red-600">
        <BarChart className="w-5 h-5" />
      </span>
      나의 진료 통계
    </h2>
    <div className="text-gray-600 h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
      <p className="text-lg italic">
        월별 환자 수, 진료 시간, 수술 건수 등 개인 통계 차트가 표시됩니다.
      </p>
    </div>
  </div>
);

// ---------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------

const AdminMyPage = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [viewMode, setViewMode] = useState("profile");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isDeptLoading, setIsDeptLoading] = useState(true);

  // 관리자 데이터 로딩
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      const storedData = localStorage.getItem("admin_data");

      let data = null;

      if (storedData) {
        data = JSON.parse(storedData);
      } else {
        try {
          const response = await axios.get(API_URL);
          data = response.data;
          localStorage.setItem("admin_data", JSON.stringify(data));
        } catch (error) {
          console.error("데이터 로드 오류:", error);
        }
      }

      setAdmin(data);
      setFormData(data || {});
      setLoading(false);
    };

    fetchAdminData();
  }, []);

  // 부서 데이터 로딩
  useEffect(() => {
    let mounted = true;
    const loadDepartments = async () => {
      try {
        const res = await axios.get(DEPT_API_URL);
        if (!mounted) return;
        const opts = Array.isArray(res.data)
          ? res.data.map((d) => ({
              value: String(d.deptId),
              label: String(d.deptName),
              name: String(d.deptName),
            }))
          : [];
        setDepartmentOptions([
          { value: "", label: "부서 선택", disabled: true },
          ...opts,
        ]);
      } catch (err) {
        console.warn("부서 로드 실패:", err);
        setDepartmentOptions([]);
      } finally {
        setIsDeptLoading(false);
      }
    };
    loadDepartments();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 이미지 파일 선택
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 프로필 이미지 업로드
  const uploadProfileImage = async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await axios.post(UPLOAD_API_URL, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  // 이미지 및 정보 저장
  const handleSave = async () => {
    if (uploading) return;
    setUploading(true);

    try {
      let finalFormData = { ...formData };

      // 1. 선택된 파일이 있다면 업로드 먼저 수행
      if (selectedFile) {
        const uploadedUrl = await uploadProfileImage(selectedFile);
        finalFormData.profileImgUrl = uploadedUrl;
      }

      // 2. 부서명 처리
      if (finalFormData.deptId) {
        const dept = departmentOptions.find(
          (d) => d.value === String(finalFormData.deptId)
        );
        if (dept) finalFormData.deptName = dept.label;
      } else {
        delete finalFormData.deptId;
      }

      // 3. 최종 정보 DB 업데이트
      const res = await axios.put(API_URL, finalFormData);

      setAdmin(res.data);
      setFormData(res.data);
      setIsEditing(false);

      // 상태 초기화
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      alert("✅ 정보가 수정되었습니다.");
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData(admin || {});
    setIsEditing(false);
    // 취소 시 이미지 미리보기 초기화
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  if (loading) return <div className="pt-24 text-center">로딩 중...</div>;
  if (!admin) return <div className="pt-24 text-center">정보 없음</div>;

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />

      <main className="max-w-7xl mx-auto pt-24 px-8 pb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 border-b pb-4">
          마이페이지
          <span className="text-gray-500 text-2xl font-semibold ml-3">
            (ID: {admin?.adminId || "N/A"})
          </span>
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* 사이드 메뉴 */}
          <aside className="w-full md:w-1/4 bg-white p-6 shadow-xl rounded-xl h-fit sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              개인 업무 관리
            </h3>
            <nav className="space-y-2">
              <MenuButton
                icon={User}
                label="개인 정보 수정"
                isActive={viewMode === "profile"}
                onClick={() => {
                  setViewMode("profile");
                  setIsEditing(false);
                }}
              />
              <MenuButton
                icon={Calendar}
                label="나의 일정 관리"
                isActive={viewMode === "schedule"}
                onClick={() => setViewMode("schedule")}
              />
              <MenuButton
                icon={BarChart}
                label="나의 진료 통계"
                isActive={viewMode === "stats"}
                onClick={() => setViewMode("stats")}
              />
              <div className="border-t pt-2 mt-2">
                <MenuButton
                  icon={Lock}
                  label="비밀번호 변경"
                  isActive={false}
                  onClick={() => setIsPasswordModalOpen(true)}
                />
              </div>
            </nav>
          </aside>

          {/* 컨텐츠 영역 */}
          <section className="w-full md:w-3/4">
            {viewMode === "profile" && (
              <div className="relative">
                <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100 mb-8">
                  <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                        <User className="w-5 h-5" />
                      </span>
                      개인 정보 관리
                    </h2>
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSave}
                          disabled={uploading}
                          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow font-medium"
                        >
                          {uploading ? "업로드 중..." : "저장"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-5 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 shadow font-medium"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 shadow font-medium"
                      >
                        정보 수정
                      </button>
                    )}
                  </div>
                  <ProfileManagementContent
                    isEditing={isEditing}
                    formData={formData}
                    handleChange={handleChange}
                    handleFileChange={handleFileChange}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                    departmentOptions={departmentOptions}
                    isDeptLoading={isDeptLoading}
                  />
                </div>
                {/* 근무 정보 섹션도 ProfileManagementContent 내부에 있거나 분리 필요.
                    위의 ProfileManagement가 두 섹션(개인정보, 근무정보)을 모두 포함하므로,
                    ProfileManagement 전체를 렌더링하되, "헤더/버튼" 제어권만 상위로 가져오는게 베스트.
                    아래에 새로 정의한 ProfileManagementContent를 사용합니다.
                */}
              </div>
            )}
            {viewMode === "schedule" && <MySchedule />}
            {viewMode === "stats" && <MyStatistics />}
          </section>
        </div>
      </main>

      {/* 비밀번호 변경 모달 */}
      {admin && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          adminId={admin.adminId}
        />
      )}
    </div>
  );
};

const ProfileManagementContent = ({
  isEditing,
  formData,
  handleChange,
  handleFileChange,
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  departmentOptions,
  isDeptLoading,
}) => {
  // 입력 렌더링 함수 (재사용)
  const renderInput = (field) => {
    const fieldName = field.name === "deptName" ? "deptId" : field.name;
    const value = formData[fieldName] ?? "";

    if (field.readonly || !isEditing) {
      let displayVal = value;
      if (field.name === "position")
        displayVal = getOptionLabel(POSITION_OPTIONS, value);
      if (field.name === "status")
        displayVal = getOptionLabel(STATUS_OPTIONS, value);
      if (field.name === "hiredDate" && value)
        displayVal = new Date(value).toLocaleDateString();
      if (field.name === "createdAt" && value)
        displayVal = new Date(value).toLocaleString();

      if (field.name === "deptName") {
        const idValue = formData.deptId
          ? String(formData.deptId)
          : formData.deptName
          ? null
          : value;
        const dept = departmentOptions.find((opt) => opt.value === idValue);
        displayVal = dept ? dept.label : formData.deptName || "-";
      }

      return (
        <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-700 block min-h-[42px] flex items-center">
          {displayVal || "-"}
        </span>
      );
    }

    if (field.name === "deptName" && isEditing) {
      const selectValue = formData.deptId ? String(formData.deptId) : "";
      return (
        <div className="relative">
          <select
            name="deptId"
            value={selectValue}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white h-[42px] pr-8"
            disabled={isDeptLoading}
          >
            <option value="" disabled>
              {isDeptLoading ? "로딩 중..." : "부서 선택"}
            </option>
            {departmentOptions
              .filter((opt) => opt.value !== "")
              .map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div className="relative">
          <select
            name={field.name}
            value={value}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white h-[42px] pr-8"
          >
            <option value="" disabled>
              선택
            </option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    return (
      <input
        type={field.type || "text"}
        name={field.name}
        value={value}
        onChange={handleChange}
        className="p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[42px]"
        readOnly={field.readonly}
      />
    );
  };

  const adminFields = [
    { label: "직원 ID", name: "adminId", readonly: true },
    { label: "사번", name: "empId", readonly: true },
    { label: "이름", name: "name", readonly: !isEditing },
    { label: "휴대폰", name: "phone", readonly: !isEditing, type: "tel" },
    { label: "이메일", name: "email", readonly: !isEditing, type: "email" },
    { label: "면허번호", name: "licenseNo", readonly: true },
  ];

  const optionFields = [
    {
      label: "직책",
      name: "position",
      readonly: !isEditing,
      type: "select",
      options: POSITION_OPTIONS,
    },
    { label: "부서명", name: "deptName", readonly: !isEditing },
    {
      label: "상태",
      name: "status",
      readonly: !isEditing,
      type: "select",
      options: STATUS_OPTIONS,
    },
    { label: "입사일", name: "hiredDate", readonly: true },
    { label: "생성일", name: "createdAt", readonly: true },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center md:col-span-1 space-y-4 md:justify-center">
          <div className="relative w-40 h-40">
            <img
              src={
                previewUrl
                  ? previewUrl
                  : formData.profileImgUrl
                  ? `${BASE_URL}${formData.profileImgUrl}`
                  : "/no_image.png"
              }
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-md"
              alt="프로필 이미지"
              onError={(e) => (e.target.src = "/no_image.png")}
            />
            {isEditing && (
              <>
                <input
                  id="profile-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  onClick={(e) => {
                    e.target.value = null;
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("profile-file-input").click()
                  }
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  title="프로필 이미지 변경"
                >
                  <Camera className="w-5 h-5" />
                </button>
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
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {adminFields.map((field) => (
            <div key={field.name} className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-600">
                {field.label}
              </label>
              {renderInput(field)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-white p-8 shadow-lg rounded-xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
          <span className="bg-green-100 p-2 rounded-full mr-3 text-green-600">
            <Settings className="w-5 h-5" />
          </span>
          근무 및 시스템 옵션
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {optionFields.map((field) => (
            <div key={field.name} className="flex flex-col space-y-1">
              <label className="text-sm font-semibold text-gray-600">
                {field.label}
              </label>
              {renderInput(field)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminMyPage;
