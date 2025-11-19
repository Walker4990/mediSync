import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import SupportChatWidget from "./SupportChatPage";
import PatientInsurancePage from "./PatientInsurancePage";

import "../../style/calendar.css";

import {
  User,
  Lock,
  Bell,
  Search,
  FileText,
  Calendar,
  Wallet,
  MessageSquare,
  Briefcase,
  ChevronRight,
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  LinkIcon,
  Home,
  Eye,
  EyeOff,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import PaymentPage from "../../component/PaymentPage";

const token = localStorage.getItem("token");
const decoded = token ? jwtDecode(token) : null;
const patientId = decoded?.userId || null;
const API_BASE_URL = "http://192.168.0.24:8080/api/notification";
const API_TEST_URL = "http://localhost:8080/api/notification";

// ----------------------------------------------------
// 커스텀 모달 컴포넌트 (Alert/Confirm 대체)
// ----------------------------------------------------
const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  isConfirm = false,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fadeIn">
        <header
          className={`p-4 flex items-center ${
            isConfirm ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          {isConfirm ? (
            <AlertTriangle className="w-6 h-6 text-white mr-2" />
          ) : (
            <CheckCircle className="w-6 h-6 text-white mr-2" />
          )}
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </header>
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-line">{message}</p>
        </div>
        <footer className="p-4 bg-gray-50 flex justify-end space-x-3">
          {isConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              확인
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 ${
              isConfirm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } rounded-lg font-medium transition`}
          >
            {isConfirm ? "취소" : "닫기"}
          </button>
        </footer>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 주민등록번호로 나이와 성별을 계산하는 헬퍼 함수
// ----------------------------------------------------
const calculateAgeAndGender = (residentNo) => {
  // 13자리 전체가 들어왔을 때만 정확히 계산
  if (residentNo.length !== 13) {
    if (!residentNo || residentNo.length < 7) {
      return { age: "", gender: "" };
    }
  }

  const centuryCode = residentNo.substring(6, 7);
  let yearPrefix = "";
  let genderStr = "";

  // 1, 2: 1900년대 / 3, 4: 2000년대
  if (centuryCode === "1" || centuryCode === "2") {
    yearPrefix = "19";
  } else if (centuryCode === "3" || centuryCode === "4") {
    yearPrefix = "20";
  } else {
    return { age: "", gender: "" }; // 유효하지 않은 코드
  }

  const birthYear = parseInt(yearPrefix + residentNo.substring(0, 2), 10);
  const birthMonth = parseInt(residentNo.substring(2, 4), 10);
  const birthDay = parseInt(residentNo.substring(4, 6), 10);

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
    return { age: "", gender: "" };
  }

  const today = new Date();
  const currentYear = today.getFullYear();

  let age = currentYear - birthYear;

  // 생일이 지나지 않았으면 만 나이 계산
  if (
    today.getMonth() + 1 < birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)
  ) {
    age--;
  }

  // 성별 판별: 1, 3: 남 / 2, 4: 여
  if (centuryCode === "1" || centuryCode === "3") {
    genderStr = "M";
  } else if (centuryCode === "2" || centuryCode === "4") {
    genderStr = "F";
  }

  return { age, gender: genderStr };
};

