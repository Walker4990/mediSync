import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { User, Lock } from "lucide-react";
import AlertModal from "./AlertModal";
import PasswordInput from "./PasswordInput";
import { calculateAgeAndGender } from "../api/MyPageHelpers";

const UserInfoEdit = ({ currentUser, onUserUpdate }) => {
  const [editData, setEditData] = useState({
    username: "",
    userphone: "",
    useremail: "",
    residentNo1: "",
    residentNo2: "",
    age: "",
    gender: "",
    address: "",
    social: "",
    consentInsurance: 0,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    patientLinkStatus: "N",
    patientName: "",
    patientId: null,
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

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 소셜 로그인 여부 확인
  const isSocialLogin =
    currentUser &&
    (currentUser.social === "NAVER" || currentUser.social === "KAKAO");

  const handleModalClose = () => {
    if (modal.onCloseCallback) {
      modal.onCloseCallback();
    }
    setModal({ ...modal, isOpen: false, onCloseCallback: null });
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (currentUser && typeof currentUser === "object") {
      const patientData = currentUser.patient || {};
      const fullResidentNo = patientData.residentNo || "";
      const cleanResidentNo = fullResidentNo.replace(/[^0-9]/g, "");
      let res1 = "";
      let res2 = "";

      if (cleanResidentNo.length === 13) {
        res1 = cleanResidentNo.substring(0, 6);
        res2 = cleanResidentNo.substring(6, 13);
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

  useEffect(() => {
    const RRN_DEBOUNCE_DELAY = 500;
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
        setEditData((prev) => ({ ...prev, age: "", gender: "" }));
      }
    }, RRN_DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [editData.residentNo1, editData.residentNo2]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "residentNo1" || name === "residentNo2") {
        if (!/^\d*$/.test(value)) return;
      }
      setEditData((prev) => ({ ...prev, [name]: value }));
    },
    [setEditData]
  );

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "consentInsurance") {
      newValue = parseInt(value, 10);
    }
    setEditData((prev) => ({ ...prev, [name]: newValue }));
  };

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

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

    if (!username || !userphone || !useremail) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "이름, 연락처, 이메일은 필수 입력 사항입니다.",
      });
      return;
    }

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

    const fullResidentNo = `${residentNo1}-${residentNo2}`;
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
        error.response?.data?.message ||
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

  const handleChangePassword = async () => {
    if (isUpdating) return;
    const { currentPassword, newPassword, confirmPassword } = editData;

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

    setModal({
      isOpen: true,
      title: "비밀번호 변경 확인",
      message: "새 비밀번호로 변경하시겠습니까?",
      isConfirm: true,
      onConfirm: async () => {
        setModal({ isOpen: false });
        setIsUpdating(true);
        try {
          const passwordUpdatePayload = {
            password: newPassword,
            currentPassword: currentPassword,
          };
          const response = await axios.patch(
            `http://localhost:8080/api/users/${currentUser.userId}/pass`,
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
          const errorMessage =
            error.response?.data?.message ||
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
        {/* 기본정보 수정 */}
        <div className="border w-[450px] p-6 rounded-xl shadow-md bg-white space-y-6 flex flex-col">
          <h4 className="text-xl font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" /> 기본정보 수정
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
            <div className="md:col-span-1">
              <span className="mb-1 text-sm font-medium text-gray-600">
                이름
              </span>
              <input
                type="text"
                name="username"
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                value={editData.username}
                onChange={handleChange}
                disabled={isUpdating}
              />
            </div>
            <div className="md:col-span-1">
              <span className="mb-1 text-sm font-medium text-gray-600">
                연락처
              </span>
              <input
                type="tel"
                name="userphone"
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                value={editData.userphone}
                onChange={handleChange}
                disabled={isUpdating}
              />
            </div>
            <div className="md:col-span-2">
              <span className="mb-1 text-sm font-medium text-gray-600">
                이메일
              </span>
              <input
                type="email"
                name="useremail"
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                value={editData.useremail}
                onChange={handleChange}
                disabled={isUpdating}
              />
            </div>
            <div className="md:col-span-2">
              <span className="mb-1 text-sm font-medium text-gray-600">
                주민등록번호
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  inputMode="numeric"
                  name="residentNo1"
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
            <div className="md:col-span-2">
              <span className="mb-1 text-sm font-medium text-gray-600">
                주소
              </span>
              <input
                type="text"
                name="address"
                className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500"
                value={editData.address}
                onChange={handleChange}
                disabled={isUpdating}
              />
            </div>
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

          <button
            onClick={handleUpdateInfo}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 mt-auto"
            disabled={isUpdating}
          >
            {isUpdating ? "저장 중..." : "변경 사항 저장"}
          </button>
        </div>

        {/* 비밀번호 변경 */}
        <div className="space-y-8 w-[360px]">
          {currentUser && (
            <div className="border p-6 rounded-xl shadow-md bg-white">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-red-600" /> 비밀번호 변경
              </h4>

              {/* 소셜 로그인 시 안내 문구 */}
              {isSocialLogin && (
                <p className="text-red-500 text-sm font-bold mb-4">
                  * 소셜로그인 기능에서는 비밀번호 변경을 지원하지 않습니다
                </p>
              )}

              <span className="mb-1 text-sm font-medium text-gray-600">
                현재 비밀번호
              </span>
              <PasswordInput
                name="currentPassword"
                placeholder="현재 비밀번호를 입력하세요"
                value={editData.currentPassword}
                onChange={handleChange}
                disabled={isUpdating || isSocialLogin} // 소셜 로그인이면 비활성화
                showPasswordState={showPassword}
                toggleVisibilityHandler={togglePasswordVisibility}
              />
              <span className="mb-1 text-sm font-medium text-gray-600">
                새 비밀번호
              </span>
              <PasswordInput
                name="newPassword"
                placeholder="새 비밀번호 (4글자 이상)"
                value={editData.newPassword}
                onChange={handleChange}
                disabled={isUpdating || isSocialLogin} // 소셜 로그인이면 비활성화
                showPasswordState={showPassword}
                toggleVisibilityHandler={togglePasswordVisibility}
              />
              <span className="mb-1 text-sm font-medium text-gray-600">
                새 비밀번호 확인
              </span>
              <PasswordInput
                name="confirmPassword"
                placeholder="새 비밀번호를 다시 입력하세요"
                value={editData.confirmPassword}
                onChange={handleChange}
                disabled={isUpdating || isSocialLogin} // 소셜 로그인이면 비활성화
                showPasswordState={showPassword}
                toggleVisibilityHandler={togglePasswordVisibility}
              />
              <button
                onClick={handleChangePassword}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg disabled:bg-gray-400"
                disabled={isUpdating || isSocialLogin} // 소셜 로그인이면 비활성화
              >
                {isUpdating ? "변경 중..." : "비밀번호 변경"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfoEdit;
