import React, { useState, useEffect } from "react";
import AdminHeader from "../../component/AdminHeader";
import { User } from "lucide-react";
import axios from "axios";

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
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : value; // 찾지 못하면 원본 value 반환
};

const API_URL = "http://192.168.0.24:8080/api/admins/mypage";
const BASE_URL = "http://localhost:8080";

const AdminMyPage = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      // localStorage에서 먼저 데이터 확인
      const storedData = localStorage.getItem("admin_data");

      if (storedData) {
        // localStorage에 데이터가 있으면 API 호출 없이 바로 사용
        const data = JSON.parse(storedData);
        setAdmin(data);
        setFormData(data || {});
        setLoading(false);
      } else {
        // localStorage에 데이터가 없으면 API 호출 시도
        try {
          const response = await axios.get(API_URL);
          const data = response.data;
          setAdmin(data);
          setFormData(data || {});
          // API로 가져온 정보를 localStorage에 저장
          localStorage.setItem("admin_data", JSON.stringify(data));
        } catch (error) {
          console.error("데이터 로드 오류:", error);
          setAdmin(null);
          setFormData({});
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAdminData();
  }, []); // 💡 API_URL 의존성 제거, 마운트 시 1회 실행

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(API_URL, formData);
      const updatedData = response.data;

      setAdmin(updatedData);
      setFormData(updatedData);

      // localStorage의 데이터도 업데이트하여 헤더와 동기화
      localStorage.setItem("admin_data", JSON.stringify(updatedData));

      setIsEditing(false);
      alert("직원 정보가 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert(
        "정보 저장에 실패했습니다: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleCancel = () => {
    setFormData(admin || {}); // 원래 데이터로 복원 (null일 경우 빈 객체)
    setIsEditing(false);
  };

  // 필드 값을 가져오고, 없으면 '-' 반환
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
      <div className="bg-gray-50 min-h-screen font-pretendard">
        <AdminHeader />
        <main className="max-w-7xl mx-auto pt-24 px-8">
          <div className="flex justify-center items-center h-64 text-blue-500 text-lg font-medium">
            데이터를 불러오는 중입니다...
          </div>
        </main>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="bg-gray-50 min-h-screen font-pretendard">
        <AdminHeader />
        <main className="max-w-7xl mx-auto pt-24 px-8">
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
              ❗️ 로그인 정보를 불러올 수 없습니다.
            </p>
            <p className="text-sm mt-2">
              토큰이 만료되었거나, 서버 연결에 실패했습니다. 다시
              로그인해주세요.
            </p>
          </div>
        </main>
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
      name: "deptName",
      readonly: !isEditing,
      type: "text",
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

  const renderInput = (field) => {
    const value =
      formData[field.name] === undefined ||
      formData[field.name] === null ||
      formData[field.name] === ""
        ? "" // 편집 시에는 "-" 대신 빈 문자열
        : formData[field.name];

    if (field.readonly && field.name === "createdAt") {
      return (
        <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                    {value !== "" ? new Date(value).toLocaleString() : "-"}     
           {" "}
        </span>
      );
    }
    if (field.readonly && field.name === "hiredDate") {
      return (
        <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                    {value !== "" ? new Date(value).toLocaleDateString() : "-"} 
               {" "}
        </span>
      );
    }

    // 조회 모드
    if (field.readonly && !isEditing) {
      let displayVal = value;
      if (field.name === "position")
        displayVal = getOptionLabel(POSITION_OPTIONS, value);
      if (field.name === "status")
        displayVal = getOptionLabel(STATUS_OPTIONS, value);

      return (
        <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                    {displayVal !== "" ? displayVal : "-"}       {" "}
        </span>
      );
    }

    // 편집 모드
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
        value={value}
        onChange={handleChange}
        className="p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        readOnly={field.readonly} // adminId 등 항상 읽기 전용
        disabled={field.readonly} // readonly가 true이면 disabled
      />
    );
  };

  // 데이터 조회 성공 시
  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />
      <main className="max-w-7xl mx-auto pt-24 px-8">
        <div className="space-y-5 pb-10">
          <div className="flex justify-left items-center mb-6 px-2 border-b-2 border-blue-200">
            <h1 className="text-4xl font-bold text-blue-600 pb-4 mr-16">
              마이페이지
            </h1>
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
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
                    src={
                      formData.profileImgUrl
                        ? `${BASE_URL}${formData.profileImgUrl}`
                        : "/no_image.png"
                    }
                    className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-md"
                    alt="프로필 이미지" // (추가) alt 태그
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no_image.png";
                    }} // (추가) 이미지 로드 실패 시
                  />
                  {isEditing && (
                    <button
                      className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      title="프로필 이미지 변경"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.218A2 2 0 0110.45 4h3.1a2 2 0 011.664.89l.812 1.218a2 2 0 001.664.89H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                    </button>
                  )}
                </div>
                {isEditing && (
                  <button className="text-sm text-red-500 hover:text-red-700">
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
                    {isEditing ? (
                      renderInput(field)
                    ) : (
                      <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-700">
                        {displayValue(field.name)}
                      </span>
                    )}
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
                  {isEditing ? (
                    renderInput(field)
                  ) : (
                    // 조회 모드일 때 라벨로 표시
                    <span className="p-2 w-full bg-gray-100 border border-gray-200 rounded-md text-gray-700">
                      {field.name === "position" &&
                        displayValue(field.name, POSITION_OPTIONS)}
                      {field.name === "status" &&
                        displayValue(field.name, STATUS_OPTIONS)}
                      {field.name === "deptName" && displayValue(field.name)}
                      {field.name === "hiredDate" &&
                        (displayValue(field.name) !== "-"
                          ? new Date(
                              displayValue(field.name)
                            ).toLocaleDateString()
                          : "-")}
                      {field.name === "createdAt" &&
                        (displayValue(field.name) !== "-"
                          ? new Date(displayValue(field.name)).toLocaleString()
                          : "-")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* 기타 기능 */}
          <div className="bg-white p-6 shadow-xl rounded-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
              기타 옵션
            </h2>
            <div className="text-gray-500">
              <p>여기에 추가 기능을 배치할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminMyPage;
