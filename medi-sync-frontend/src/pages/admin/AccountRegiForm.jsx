import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminHeader from "../../component/AdminHeader";
import {
  UserPlus,
  Save,
  KeyRound,
  Mail,
  Phone,
  Briefcase,
  Users,
  ChevronDown,
  Building2,
  CalendarDays,
  Award,
  XCircle,
} from "lucide-react";

// API endpoints
const API_URL = "http://localhost:8080/api/admins";
const UPLOAD_API_URL = "http://localhost:8080/api/uploads/profile";
const DEPT_API_URL = "http://localhost:8080/api/departments";
const CHECK_ID_API = "http://localhost:8080/api/admins/check-empid";

// safe converter to avoid rendering objects in JSX
const safe = (v) => (v === null || v === undefined ? "" : v);

// Input component
const InputField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  required = false,
  placeholder = "",
  value,
  onChange,
  disabled,
}) => (
  <div className="flex flex-col space-y-1">
    <label
      htmlFor={name}
      className="text-sm font-medium text-gray-600 flex items-center"
    >
      {Icon && <Icon className="w-4 h-4 mr-2 text-blue-500" />}
      {String(label)} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={safe(value)}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm disabled:bg-gray-100"
      disabled={disabled}
    />
  </div>
);

// Select component (ensures option values/labels are primitives)
const SelectField = ({
  label,
  name,
  icon: Icon,
  required = false,
  value,
  onChange,
  options = [],
  disabled,
}) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-600 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-blue-500" />}
      {String(label)} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value == null ? "" : String(value)}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm bg-white pr-10 appearance-none"
      >
        {options.map((option, idx) => {
          const optValue =
            option && option.value !== undefined ? String(option.value) : "";
          const optLabel =
            option && option.label !== undefined
              ? String(option.label)
              : optValue;
          const disabledOpt = !!(option && option.disabled);
          return (
            <option
              key={`${optValue}-${idx}`}
              value={optValue}
              disabled={disabledOpt}
            >
              {optLabel}
            </option>
          );
        })}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const AccountRegiForm = () => {
  const [formData, setFormData] = useState({
    empId: "",
    password: "",
    name: "",
    phone: "",
    email: "",
    position: "",
    role: "ADMIN",
    profileImgUrl: "",
    deptId: "",
    licenseNo: "",
    hiredDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([
    { value: "", label: "부서 목록 로딩 중...", disabled: true },
  ]);
  const [isDeptLoading, setIsDeptLoading] = useState(true);
  const [idCheckStatus, setIdCheckStatus] = useState(null);
  const [idCheckMessage, setIdCheckMessage] = useState("");

  const positionOptions = [
    { value: "", label: "직무 선택", disabled: true },
    { value: "DOCTOR", label: "의사" },
    { value: "NURSE", label: "간호사" },
    { value: "RADIOLOGIST", label: "방사선사" },
    { value: "LAB_TECH", label: "임상병리사" },
    { value: "ASSISTANT", label: "보조" },
    { value: "ADMIN", label: "시스템 관리자" },
  ];

  // Load departments and coerce to string values
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
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // ✅ 사원 ID 변경 시 중복 체크 상태 초기화
    if (e.target.name === "empId") {
      setIdCheckStatus(null);
      setIdCheckMessage("");
    }
  };

  // ✅ 아이디 중복 체크
  const handleCheckEmpId = async () => {
    if (!formData.empId.trim()) {
      setIdCheckStatus("error");
      setIdCheckMessage("사원 ID를 입력해주세요.");
      return;
    }
    try {
      const res = await axios.get(`${CHECK_ID_API}?empId=${formData.empId}`);
      if (res.data.exists === false) {
        setIdCheckStatus("ok");
        setIdCheckMessage("✅ 사용 가능한 ID 입니다.");
      } else {
        setIdCheckStatus("error");
        setIdCheckMessage("❌ 이미 사용 중인 ID 입니다.");
      }
    } catch {
      setIdCheckStatus("error");
      setIdCheckMessage("❌ 서버 오류: 다시 시도해주세요.");
    }
  };

  // File/select handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("❌ 이미지 파일만 업로드 가능합니다.");
      setMessageType("error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ 파일은 5MB 이하만 업로드 가능합니다.");
      setMessageType("error");
      return;
    }

    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
    setMessageType("");
  };

  const uploadProfileImage = async () => {
    if (!selectedFile) return null;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      const res = await axios.post(UPLOAD_API_URL, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res?.data?.url ? String(res.data.url) : null;
    } catch (err) {
      console.warn("파일 업로드 실패:", err);
      setMessage("❌ 파일 업로드 중 오류가 발생했습니다.");
      setMessageType("error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Submit handler (ID check removed)
  const handleRegister = async (e) => {
    e.preventDefault();

    // ✅ 중복 체크 안했으면 제출 불가
    if (idCheckStatus !== "ok") {
      setMessage("❌ 사원 ID 중복 확인이 필요합니다.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedUrl = formData.profileImgUrl || null;
      if (selectedFile) {
        const url = await uploadProfileImage();
        if (!url) throw new Error("프로필 이미지 업로드 실패");
        uploadedUrl = url;
      }

      const payload = {
        ...formData,
        deptId: formData.deptId ? Number(formData.deptId) : null,
        profileImgUrl: uploadedUrl,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "서버 응답 오류");
      }

      setMessage("✅ 새 계정이 성공적으로 등록되었습니다!");
      setMessageType("success");

      // reset form
      setFormData({
        empId: "",
        password: "",
        name: "",
        phone: "",
        email: "",
        position: "",
        role: "ADMIN",
        profileImgUrl: "",
        deptId: "",
        licenseNo: "",
        hiredDate: "",
      });
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (err) {
      console.warn("등록 실패:", err);
      setMessage(
        "❌ 등록 실패: " + (err && err.message ? err.message : String(err))
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || uploading || isDeptLoading;

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />
      <main className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-xl p-6 sm:p-8 border border-gray-200">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-6 flex items-center border-b pb-4">
            <UserPlus className="w-7 h-7 mr-3 text-blue-600" /> 새 계정 등록
          </h1>

          {/* global message */}
          {message && (
            <div
              className={`p-4 mb-6 rounded-lg ${
                messageType === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : messageType === "error"
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-blue-100 text-blue-700 border border-blue-300"
              }`}
            >
              {String(message)}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* left: core fields */}
              {/* ✅ 사원 ID + 중복확인 버튼 */}
              <section className="space-y-4">
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-blue-500" /> 사원 ID{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <div className="flex gap-3">
                  <input
                    name="empId"
                    value={formData.empId}
                    onChange={handleChange}
                    required
                    placeholder="사원 ID 입력"
                    className="flex-grow px-4 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleCheckEmpId}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-900"
                  >
                    중복 확인
                  </button>
                </div>

                {idCheckMessage && (
                  <p
                    className={`text-sm ${
                      idCheckStatus === "ok" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {idCheckMessage}
                  </p>
                )}

                <InputField
                  label="비밀번호"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  icon={KeyRound}
                  placeholder="필수 입력"
                />

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="직무 (Position)"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    options={positionOptions}
                    required
                    icon={Users}
                  />
                  <InputField
                    label="이름"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    icon={UserPlus}
                    placeholder="필수 입력"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="연락처 (Phone)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    icon={Phone}
                    placeholder="선택 사항"
                  />
                  <InputField
                    label="이메일 (Email)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={Mail}
                    placeholder="선택 사항"
                  />
                </div>

                <InputField
                  label="면허 번호 (License No)"
                  name="licenseNo"
                  value={formData.licenseNo}
                  onChange={handleChange}
                  icon={Award}
                  placeholder="면허 번호 (의료진/의사만 해당) - 선택 사항"
                />
              </section>

              {/* right: extra info & image */}
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-700 border-l-4 border-blue-500 pl-3 mb-4">
                  추가 정보 및 이미지
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label={
                      isDeptLoading ? "부서 (로딩 중...)" : "부서 (Department)"
                    }
                    name="deptId"
                    value={formData.deptId}
                    onChange={handleChange}
                    options={departmentOptions}
                    icon={Building2}
                    disabled={isDeptLoading}
                    required
                  />
                  <InputField
                    label="입사일 (Hired Date)"
                    name="hiredDate"
                    type="date"
                    value={formData.hiredDate}
                    onChange={handleChange}
                    icon={CalendarDays}
                    placeholder="선택 사항"
                  />
                </div>

                <div
                  onClick={() => document.getElementById("fileInput")?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(
                      "border-blue-500",
                      "bg-blue-50"
                    );
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove(
                      "border-blue-500",
                      "bg-blue-50"
                    );
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(
                      "border-blue-500",
                      "bg-blue-50"
                    );
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      handleFileChange({ target: { files: [file] } });
                    }
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center h-28 cursor-pointer text-gray-500 hover:border-blue-400 transition-all hover:bg-gray-50"
                >
                  <p className="font-medium mb-1">
                    프로필 이미지를 클릭하거나 드래그하세요
                  </p>
                  <p className="text-sm text-gray-400">
                    (JPG, PNG 등 지원, 최대 5MB)
                  </p>
                </div>

                <div className="relative border border-gray-200 rounded-xl h-[170px] flex items-center justify-center bg-white overflow-hidden shadow-inner">
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="미리보기"
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 p-1 rounded-full shadow"
                        aria-label="이미지 취소"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      이미지 미리보기 없음
                    </span>
                  )}
                </div>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </section>
            </div>

            {/* footer buttons */}
            <footer className="pt-4 border-t border-gray-200 mt-8 flex justify-end space-x-4">
              <Link
                to="/admin/staff" //acclist
                className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150"
              >
                목록으로
              </Link>

              <button
                type="submit"
                disabled={isDisabled}
                className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md transition duration-150 flex items-center justify-center ${
                  isDisabled
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isDisabled ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    {isDeptLoading
                      ? "부서 로딩 중..."
                      : isSubmitting || uploading
                      ? "처리 중..."
                      : "처리 중..."}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" /> 등록
                  </>
                )}
              </button>
            </footer>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AccountRegiForm;
