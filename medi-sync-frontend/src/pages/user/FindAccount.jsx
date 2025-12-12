import React, { useState } from "react";
import axios from "axios";

// 아이디 찾기
const FindIdForm = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      setMessage("이름과 연락처를 모두 입력해주세요.");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      // 백엔드에서는 name과 phone을 받아 일치하는 사용자의 아이디를 반환
      const response = await axios.post(
        "http://192.168.0.24:8080/api/users/find-id",
        { name, phone }
      );
      setMessage(`회원님의 아이디는 [${response.data.loginId}] 입니다.`);
      setIsError(false);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "일치하는 사용자가 없습니다.";
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 border rounded-xl bg-blue-50/50"
    >
      <h4 className="text-lg font-bold mb-4 text-blue-600">🙋‍♂️ 아이디 찾기</h4>
      <p className="mb-4">이름과 연락처를 입력하시면 아이디를 알려드립니다.</p>
      <input
        type="text"
        placeholder="이름"
        className="w-full p-3 mb-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="연락처 ('-' 제외)"
        className="w-full p-3 mb-4 border rounded"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? "찾는 중..." : "아이디 찾기"}
      </button>

      {message && (
        <p
          className={`mt-4 text-center ${
            isError ? "text-red-500" : "text-blue-700"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

// 비밀번호 찾기
const ResetPasswordForm = () => {
  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !name || !phone) {
      setMessage("아이디, 이름, 연락처를 모두 입력해주세요.");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      // 백엔드에서는 이 3가지 정보로 본인 확인 후, 가입된 이메일로 임시 비번 발송
      const response = await axios.post(
        "http://192.168.0.24:8080/api/users/temp-password",
        {
          loginId,
          name,
          phone,
        }
      );

      setMessage(
        response.data.message || "가입된 이메일로 임시 비밀번호를 발송했습니다."
      );
      setIsError(false);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "일치하는 사용자 정보가 없습니다.";
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 border rounded-xl bg-orange-50/50"
    >
      <h4 className="text-lg font-bold mb-4 text-orange-600">
        🔑 비밀번호 찾기
      </h4>
      <p className="mb-4">
        아이디, 이름, 연락처를 입력하여 본인 확인 후
        <br />
        가입 시 등록한 이메일로 임시 비밀번호를 발송해 드립니다.
      </p>
      <input
        type="text"
        placeholder="아이디"
        className="w-full p-3 mb-2 border rounded"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
      />
      <input
        type="text"
        placeholder="이름"
        className="w-full p-3 mb-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type_
        placeholder="연락처 ('-' 제외)"
        className="w-full p-3 mb-4 border rounded"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        type="submit"
        className="w-full bg-orange-500 text-white p-3 rounded hover:bg-orange-600 transition disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? "확인 중..." : "본인 확인 및 임시 비밀번호 발송"}
      </button>

      {message && (
        <p
          className={`mt-4 text-center ${
            isError ? "text-red-500" : "text-blue-700"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

// 회원탈퇴
const WithdrawForm = () => (
  <div className="p-8 border rounded-xl bg-red-50/50">
    <h4 className="text-lg font-bold mb-4 text-red-600">🏃‍♀️ 회원 탈퇴</h4>
    <p className="mb-4 text-red-700 font-medium">
      탈퇴를 원하시면 계정 정보를 입력해주세요. 탈퇴 시 모든 정보는 삭제됩니다.
    </p>
    <input
      type="text"
      placeholder="아이디"
      className="w-full p-3 mb-2 border rounded"
    />
    <input
      type="password"
      placeholder="비밀번호"
      className="w-full p-3 mb-4 border rounded"
    />
    <button className="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600 transition">
      회원 탈퇴 진행
    </button>
  </div>
);

// main
export default function FindAccount() {
  const [selectedService, setSelectedService] = useState(null);

  const serviceCards = [
    {
      key: "findId",
      title: "아이디 찾기",
      desc: "계정을 잊으셨다면?",
      icon: "🙋‍♂️",
    },
    {
      key: "resetPw",
      title: "비밀번호 찾기",
      desc: "비밀번호를 잊으셨다면?",
      icon: "🔑",
    },
    {
      key: "withdraw",
      title: "회원 탈퇴",
      desc: "서비스 이용을 중단하시겠어요?",
      icon: "🏃‍♀️",
    },
  ];

  return (
    <div className="font-pretendard">
      <section className="max-w-6xl mx-auto py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {serviceCards.map((card) => (
            <div
              key={card.key}
              onClick={() => setSelectedService(card.key)}
              className={`
                                w-full max-w-sm cursor-pointer transition
                                bg-white shadow-md rounded-2xl p-8 text-center
                                hover:shadow-lg hover:border-blue-500 border-2 border-transparent
                                ${
                                  selectedService === card.key
                                    ? "shadow-xl border-blue-500 scale-105"
                                    : ""
                                }
                            `}
            >
              <div className="text-5xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto pb-16 px-8">
        {/* 조건부 렌더링 */}
        {selectedService === "findId" && <FindIdForm />}
        {selectedService === "resetPw" && <ResetPasswordForm />}
        {selectedService === "withdraw" && <WithdrawForm />}
        {!selectedService && (
          <div className="text-center text-gray-500 p-10 border-2 border-dashed rounded-xl">
            원하는 서비스 카드를 클릭하여 찾기/변경을 진행하세요.
          </div>
        )}
      </section>
    </div>
  );
}
