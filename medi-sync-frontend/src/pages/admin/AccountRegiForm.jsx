import React, { useEffect, useState } from "react";
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
  Hash,
  ChevronDown,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/admins";

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

const AccountRegiForm = () => {
  const [formData, setFormData] = useState({
    empId: "",
    password: "",
    name: "",
    phone: "",
    email: "",
    role: "",
    profileImgUrl: "",
    doctorId: "",
    staffId: "",
  });

  const [doctorList, setDoctorList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const types = [
    { value: "", label: "유형 선택" },
    { value: "DOCTOR", label: "의사" },
    { value: "MEDICAL_STAFF", label: "의료진" },
  ];

  // 역할 변경 시 목록 불러오기
  useEffect(() => {
    const fetchList = async () => {
      try {
        if (formData.type === "DOCTOR") {
          const res = await axios.get("http://localhost:8080/api/doctors");
          setDoctorList(res.data);
        } else if (formData.type === "MEDICAL_STAFF") {
          const res = await axios.get("http://localhost:8080/api/staffs");
          setStaffList(res.data);
        }
      } catch (error) {
        console.error("목록 불러오기 실패:", error);
      }
    };
    fetchList();
  }, [formData.type]);

  // 인풋 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("changed", name, value);

    // 의사 선택 시
    if (name === "doctorId") {
      const selected = doctorList.find((d) => d.doctorId === Number(value));
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          doctorId: value,
          name: selected.doctorName || prev.name,
          email: selected.email || prev.email,
          phone: selected.phone || prev.phone,
        }));
      }
      return;
    }

    // 의료진 선택 시
    if (name === "staffId") {
      const selected = staffList.find((s) => s.staffId === Number(value));
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          staffId: value,
          name: selected.staffName || prev.name,
          email: selected.email || prev.email,
          phone: selected.phone || prev.phone,
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 등록 처리
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      let uploadedUrl = formData.profileImgUrl || null;

      // 선택한 파일이 있으면 업로드
      if (selectedFile) {
        const url = await uploadProfileImage();
        if (!url) throw new Error("이미지 업로드 실패");
        uploadedUrl = url;
      }

      const payload = {
        ...formData,
        profileImgUrl: uploadedUrl,
        doctorId: formData.doctorId ? Number(formData.doctorId) : null,
        staffId: formData.staffId ? Number(formData.staffId) : null,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("계정 등록 실패");

      setMessage("✅ 새 계정 등록이 완료되었습니다!");
      setMessageType("success");
      setFormData({
        empId: "",
        password: "",
        name: "",
        phone: "",
        email: "",
        role: "",
        profileImgUrl: "",
        doctorId: "",
        staffId: "",
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setMessage("❌ 등록 실패: " + err.message);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 타입/사이즈 간단 체크 (예: 5MB 이하, 이미지)
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("파일은 5MB 이하만 업로드 가능합니다.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadProfileImage = async () => {
    if (!selectedFile) return null;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", selectedFile);

      const res = await axios.post(
        "http://localhost:8080/api/uploads/profile",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // { url: "http://localhost:8080/uploads/profile/uuid.jpg" } 같은 응답 가정
      return res.data.url;
    } catch (err) {
      console.error("파일 업로드 실패:", err);
      alert("파일 업로드에 실패했습니다.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <div className="bg-white shadow-2xl rounded-xl p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-blue-600 mb-6 flex items-center">
            <UserPlus className="w-7 h-7 mr-3 text-blue-600" /> 새 계정 등록
          </h1>

          {message && (
            <div
              className={`p-4 mb-6 rounded-lg ${
                messageType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 필수 입력 */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 border-l-4 border-blue-500 pl-3 mb-4">
                  필수 입력
                </h2>

                {/* 1️⃣ 사원ID / 비밀번호 */}
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="사원 ID"
                    name="empId"
                    value={formData.empId}
                    onChange={handleChange}
                    required
                    icon={Briefcase}
                  />
                  <InputField
                    label="비밀번호"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    icon={KeyRound}
                  />
                </div>

                {/* 2️⃣ 유형 + 드롭다운 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-600 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      유형 (Type)
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white appearance-none pr-10"
                      >
                        {types.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* 역할별 선택 */}
                  {formData.type && (
                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-600 flex items-center">
                        <Hash className="w-4 h-4 mr-2 text-blue-500" />
                        {formData.type === "DOCTOR"
                          ? "의사 선택"
                          : "의료진 선택"}
                      </label>
                      <div className="relative">
                        <select
                          name={
                            formData.type === "DOCTOR" ? "doctorId" : "staffId"
                          }
                          value={
                            formData.type === "DOCTOR"
                              ? formData.doctorId
                              : formData.staffId
                          }
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white appearance-none pr-10"
                        >
                          <option value="">
                            {formData.type === "DOCTOR"
                              ? "의사 선택"
                              : "의료진 선택"}
                          </option>

                          {(formData.type === "DOCTOR"
                            ? doctorList
                            : staffList
                          ).map((item) => (
                            <option
                              key={
                                formData.type === "DOCTOR"
                                  ? item.doctorId
                                  : item.staffId
                              }
                              value={
                                formData.type === "DOCTOR"
                                  ? item.doctorId
                                  : item.staffId
                              }
                            >
                              {formData.type === "DOCTOR"
                                ? `${item.doctorName} (${item.doctorId})`
                                : `${item.staffName} (${item.staffId})`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3️⃣ 이름 / 연락처 / 이메일 */}
                <div className="grid grid-cols-1 gap-4">
                  <InputField
                    label="이름"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    icon={UserPlus}
                  />
                  <InputField
                    label="연락처 (Phone)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    icon={Phone}
                  />
                  <InputField
                    label="이메일 (Email)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={Mail}
                  />
                </div>
              </section>

              {/* 이미지 업로드 + 미리보기 */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 border-l-4 border-blue-500 pl-3 mb-4">
                  추가 입력
                </h2>

                {/* 업로드 */}
                <div
                  onClick={() => document.getElementById("fileInput").click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center h-28 cursor-pointer text-gray-500 hover:border-blue-400 transition-all"
                >
                  <p className="font-medium mb-1">
                    여기를 클릭하거나 이미지를 드래그하세요
                  </p>
                  <p className="text-sm text-gray-400">(JPG, PNG 등 지원)</p>
                </div>

                {/* 미리보기 */}
                <div className="border border-gray-200 rounded-xl h-[300px] flex items-center justify-center bg-gray-50 overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="미리보기"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">미리보기 없음</span>
                  )}
                </div>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </section>
            </div>

            {/* 하단 버튼 */}
            <footer className="pt-4 flex justify-end space-x-4">
              <Link
                to="/admin/acclist"
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition duration-150"
              >
                목록으로
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 disabled:bg-blue-300"
              >
                {isSubmitting ? "등록 중..." : "등록"}
              </button>
            </footer>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AccountRegiForm;