// 비밀번호 입력 필드 컴포넌트
const PasswordInput = ({
  name,
  placeholder,
  value,
  onChange,
  disabled,
  showPasswordState,
  toggleVisibilityHandler,
}) => {
  const field = name.replace("Password", "").toLowerCase(); // current, new, confirm 중 하나
  const isVisible = showPasswordState[field];

  return (
    <div className="relative mb-5">
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:ring-red-500"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => toggleVisibilityHandler(field)}
        className="absolute right-0 flex items-center text-gray-300 hover:text-gray-500 h-full top-0 pr-3"
        aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보이기"}
      >
        {isVisible ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

const UserInfoEdit = ({ currentUser, onUserUpdate }) => {
  const [editData, setEditData] = useState({
    username: "",
    userphone: "",
    useremail: "",
    residentNo1: "", // 주민번호 앞 6자리
    residentNo2: "", // 주민번호 뒤 7자리
    age: "", // 자동 계산된 나이
    gender: "", // 자동 계산된 성별
    address: "",
    social: "",
    consentInsurance: 0, // 보험청구 동의 여부
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    patientLinkStatus: "N", // 환자 연동 상태 (Y/N)
    patientName: "", // 연동된 환자 이름
    patientId: null, // 연동된 환자 ID
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isConfirm: false,
    onConfirm: () => {},
    onCloseCallback: null,
  });

  const handleModalClose = () => {
    if (modal.onCloseCallback) {
      modal.onCloseCallback(); // 콜백 실행 (성공 시 onUserUpdate)
    }
    setModal({
      ...modal,
      isOpen: false,
      onCloseCallback: null, // 실행 후 콜백 초기화
    });
  };

  const token = localStorage.getItem("token");

  // currentUser 정보가 업데이트될 때 폼 데이터를 초기화 (로그인 직후 데이터 반영)
  useEffect(() => {
    if (currentUser && typeof currentUser === "object") {
      const patientData = currentUser.patient || {};
      const fullResidentNo = patientData.residentNo || "";
      let res1 = "";
      let res2 = "";

      if (fullResidentNo.length === 13) {
        res1 = fullResidentNo.substring(0, 6);
        res2 = fullResidentNo.substring(6, 13);
      }

      const initialConsent =
        patientData.consentInsurance === "Y" ||
        patientData.consentInsurance === true ||
        patientData.consentInsurance === 1
          ? 1
          : 0;

      setEditData((prev) => ({
        ...prev,
        username: currentUser.username || "",
        userphone: currentUser.userphone || "",
        useremail: currentUser.useremail || "",
        address: patientData.address || "",
        residentNo1: res1,
        residentNo2: res2,
        age: patientData.age,
        gender: patientData.gender,
        social: currentUser.social,
        consentInsurance: initialConsent,
        patientLinkStatus: currentUser.patientLinkStatus || "N",
        patientName: currentUser.patientName || "",
        patientId: currentUser.patientId || null,
      }));
    }
  }, [currentUser]);

  // 주민번호 입력 시 나이/성별 자동 계산
  useEffect(() => {
    const RRN_DEBOUNCE_DELAY = 500; // 0.5초 지연 설정

    const timer = setTimeout(() => {
      if (
        editData.residentNo1.length === 6 &&
        editData.residentNo2.length >= 1
      ) {
        const fullResidentNo = editData.residentNo1 + editData.residentNo2;
        if (fullResidentNo.length >= 7) {
          const { age, gender } = calculateAgeAndGender(fullResidentNo);
          setEditData((prev) => ({ ...prev, age, gender }));
        }
      } else {
        // 주민번호가 유효하지 않으면 나이/성별 초기화
        setEditData((prev) => ({ ...prev, age: "", gender: "" }));
      }
    }, RRN_DEBOUNCE_DELAY);
    return () => {
      clearTimeout(timer); // 이전 타이머를 제거하여 입력 중간에는 실행되지 않도록 함
    };
  }, [editData.residentNo1, editData.residentNo2]);

  // input 변경 핸들러
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // 유효성 검사를 수행
      if (name === "residentNo1" || name === "residentNo2") {
        const maxLength = name === "residentNo1" ? 6 : 7;

        // 입력 값이 숫자 외 문자를 포함하거나 길이를 초과하면 상태 업데이트를 막습니다.
        // if (value.length > maxLength || !/^\d*$/.test(value)) return;
      }
      // 그 외 필드(비밀번호 포함)는 바로 상태 업데이트 실행
      setEditData((prev) => ({ ...prev, [name]: value }));
    },
    [setEditData]
  );

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    let newValue = value; // consentInsurance 필드인 경우, 문자열 "1" 또는 "0"을 숫자 1 또는 0으로 변환
    if (name === "consentInsurance") {
      newValue = parseInt(value, 10);
    }
    setEditData((prev) => ({ ...prev, [name]: newValue }));
  };

  // 회원 정보 수정
  const handleUpdateInfo = async () => {
    if (isUpdating) return;

    const {
      username,
      userphone,
      useremail,
      address,
      age,
      gender,
      residentNo1,
      residentNo2,
      consentInsurance,
    } = editData;

    // 필수 필드 검증
    if (!username || !userphone || !useremail) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "이름, 연락처, 이메일은 필수 입력 사항입니다.",
      });
      return;
    }

    // 주민등록번호 유효성 검사
    if (
      (residentNo1.length > 0 || residentNo2.length > 0) &&
      (residentNo1.length !== 6 || residentNo2.length !== 7)
    ) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "주민등록번호 13자리를 올바르게 입력해주세요.",
      });
      return;
    }

    const fullResidentNo = residentNo1 + residentNo2; // 주민번호 합치기
    setIsUpdating(true);

    try {
      const updatePayload = {
        username,
        userphone,
        useremail,
        address,
        age,
        gender,
        residentNo: fullResidentNo,
        consentInsurance,
      };

      const response = await axios.patch(
        `http://localhost:8080/api/users/${currentUser.userId}/edit`,
        updatePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (
        response.status === 200 &&
        response.data === "User updated successfully."
      ) {
        setModal({
          isOpen: true,
          title: "저장 성공",
          message: "회원 정보가 성공적으로 업데이트되었습니다.",
          isConfirm: false,
          onCloseCallback: onUserUpdate,
        });
      } else {
        setModal({
          isOpen: true,
          title: "업데이트 실패",
          message: "정보 업데이트에 실패했습니다. (응답 오류)",
        });
      }
    } catch (error) {
      console.error("정보 업데이트 오류:", error);
      const errorMessage =
        error.response?.data?.message || // 서버가 보낸 message 속성을 사용
        error.response?.data ||
        "서버 통신 중 오류가 발생했습니다.";
      setModal({
        isOpen: true,
        title: "서버 오류",
        message: `정보 업데이트 중 오류가 발생했습니다: \n${errorMessage}`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (isUpdating) return;

    const { currentPassword, newPassword, confirmPassword } = editData;

    // 유효성 검사
    if (!currentPassword) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "현재 비밀번호를 입력해주세요.",
      });
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "새 비밀번호는 4자 이상이어야 합니다.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.",
      });
      return;
    }

    // 비밀번호 변경 확인 모달
    setModal({
      isOpen: true,
      title: "비밀번호 변경 확인",
      message: "새 비밀번호로 변경하시겠습니까?",
      isConfirm: true,
      onConfirm: async () => {
        setModal({ isOpen: false }); // 모달 닫기
        setIsUpdating(true);

        try {
          const passwordUpdatePayload = {
            password: newPassword,
            currentPassword: currentPassword,
          };

          const response = await axios.patch(
            `http://localhost:8080/api/users/${currentUser.userId}/pass`, // 비밀번호 전용 엔드포인트
            passwordUpdatePayload,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (
            response.status === 200 &&
            response.data === "User updated successfully."
          ) {
            setModal({
              isOpen: true,
              title: "성공",
              message: "비밀번호가 성공적으로 변경되었습니다.",
            });
            // 폼 초기화 (비밀번호 필드만)
            setEditData((prev) => ({
              ...prev,
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }));
          } else {
            setModal({
              isOpen: true,
              title: "변경 실패",
              message:
                "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.",
            });
          }
        } catch (error) {
          console.error("비밀번호 변경 오류:", error);
          const errorMessage =
            error.response?.data?.message || // 서버가 보낸 message 속성을 사용
            error.response?.data ||
            "서버 통신 중 오류가 발생했습니다.";
          setModal({
            isOpen: true,
            title: "서버 오류",
            message: `비밀번호 변경 중 오류가 발생했습니다: \n${errorMessage}`,
          });
        } finally {
          setIsUpdating(false);
        }
      },
    });
  };

  // 비밀번호 표시
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  // 5. 환자 연동/연동 해제 핸들러
  const handlePatientLinkToggle = async () => {
    if (isUpdating) return;

    const fullResidentNo = editData.residentNo1 + editData.residentNo2;
    if (fullResidentNo.length !== 13) {
      setModal({
        isOpen: true,
        title: "연동 오류",
        message:
          "환자 연동을 위해서는 올바른 주민등록번호 13자리가 필요합니다.",
      });
      return;
    }

    const isLinking = editData.patientLinkStatus === "N";
    const endpoint = isLinking ? "/api/patients/link" : "/api/patients/unlink";
    const actionMessage = isLinking ? "연동" : "연동 해제";

    setModal({
      isOpen: true,
      title: `환자 정보 ${actionMessage} 확인`,
      message: `환자 정보를 ${actionMessage}하시겠습니까? (이 작업은 주민등록번호 기반으로 처리됩니다.)`,
      isConfirm: true,
      onConfirm: async () => {
        setModal({ isOpen: false });

        try {
          const response = await axios.post(
            `http://localhost:8080${endpoint}`,
            { residentNo: fullResidentNo, userId: currentUser.userId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.status === 200) {
            const newStatus = isLinking ? "Y" : "N";
            const newPatientName = isLinking
              ? response.data.patientName || "연동 환자"
              : "";
            const newPatientId = isLinking
              ? response.data.patientId || "UNKNOWN"
              : null;

            setEditData((prev) => ({
              ...prev,
              patientLinkStatus: newStatus,
              patientName: newPatientName,
              patientId: newPatientId,
            }));
            setModal({
              isOpen: true,
              title: "성공",
              message: `🔗 환자 정보 ${actionMessage}이 완료되었습니다.`,
            });
            onUserUpdate(); // 연동 상태 변경 반영
          } else {
            setModal({
              isOpen: true,
              title: `${actionMessage} 실패`,
              message: `서버 응답 오류로 ${actionMessage}에 실패했습니다.`,
            });
          }
        } catch (err) {
          console.error(`환자 ${actionMessage} 오류:`, err);
          const errMsg =
            err.response?.data?.message || "서버 통신 오류가 발생했습니다.";
          setModal({
            isOpen: true,
            title: `${actionMessage} 실패`,
            message: `❌ 환자 ${actionMessage} 실패: ${errMsg}`,
          });
        } finally {
          setIsUpdating(false);
        }
      },
    });
  };

  return (
    <div className="p-6">
      <AlertModal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title={modal.title}
        message={modal.message}
        isConfirm={modal.isConfirm}
        onConfirm={modal.onConfirm}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* 왼쪽 컬럼: 기본 정보 수정 */}
        <div className="border w-[450px] p-6 rounded-xl shadow-md bg-white space-y-6 flex flex-col">
          <h4 className="text-xl font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" /> 기본정보 수정
          </h4>

          {/* 폼 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
            {/* 이름 */}
            <div className="md:col-span-1">
              <span className="mb-1 text-sm font-medium text-gray-600">
                이름
              </span>
              <input
                type="text"
                name="username"
                placeholder="이름"
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                value={editData.username}
                onChange={handleChange}
                disabled={isUpdating}
              />
            </div>
            {/* 연락처 */}
            <div className="md:col-span-1">
              <span className="mb-1 text-sm font-medium text-gray-600">
                연락처
              </span>
              <input
                type="tel"
                name="userphone"
                placeholder="연락처 (예: 010-1234-5678)"
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                value={editData.userphone}
                onChange={handleChange}
                disabled={isUpdating}
              />
            </div>

            {/* 이메일 */}
            <div className="md:col-span-2">
              <span className="mb-1 text-sm font-medium text-gray-600">
                이메일
              </span>
              <input
                type="email"
                name="useremail"
                placeholder="이메일"
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                value={editData.useremail}
                onChange={handleChange}
                disabled={isUpdating}
              />
            </div>

            {/* 주민등록번호 */}
            <div className="md:col-span-2">
              <span className="mb-1 text-sm font-medium text-gray-600">
                주민등록번호
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  inputMode="numeric"
                  name="residentNo1"
                  placeholder="앞 6자리"
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                  value={editData.residentNo1}
                  onChange={handleChange}
                  disabled={isUpdating}
                  maxLength="6"
                />
                <span className="text-gray-500 text-xl">-</span>
                <input
                  type="password"
                  inputMode="numeric"
                  name="residentNo2"
                  placeholder="뒤 7자리"
                  className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                  value={editData.residentNo2}
                  onChange={handleChange}
                  disabled={isUpdating}
                  maxLength="7"
                />
              </div>
              <p className="text-xs text-red-500 mt-1">
                * 주민등록번호는 환자 연동 및 보험 청구에 사용됩니다.
              </p>
            </div>

            {/* 나이 (자동) */}
            <div className="md:col-span-1">
              <span className="mb-1 text-sm font-medium text-gray-600">
                나이
              </span>
              <input
                type="text"
                value={editData.age ? `${editData.age} 세` : ""}
                readOnly
                className="p-3 border border-gray-300 rounded-lg w-full bg-gray-200 text-gray-700 font-bold text-center"
              />
            </div>
            {/* 성별 (자동) */}
            <div className="md:col-span-1">
              <span className="mb-1 text-sm font-medium text-gray-600">
                성별
              </span>
              <input
                type="text"
                value={
                  editData.gender === "M"
                    ? "남"
                    : editData.gender === "F"
                    ? "여"
                    : ""
                }
                readOnly
                className="p-3 border border-gray-300 rounded-lg w-full bg-gray-200 text-gray-700 font-bold text-center"
              />
            </div>

            {/* 주소 */}
            <div className="md:col-span-2">
              <span className="mb-1 text-sm font-medium text-gray-600">
                주소
              </span>
              <input
                type="text"
                name="address"
                placeholder="주소를 입력하세요"
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                value={editData.address}
                onChange={handleChange}
                disabled={isUpdating}
              />
            </div>

            {/* 보험자동청구 동의 */}
            <div className="md:col-span-2">
              <span className="mb-1 text-sm font-medium text-gray-600">
                보험자동청구 동의 여부
              </span>
              <div className="flex flex-wrap space-x-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="consentInsurance"
                    value={1}
                    checked={editData.consentInsurance === 1}
                    onChange={handleRadioChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    disabled={isUpdating}
                  />
                  <span className="ml-2 text-gray-700 font-medium">
                    동의 (Y)
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="consentInsurance"
                    value={0}
                    checked={editData.consentInsurance === 0}
                    onChange={handleRadioChange}
                    className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                    disabled={isUpdating}
                  />
                  <span className="ml-2 text-gray-700">미동의 (N)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 변경사항 저장 버튼 */}
          <button
            onClick={handleUpdateInfo}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 mt-auto"
            disabled={isUpdating}
          >
            {isUpdating ? "저장 중..." : "변경 사항 저장"}
          </button>
        </div>

        {/* 오른쪽 컬럼: 비밀번호 변경 및 환자 연동 */}
        <div className="space-y-8 w-[360px]">
          {/* 비밀번호 변경 */}
          {currentUser &&
            currentUser.social !== "NAVER" &&
            currentUser.social !== "KAKAO" && (
              <div className="border p-6 rounded-xl shadow-md bg-white">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-red-600" /> 비밀번호 변경
                </h4>
                <span className="mb-1 text-sm font-medium text-gray-600">
                  현재 비밀번호
                </span>
                <PasswordInput
                  type="password"
                  name="currentPassword"
                  placeholder="현재 비밀번호를 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-red-500"
                  value={editData.currentPassword}
                  onChange={handleChange}
                  disabled={isUpdating}
                  showPasswordState={showPassword}
                  toggleVisibilityHandler={togglePasswordVisibility}
                />

                <span className="mb-1 text-sm font-medium text-gray-600">
                  새 비밀번호
                </span>
                <PasswordInput
                  type="password"
                  name="newPassword"
                  placeholder="새 비밀번호 (4글자 이상)"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-red-500"
                  value={editData.newPassword}
                  onChange={handleChange}
                  disabled={isUpdating}
                  showPasswordState={showPassword}
                  toggleVisibilityHandler={togglePasswordVisibility}
                />

                <span className="mb-1 text-sm font-medium text-gray-600">
                  새 비밀번호 확인
                </span>
                <PasswordInput
                  type="password"
                  name="confirmPassword"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-red-500"
                  value={editData.confirmPassword}
                  onChange={handleChange}
                  disabled={isUpdating}
                  showPasswordState={showPassword}
                  toggleVisibilityHandler={togglePasswordVisibility}
                />
                <button
                  onClick={handleChangePassword}
                  className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg disabled:bg-gray-400"
                  disabled={isUpdating}
                >
                  {isUpdating ? "변경 중..." : "비밀번호 변경"}
                </button>
              </div>
            )}

          {/* 환자 연동 상태 */}
          {/* <div className="border p-6 rounded-xl shadow-md bg-white">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <LinkIcon className="w-5 h-5 mr-2 text-green-600" /> 환자 연동
              상태
            </h4>

            <div className="patient-status-display flex-grow mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  editData.patientLinkStatus === "Y"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {editData.patientLinkStatus === "Y"
                  ? "🟢 연동 완료"
                  : "🔴 미연동 상태"}
              </span>
              {editData.patientLinkStatus === "Y" ? (
                <p className="mt-2 text-sm text-gray-700">
                  환자명: <strong>{editData.patientName}</strong> <br />
                  환자 ID:{" "}
                  <span className="font-mono">{editData.patientId}</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  병원 시스템과의 기록 연동을 위해 연동이 필요합니다.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handlePatientLinkToggle}
              className={`w-full py-3 font-bold rounded-lg transition shadow-lg ${
                editData.patientLinkStatus === "Y"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              } disabled:bg-gray-400`}
              disabled={isUpdating}
            >
              {isUpdating
                ? `${
                    editData.patientLinkStatus === "Y"
                      ? "해제 중..."
                      : "연동 중..."
                  }`
                : `${
                    editData.patientLinkStatus === "Y"
                      ? "환자 연동 해제"
                      : "새로고침"
                  }`}
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

// 알림 설정 on/off 탭
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await axios.put(`http://localhost:8080/api/notification/${patientId}`, {
        key,
        value: newSettings[key],
        setting: newSettings,
      });
      console.log("알림 설정 완");
    } catch (error) {
      console.error("알림설정 업데이트 실패");
    }
  };
  // 새로고침 시 가져오기
  useEffect(() => {
    const fatchsettings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/notification/${patientId}`
        );
        console.log("가져온 알림설정: ", res.data);

        //키에 맞게 state 업데이트
        setSettings({
          email: res.data.emailEnabled,
          push: res.data.pushEnabled,
          marketing: res.data.marketingEnabled,
          sms: res.data.smsEnabled,
        });
      } catch (error) {
        console.error("알림 설정 조회 실패 : ", error);
      }
    };

    fatchsettings();
  }, [patientId]);

  // 알림설정 css
  const SettingToggle = ({ label, keyName }) => (
    <div className="flex justify-between items-center p-3 border-b last:border-b-0">
      <span className="text-gray-700">{label}</span>
      <button
        onClick={() => toggleSetting(keyName)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          settings[keyName] ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings[keyName] ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
  // 알림 설정 화면단
  return (
    <div className="p-6 space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
        <SettingToggle label="이메일 알림 (진료/예약 관련)" keyName="email" />
        <SettingToggle label="SMS 수신 동의 (긴급사항)" keyName="sms" />
        <SettingToggle label="푸시 알림 (앱 사용 시)" keyName="push" />
        <SettingToggle label="마케팅 정보 수신 (선택)" keyName="marketing" />
      </div>
      <br></br>
      <p className="text-sm text-gray-500 pt-2">
        필수 알림(법적 의무 사항 등)은 미수신 설정과 관계없이 발송될 수
        있습니다.
      </p>
    </div>
  );
};

// 환자 기록 탭
const PatientRecords = ({ title, icon: Icon }) => {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 5;

  // 진료 기록 불러오기
  const fetchrecords = async (newPage = 0) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/records/patient/page/${patientId}`,
        {
          params: { page: newPage, size: pageSize },
        }
      );
      console.log("진료 기록 응답 데이터 : ", res.data);
      if (res.data.length < pageSize) setHasMore(false);
      setRecords((prev) => (newPage === 0 ? res.data : [...prev, ...res.data]));
    } catch (err) {
      console.error("진료기록 조회 실패 : ", err);
    }
  };

  useEffect(() => {
    fetchrecords(0);
  }, [patientId]);

  // 진료 상세 페이지 열기
  const openRecordDetail = (recordId) => {
    window.open(
      `/user/medicalDetail/${recordId}`,
      "_blank",
      "width=800,height=1000,top=100,left=200,resizable=no,scrollbars=yes"
    );
  };

  // 더보기 버튼
  const loadMore = () => {
    const nextPage = page + 1;
    fetchrecords(nextPage);
    setPage(nextPage);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
        <Icon className="w-5 h-5 mr-2" /> {title}
      </h3>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {records.map((item, index) => (
            <li
              key={item.recordId || index}
              className="flex justify-between items-center p-4 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => openRecordDetail(item.recordId)}
            >
              <span>{`${item.deptName}  ${item.diagnosis} 진료 `}</span>
              <span className="text-gray-400 ml-auto">{`${item.createdAt.replace(
                "T",
                " "
              )}`}</span>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
            </li>
          ))}
        </ul>
      </div>
      {hasMore ? (
        <button
          onClick={loadMore}
          className="w-full py-2 border border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          더 많은 기록 보기
        </button>
      ) : (
        <p className="text-gray-400 text-center text-sm">
          모든 기록을 불러왔습니다
        </p>
      )}
    </div>
  );
};
// 환자 일정 탭
const ViewReservation = ({ title, icon: Icon }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // 로그인 유저 임시 번호

  const fetchCalendarData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/calendar?patient_id=${patientId}`
      );
      console.log("받은 일정 데이터:", res.data);
      const formatted = res.data.map((item) => ({
        title: item.title,
        start: item.startDate,
        end: item.startDate,
        color: item.color || "#3B82F6",
        textColor: item.textColor || "#FFFFFF",
        extendedProps: {
          type: item.type,
          patientName: item.patientName,
          doctorName: item.doctorName,
          id: item.id,
        },
      }));
      setEvents(formatted);
    } catch (err) {
      console.log("일정 조회 실패", err);
    }
  };
  useEffect(() => {
    fetchCalendarData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
        <Icon className="w-5 h-5 mr-2" /> {title}
      </h3>
      <div className="bg-white rounded-lg shadow-md p-2">
        {/* <p className="text-center text-red-500 py-4">
            사용자 정보를 불러오는 중입니다...
          </p> */}
        <FullCalendar
          locale="ko"
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          themeSystem="standard"
          eventClick={(info) => {
            const clickedEvent = {
              title: info.event.title,
              start: info.event.start,
              color: info.event.backgroundColor,
              textColor: info.event.textColor,
              type: info.event.extendedProps.type,
              patientName: info.event.extendedProps.patientName,
              doctorName: info.event.extendedProps.doctorName,
              id: info.event.extendedProps.id,
            };

            if (clickedEvent) {
              setSelectedEvent(clickedEvent);
              setIsCalendarModalOpen(true);
            } else {
              console.warn("일치하는 이벤트를 찾을 수 없습니다:", info.event);
            }
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          buttonText={{
            today: "오늘",
            month: "월",
            week: "주",
            day: "일",
          }}
          events={events}
          eventDisplay="block"
          height={600}
        ></FullCalendar>
      </div>
      {isCalendarModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden  animate-fadeIn ">
            {/* 상단 헤더 */}
            <div
              className="h-24 flex items-center justify-center text-white text-2xl font-bold"
              style={{
                backgroundColor:
                  selectedEvent.type === "진료 예약"
                    ? "#3B82F6"
                    : selectedEvent.type === "검사 예약"
                    ? "#60A5FA"
                    : selectedEvent.type === "수술 예약"
                    ? "#1E40AF"
                    : "#64748B",
              }}
            >
              {selectedEvent.title}
            </div>
            {/* 본문 내용 */}
            <div className="p-6 space-y-4">
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-600">예약종류</span>
                  <span className="text-gray-800">{selectedEvent.type}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-600">환자</span>
                  <span className="text-gray-800">
                    {selectedEvent.patientName}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-600">담당 의사</span>
                  <span className="text-gray-800">
                    {selectedEvent.doctorName}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-600">아이디</span>
                  <span className="text-gray-800">{selectedEvent.id}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-600">예약 시간</span>
                  <span className="text-gray-800">
                    {selectedEvent.start
                      ? new Date(selectedEvent.start).toLocaleString("ko-KR")
                      : "시간 정보 없음"}
                  </span>
                </div>
              </div>
              {/* 버튼 */}
              <div className="flex justify-end space-x-3 pt-4">
                {new Date(selectedEvent.start) > new Date() && (
                  <button
                    onClick={async () => {
                      if (!window.confirm("예약을 취소하시겠습니까?")) {
                        return;
                      }
                      try {
                        await axios.put(
                          `http://localhost:8080/api/calendar`,
                          null,
                          {
                            params: {
                              id: selectedEvent.id,
                              type: selectedEvent.type,
                              startDate: selectedEvent.start,
                            },
                          }
                        );
                        // 모달 닫기
                        alert("예약을 취소하였습니다.");
                        setIsCalendarModalOpen(false);
                        setSelectedEvent(null);

                        // 달력 리로드
                        await fetchCalendarData();
                      } catch (error) {
                        console.log("예약 취소 오류", error);
                        alert("예약 취소 중 오류가 발생했습니다.");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    예약 취소
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsCalendarModalOpen(false);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 실시간 상담 아이콘 -> 클릭 시 채팅 시작
const ChatFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* SupportChatWidget 자체의 버튼을 사용 */}
      <SupportChatWidget
        embedded={false}
        externalControl={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    </div>
  );
};

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------

const MyPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 데이터 로드 로직을 useCallback으로 추출
  const fetchUserData = useCallback(() => {
    const token = localStorage.getItem("token");
    setLoading(true); // 업데이트 시에도 로딩 표시

    axios
      .get("http://localhost:8080/api/users/mypage", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCurrentUser(res.data);
      })
      .catch((err) => {
        console.error("마이페이지 정보 로드 실패:", err);
        setCurrentUser(null);
        alert("세션이 만료되었거나 오류가 발생했습니다. 다시 로그인해주세요.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // 의존성 배열에 fetchUserData 추가

  const formattedDate = useMemo(() => {
    if (!currentUser?.createdAt) return "";
    return new Date(currentUser.createdAt).toLocaleDateString();
  }, [currentUser]);

  // if (loading) return <p>로딩 중...</p>;
  // if (!currentUser) return <p>로그인이 필요합니다.</p>;

  // 사용자의 현재 탭 상태 관리
  const [activeTab, setActiveTab] = useState("info_edit");

  // 마이페이지 메뉴 정의
  const menuItems = useMemo(
    () => [
      {
        id: "info_edit",
        label: "회원 정보 변경",
        icon: User,
        group: "profile",
      },
      {
        id: "notification_settings",
        label: "알림 수신 설정",
        icon: Bell,
        group: "profile",
      },
      {
        id: "patient-insurance",
        label: "내 보험 조회",
        icon: ShieldCheck,
        group: "profile",
      },

      {
        id: "med_records",
        label: "예약 조회 및 변경",
        icon: Calendar,
        group: "patient",
      },
      {
        id: "reservations",
        label: "진료 기록 조회",
        icon: FileText,
        group: "patient",
      },
      {
        id: "tests",
        label: "검사 결과 조회",
        icon: Search,
        group: "patient",
      },
      {
        id: "insurance_payment",
        label: "보험/수납 조회",
        icon: Wallet,
        group: "patient",
      },
    ],
    []
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-10 text-center text-gray-500">
          사용자 정보를 불러오는 중입니다...
        </div>
      );
    }

    switch (activeTab) {
      case "info_edit":
        return (
          <UserInfoEdit
            currentUser={currentUser}
            onUserUpdate={fetchUserData}
          />
        );
      case "notification_settings":
        return <NotificationSettings />;
      case "med_records":
        return (
          <ViewReservation
            title="예약 조회 및 변경"
            icon={Calendar}
            currentUser={currentUser}
          />
        );
      case "reservations":
        return <PatientRecords title="진료 기록" icon={FileText} />;
      case "tests":
        return (
          <ViewReservation
            title="검사 결과 조회"
            icon={Search}
            currentUser={currentUser}
          />
        );
      case "insurance_payment":
        return (
          <PaymentPage
            title="보험/수납 내역"
            icon={Wallet}
            currentUser={currentUser}
          />
        );
      case "patient-insurance":
        return (
          <PatientInsurancePage
            title="내 보험 조회"
            icon={ShieldCheck}
            patientId={patientId}
          />
        );
      default:
        return <div className="p-6 text-gray-500">선택된 메뉴가 없습니다.</div>;
    }
  };

  // 현재 선택된 메뉴 항목의 라벨을 헤더에 표시
  const activeLabel =
    menuItems.find((item) => item.id === activeTab)?.label || "마이페이지";

  // 사용자 이름이 로딩 중일 때는 '...' 표시, 로딩 완료 후 값이 없으면 '사용자' 표시
  const userName = currentUser?.username || (loading ? "..." : "사용자");
  const userId = currentUser?.userId || (loading ? "..." : "");

  const socialType = useMemo(() => {
    if (currentUser?.social === "NAVER") return "네이버";
    if (currentUser?.social === "KAKAO") return "카카오";
    return "일반";
  }, [currentUser?.social]);

  return (
    <div className="font-pretendard">
      {/* 상단 섹션: 사용자 이름 동적 반영 */}
      <section className="pt-12 pb-16 bg-gradient-to-l from-white to-sky-100 shadow-inner">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-bold text-gray-800">
            환영합니다,{" "}
            <span className="text-blue-600">
              {userName}({userId})
            </span>{" "}
            님!
            {socialType && (
              <span
                className={`text-base font-medium ml-3 px-3 py-1 rounded-full ${
                  socialType === "네이버"
                    ? "bg-green-100 text-green-700"
                    : socialType === "카카오"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {socialType} 로그인
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            이곳에서 당신의 정보를 안전하게 관리하고 기록을 확인하세요.
          </p>
        </div>
      </section>
      {/* 메인 콘텐츠 영역 (사이드바 + 내용) */}
      <div className="mx-auto flex flex-col md:flex-row mt-8 ">
        {/* 사이드바 (메뉴 목록) */}
        <aside className="w-full md:w-64 mb-8 md:mb-0 md:mr-8 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <nav className="space-y-2">
            {/* 섹션 1: 프로필 관리 */}
            <p className="text-sm font-bold text-gray-500 uppercase mt-4 mb-2 border-b pb-1">
              내 정보 관리
            </p>
            {menuItems
              .filter((item) => item.group === "profile")
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left flex items-center p-3 rounded-lg transition duration-150 ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}

            {/* 섹션 2: 환자 기록 */}
            <p className="text-sm font-bold text-gray-500 uppercase mt-6 mb-2 border-b pb-1 pt-5">
              나의 진료 기록
            </p>
            {menuItems
              .filter((item) => item.group === "patient")
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left flex items-center p-3 rounded-lg transition duration-150 ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
          </nav>
        </aside>

        {/* 콘텐츠 영역 */}
        <main className="flex-grow bg-white rounded-xl shadow-xl border border-gray-200">
          <header className="p-4 border-b bg-gray-50 rounded-t-xl">
            <h2 className="text-2xl font-bold text-gray-700">{activeLabel}</h2>
          </header>
          {renderContent()}
        </main>
      </div>
      <ChatFloatingButton /> {/* 실시간 상담 아이콘 */}
    </div>
  );
};
export default MyPage;
