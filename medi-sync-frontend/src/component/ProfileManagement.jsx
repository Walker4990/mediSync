import React from "react";
import { Camera, XCircle, Settings, ChevronDown } from "lucide-react";
import {
  BASE_URL,
  POSITION_OPTIONS,
  STATUS_OPTIONS,
  getOptionLabel,
} from "../api/AdminConstants";

const ProfileManagement = ({
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
  // 입력 렌더링 함수
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

export default ProfileManagement;
