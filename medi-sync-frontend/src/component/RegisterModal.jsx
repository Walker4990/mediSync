import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import useModal from "./ModalContext";

const API_URL = "http://localhost:8080/api/users";

export default function RegisterModal() {
  const {
    openLoginModal,
    isModalOpen: isOpen,
    closeModal: onClose,
  } = useModal();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    loginId: "",
    password: "",
    confirmPassword: "",
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");

  // 아이디 중복 확인 관련 상태
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [isCheckingId, setIsCheckingId] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        phone: "",
        email: "",
        loginId: "",
        password: "",
        confirmPassword: "",
      });
      setIsAgreed(false);
      setMessage("");
      setIdCheckMessage("");
      setIsIdAvailable(null);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // 휴대폰 번호 자동 포맷팅
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, ""); // 숫자만 추출
      // 하이픈 자동 삽입
      if (onlyNums.length <= 3) {
        newValue = onlyNums;
      } else if (onlyNums.length <= 7) {
        newValue = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      } else {
        newValue = `${onlyNums.slice(0, 3)}-${onlyNums.slice(
          3,
          7
        )}-${onlyNums.slice(7, 11)}`;
      }
    }

    const newForm = { ...form, [name]: value };
    setForm(newForm);

    // 아이디 입력 변경 시 중복확인 초기화
    if (name === "loginId") {
      setIsIdAvailable(null);
      setIdCheckMessage("");
    }

    // 비밀번호 일치 검사
    const currentPassword = name === "password" ? value : newForm.password;
    const currentConfirmPassword =
      name === "confirmPassword" ? value : newForm.confirmPassword;

    if (currentPassword && currentConfirmPassword) {
      if (currentPassword !== currentConfirmPassword) {
        setPasswordMatchError("비밀번호가 일치하지 않습니다.");
      } else {
        setPasswordMatchError("");
      }
    } else {
      setPasswordMatchError("");
    }
  };

  // 아이디 중복 확인 함수
  const handleCheckLoginId = async () => {
    if (!form.loginId.trim()) {
      setIdCheckMessage("⚠️ 아이디를 입력해주세요.");
      setIsIdAvailable(false);
      return;
    }

    setIsCheckingId(true);
    setIdCheckMessage("");
    try {
      const res = await axios.get(`${API_URL}/check-id`, {
        params: { loginId: form.loginId },
      });

      if (res.data.available) {
        setIsIdAvailable(true);
        setIdCheckMessage("✅ 사용 가능한 아이디입니다.");
      } else {
        setIsIdAvailable(false);
        setIdCheckMessage("❌ 이미 사용 중인 아이디입니다.");
      }
    } catch (err) {
      setIsIdAvailable(false);
      setIdCheckMessage("⚠️ 서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsCheckingId(false);
    }
  };

  // 모달이 닫혀 있으면 렌더링하지 않음
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 휴대폰 번호 정규식 검사
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(form.phone)) {
      alert(
        "⚠️ 휴대폰 번호를 올바른 형식으로 입력해주세요. (예: 010-1234-5678)"
      );
      return;
    }

    if (passwordMatchError) {
      alert("⚠️ 비밀번호 일치 여부를 확인해 주세요.");
      return;
    }
    if (!form.password || !form.confirmPassword) {
      alert("⚠️ 비밀번호를 입력해 주세요.");
      return;
    }
    if (!isAgreed) {
      setMessage("⚠️ 이용 약관에 동의해야 합니다.");
      return;
    }
    if (!form.name || !form.phone || !form.loginId) {
      alert("⚠️ 모든 필수 정보를 입력해 주세요.");
      return;
    }
    if (isIdAvailable === null) {
      alert("⚠️ 아이디 중복 확인을 해주세요.");
      return;
    }
    if (isIdAvailable === false) {
      alert("⚠️ 이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.");
      return;
    }

    const dataToSend = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      loginId: form.loginId,
      password: form.password,
    };

    try {
      const res = await axios.post(API_URL, dataToSend);

      if (res.status === 201 && res.data.success) {
        alert(
          res.data.message || "회원가입이 완료되었습니다. 로그인해 주세요."
        );
        setForm({
          name: "",
          phone: "",
          email: "",
          loginId: "",
          password: "",
          confirmPassword: "",
        });
        setPasswordMatchError("");
        onClose();
      } else {
        alert(
          "⚠️ 등록 실패: " +
            (res.data.message || "알 수 없는 오류가 발생했습니다.")
        );
      }
    } catch (err) {
      let errorMessage = "네트워크 연결 또는 서버 오류가 발생했습니다.";

      if (err.response) {
        const errorData = err.response.data;
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = `서버 오류 (${err.response.status})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`⚠️ ${errorMessage}`);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    onClose();
    openLoginModal();
  };

  const inputStyle =
    "w-full h-12 border border-gray-300 px-4 py-2 text-base rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 placeholder-gray-400";
  const errorInputStyle =
    "w-full h-12 border border-red-500 px-4 py-2 text-base rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-500 transition duration-150 placeholder-gray-400";

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex justify-center items-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-0 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-8 px-8 pb-4 relative text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
          <div className="text-3xl font-extrabold text-blue-600 mb-1">
            MediSync
          </div>
          <div className="text-sm text-gray-600 mb-4">
            통합 병원 업무 시스템
          </div>
        </div>
        <hr className="mb-6 mx-8" />

        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <label className="block">
              <span className="block text-gray-700 font-medium text-sm mb-1 text-left pl-2">
                이름
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputStyle}
                placeholder="사용자 이름 입력"
                required
              />
            </label>

            {/* 전화번호 */}
            <label className="block">
              <span className="block text-gray-700 font-medium text-sm mb-1 text-left pl-2">
                전화번호
              </span>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputStyle}
                placeholder="휴대폰번호 입력 (예: 010-1234-5678)"
                required
              />
            </label>

            {/* 이메일 */}
            <label className="block">
              <span className="block text-gray-700 font-medium text-sm mb-1 text-left pl-2">
                이메일
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputStyle}
                placeholder="이메일 주소 입력 (예: admin@medisync.com)"
                required
              />
            </label>

            {/* 아이디 + 중복확인 */}
            <label className="block">
              <span className="block text-gray-700 font-medium text-sm mb-1 text-left pl-2">
                아이디
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="loginId"
                  value={form.loginId}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="사용자 ID 입력"
                  required
                />
                <button
                  type="button"
                  onClick={handleCheckLoginId}
                  disabled={isCheckingId}
                  className="px-5 h-12 flex-shrink-0 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-700 hover:text-white transition duration-150 disabled:bg-gray-200 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isCheckingId ? "확인 중..." : "중복 확인"}
                </button>
              </div>
              {idCheckMessage && (
                <p
                  className={`mt-1 text-sm ${
                    isIdAvailable ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {idCheckMessage}
                </p>
              )}
            </label>

            {/* 비밀번호 */}
            <label className="block">
              <span className="block text-gray-700 font-medium text-sm mb-1 text-left pl-2">
                비밀번호
              </span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={inputStyle}
                placeholder="비밀번호 입력"
                required
              />
            </label>

            {/* 비밀번호 확인 */}
            <label className="block mb-6">
              <span className="block text-gray-700 font-medium text-sm mb-1 text-left pl-2">
                비밀번호 확인
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={passwordMatchError ? errorInputStyle : inputStyle}
                placeholder="비밀번호 재입력"
                required
              />
              {passwordMatchError && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordMatchError}
                </p>
              )}
            </label>

            {/* 약관 동의 */}
            <div className="flex items-center pt-2">
              <input
                id="agreement"
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="agreement"
                className="ml-2 block text-sm text-gray-900 select-none"
              >
                <span className="font-semibold text-blue-600">
                  이용약관 및 개인정보 처리방침
                </span>
                에 동의합니다. (필수)
              </label>
            </div>

            {message && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-left">
                {message}
              </div>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transition duration-300
                disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
              disabled={
                !!passwordMatchError || !form.password || !form.confirmPassword
              }
            >
              가입하기
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            이미 계정이 있으신가요?
            <button
              onClick={handleLoginClick}
              className="text-blue-600 hover:text-blue-800 font-medium ml-2"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
