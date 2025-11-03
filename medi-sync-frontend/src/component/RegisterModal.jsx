import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useModal } from "./ModalContext";

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
    loginId: "",
    password: "",
    confirmPassword: "",
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [message, setMessage] = useState("");
  // 비밀번호 일치 오류 메시지 상태
  const [passwordMatchError, setPasswordMatchError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        phone: "",
        loginId: "",
        password: "",
        confirmPassword: "",
      });
      setIsAgreed(false);
      setMessage("");
    }
  }, [isOpen]); // isOpen 상태가 바뀔 때마다 실행

  const handleChange = (e) => {
    const { name, value } = e.target;

    const newForm = {
      ...form,
      [name]: value,
    };
    setForm(newForm);

    // 비밀번호 변경 시 실시간 일치 검사 로직
    const currentPassword = name === "password" ? value : newForm.password;
    const currentConfirmPassword =
      name === "confirmPassword" ? value : newForm.confirmPassword;

    if (currentPassword && currentConfirmPassword) {
      if (currentPassword !== currentConfirmPassword) {
        setPasswordMatchError("비밀번호가 일치하지 않습니다.");
      } else {
        setPasswordMatchError(""); // 일치하면 오류 메시지 제거
      }
    } else {
      setPasswordMatchError(""); // 둘 중 하나가 비어있으면 오류 메시지 제거
    }
  };

  // 모달이 닫혀 있으면 렌더링하지 않음
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 오류/미입력 시 리턴
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

    // 모든 필수 필드 검사
    if (!form.name || !form.phone || !form.loginId) {
      alert("⚠️ 모든 필수 정보를 입력해 주세요.");
      return;
    }

    const dataToSend = {
      name: form.name,
      phone: form.phone,
      loginId: form.loginId,
      password: form.password,
    };

    try {
      const res = await axios.post(API_URL, dataToSend);

      if (res.status === 201 && res.data.success) {
        alert(
          res.data.message || "회원가입이 완료되었습니다. 로그인해 주세요."
        );

        // 폼 초기화 및 모달 닫기
        setForm({
          name: "",
          phone: "",
          loginId: "",
          password: "",
          confirmPassword: "",
        });
        setPasswordMatchError("");
        onClose(); // 성공 시 모달 닫기
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
          errorMessage = `서버 오류 (${err.response.status}): 요청에 실패했습니다.`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`⚠️ ${errorMessage}`);
    }
  };

  // 로그인 링크 클릭 시 회원가입 모달을 닫고 로그인 모달을 열기
  const handleLoginClick = (e) => {
    e.preventDefault();
    onClose(); // 회원가입 모달 닫기
    openLoginModal(); // 로그인 모달 열기
  };

  const inputStyle =
    "w-full **h-12** border **border-gray-300** px-4 py-2 **text-base** rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 **placeholder-gray-400**";
  const errorInputStyle =
    "w-full **h-12** border **border-red-500** px-4 py-2 **text-base** rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-500 transition duration-150 **placeholder-gray-400**";

  return (
    // 모달 배경 오버레이
    <div
      className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex justify-center items-center backdrop-blur-sm p-4 transition-opacity duration-300"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      {/* 모달 컨테이너 */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md **p-0** max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 배경 닫힘 방지
      >
        <div className="pt-8 px-8 pb-4 relative text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
          <div className="text-3xl font-extrabold text-blue-600 mb-1 tracking-tight">
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
                placeholder="숫자만 입력 (예: 01012345678)"
                required
              />
            </label>

            {/* 아이디 (loginId) */}
            <label className="block">
              <span className="block text-gray-700 font-medium text-sm mb-1 text-left pl-2">
                아이디
              </span>
              <input
                type="text"
                name="loginId"
                value={form.loginId}
                onChange={handleChange}
                className={inputStyle}
                placeholder="사용자 ID 입력"
                required
              />
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
              {/* 오류 메시지 출력 */}
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

            {/* 메시지 박스 (일반 메시지) */}
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
          {/* 로그인 링크 */}
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
