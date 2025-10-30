import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminHeader from "../../component/AdminHeader";
import {
  UserPlus,
  Save,
  AlertTriangle,
  KeyRound,
  Mail,
  Phone,
  Briefcase,
  Users,
  Hash,
  ChevronDown,
} from "lucide-react"; // npm i lucide-react 필요

const API_URL = "http://192.168.0.24:8080/api/accounts";

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
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value || ""}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm disabled:bg-gray-100"
      disabled={disabled}
    />
  </div>
);

// 패스워드 암호화 (BCryptPasswordEncoder)
// 이미지 파일 업로드 기능 추가 필요 (multipart/form-data)

const AccountRegiForm = () => {
  const [formData, setFormData] = useState({
    empId: "",
    password: "",
    name: "",
    phone: "",
    email: "",
    role: "ADMIN", // 기본값
    profileImgUrl: "",
    doctorId: "",
    staffId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const roles = [
    { value: "ADMIN", label: "임직원 (ADMIN)" },
    { value: "USER", label: "고객 (USER)" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const payload = {
      ...formData,
      doctorId: formData.doctorId ? Number(formData.doctorId) : null,
      staffId: formData.staffId ? Number(formData.staffId) : null,
      phone: formData.phone || null,
      email: formData.email || null,
      profileImgUrl: formData.profileImgUrl || null,
    };

    console.log("Registration Payload:", payload);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("계정 등록에 실패했습니다.");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessage("✅ 새 계정 등록이 성공적으로 완료되었습니다.");
      setMessageType("success");

      // 성공 후 폼 초기화
      setFormData({
        empId: "",
        password: "",
        name: "",
        phone: "",
        email: "",
        role: "USER",
        profileImgUrl: "",
        doctorId: "",
        staffId: "",
      });
    } catch (error) {
      console.error("Registration Error:", error);
      setMessage(
        `❌ 등록 실패: ${
          error.message || "서버와의 통신에 문제가 발생했습니다."
        }`
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
          <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-8 border border-gray-200">
            <header className="flex items-center justify-between border-b pb-4 mb-6">
              <h1 className="text-3xl font-bold text-blue-600 flex items-center">
                <UserPlus className="w-7 h-7 mr-3 text-blue-600" />새 계정 등록
              </h1>
              <p className="text-sm text-gray-500">MediSync 관리 시스템</p>
            </header>

            {/* 메시지 영역 */}
            {message && (
              <div
                className={`p-4 mb-6 rounded-lg flex items-center text-sm font-medium ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 mr-3 ${
                    messageType === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
                {message}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              {/* 기본 정보 섹션 */}
              <section className="space-y-5 border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 border-l-4 border-blue-500 pl-3">
                  필수 입력
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="사원 ID"
                    name="empId"
                    icon={Briefcase}
                    required={true}
                    placeholder="로그인 코드 자동 발행 로직 필요"
                  />
                  <InputField
                    label="비밀번호"
                    name="password"
                    type="password"
                    icon={KeyRound}
                    required={true}
                    placeholder="최소 6자 이상"
                  />
                  <InputField
                    label="이름"
                    name="name"
                    icon={UserPlus}
                    required={true}
                    placeholder="홍길동"
                  />
                </div>

                {/* 연락처 및 역할 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="연락처 (Phone)"
                    name="phone"
                    icon={Phone}
                    placeholder="010-xxxx-xxxx"
                  />
                  <InputField
                    label="이메일 (Email)"
                    name="email"
                    type="email"
                    icon={Mail}
                    placeholder="name@medisync.com"
                  />

                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="role"
                      className="text-sm font-medium text-gray-600 flex items-center"
                    >
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      역할 (Role) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm disabled:bg-gray-100 bg-white appearance-none pr-10"
                        disabled={isSubmitting}
                      >
                        {roles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </section>

              {/* 추가 정보 섹션 */}
              <section className="space-y-5 border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 border-l-4 border-blue-500 pl-3">
                  추가 입력
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="프로필 이미지 URL"
                    name="profileImgUrl"
                    placeholder="http://..."
                  />
                  <InputField
                    label="의사일 경우"
                    name="doctorId"
                    type="number"
                    icon={Hash}
                    placeholder="doctorId 입력"
                  />
                  <InputField
                    label="의료진일 경우"
                    name="staffId"
                    type="number"
                    icon={Hash}
                    placeholder="staffId 입력"
                  />
                </div>
              </section>

              {/* 버튼 그룹 */}
              <footer className="pt-4 flex justify-end space-x-4">
                <Link
                  to="/admin/acclist"
                  className="px-5 py-2 bg-pink-200 text-red-700 font-semibold rounded-lg shadow-md hover:bg-pink-300 transition duration-150 flex items-center"
                >
                  리스트로
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      empId: "",
                      password: "",
                      name: "",
                      phone: "",
                      email: "",
                      role: "USER",
                      profileImgUrl: "",
                      doctorId: "",
                      staffId: "",
                    });
                    setMessage("폼 내용이 초기화되었습니다.");
                    setMessageType("error");
                  }}
                  className="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150 flex items-center"
                  disabled={isSubmitting}
                >
                  초기화
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-150 flex items-center disabled:bg-blue-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      등록 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      등록
                    </>
                  )}
                </button>
              </footer>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountRegiForm;
