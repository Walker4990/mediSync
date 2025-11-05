import React, { useState } from "react";

// 아이디 찾기
const FindIdForm = () => (
  <div className="p-8 border rounded-xl bg-blue-50/50">
    <h4 className="text-lg font-bold mb-4 text-blue-600">🙋‍♂️ 아이디 찾기</h4>
    <p className="mb-4">이름과 연락처를 입력하시면 아이디를 알려드립니다.</p>
    <input
      type="text"
      placeholder="이름"
      className="w-full p-3 mb-2 border rounded"
    />
    <input
      type="text"
      placeholder="연락처"
      className="w-full p-3 mb-4 border rounded"
    />
    <button className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition">
      아이디 찾기
    </button>
  </div>
);

// 비밀번호 찾기
const ResetPasswordForm = () => (
  <div className="p-8 border rounded-xl bg-orange-50/50">
    <h4 className="text-lg font-bold mb-4 text-orange-600">🔑 비밀번호 찾기</h4>
    <p className="mb-4">
      아이디, 이름, 연락처를 입력하여 본인 확인 후 비밀번호를 변경할 수
      있습니다.
    </p>
    <input
      type="text"
      placeholder="아이디"
      className="w-full p-3 mb-2 border rounded"
    />
    <input
      type="text"
      placeholder="이름"
      className="w-full p-3 mb-2 border rounded"
    />
    <input
      type="text"
      placeholder="연락처"
      className="w-full p-3 mb-4 border rounded"
    />
    <button className="w-full bg-orange-500 text-white p-3 rounded hover:bg-orange-600 transition">
      본인 확인
    </button>
  </div>
);

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

export default function UserHome() {
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

      {/* --- 입력창 섹션 --- */}
      <section className="max-w-4xl mx-auto pb-16 px-8">
        {/* 조건부 렌더링 */}
        {selectedService === "findId" && <FindIdForm />}
        {selectedService === "resetPw" && <ResetPasswordForm />}
        {selectedService === "withdraw" && <WithdrawForm />}{" "}
        {!selectedService && (
          <div className="text-center text-gray-500 p-10 border-2 border-dashed rounded-xl">
            원하는 서비스 카드를 클릭하여 찾기/변경을 진행하세요.
          </div>
        )}
      </section>
    </div>
  );
}
