import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
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
} from "lucide-react";
import Footer from "../../component/Footer";
import Navbar from "../../component/Navbar";

// 회원정보 수정 탭
const UserInfoEdit = () => {
  const [isStaff, setIsStaff] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [checkResult, setCheckResult] = useState("");

  const handleStaffCheck = async () => {
    if (!staffId) {
      setCheckResult("사번을 입력해주세요.");
      return;
    }
    setIsChecking(true);
    setCheckResult("");

    // Mock API call for Staff ID check
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChecking(false);

    if (staffId === "MS999") {
      // Mock Success
      setIsStaff(true);
      setCheckResult("✅ 직원 사번이 확인되었습니다.");
    } else {
      // Mock Failure
      setIsStaff(false);
      setCheckResult("❌ 유효하지 않은 사번입니다.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold border-b pb-2">회원정보 변경</h3>

      {/* 사번 조회 (직원 확인) 기능 */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
        <p className="font-medium text-blue-800 flex items-center">
          <Briefcase className="w-5 h-5 mr-2" /> 직원 인증 (선택 사항)
        </p>
        <div className="flex space-x-3 items-center">
          <input
            type="text"
            placeholder="사번(직원 ID) 입력"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="flex-grow p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={isChecking}
          />
          <button
            onClick={handleStaffCheck}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isChecking}
          >
            {isChecking ? "확인 중..." : "사번 조회"}
          </button>
        </div>
        {checkResult && (
          <p
            className={`text-sm ${isStaff ? "text-green-600" : "text-red-600"}`}
          >
            {checkResult}
          </p>
        )}
      </div>

      {/* 기본 정보 입력 필드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="이름"
          className="p-3 border rounded-lg"
          defaultValue="홍길동"
        />
        <input
          type="tel"
          placeholder="연락처"
          className="p-3 border rounded-lg"
          defaultValue="010-1234-5678"
        />
        <input
          type="email"
          placeholder="이메일"
          className="p-3 border rounded-lg"
          defaultValue="hong@medisync.com"
        />
      </div>

      <button className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">
        정보 변경 저장
      </button>
    </div>
  );
};

// 비밀번호 변경 탭
const PasswordChange = () => (
  <div className="p-6 space-y-6">
    <h3 className="text-xl font-semibold border-b pb-2">비밀번호 변경</h3>
    <input
      type="password"
      placeholder="현재 비밀번호"
      className="w-full p-3 border rounded-lg"
    />
    <input
      type="password"
      placeholder="새 비밀번호 (8자 이상)"
      className="w-full p-3 border rounded-lg"
    />
    <input
      type="password"
      placeholder="새 비밀번호 확인"
      className="w-full p-3 border rounded-lg"
    />
    <button className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition flex items-center justify-center">
      <Lock className="w-5 h-5 mr-2" /> 비밀번호 변경
    </button>
  </div>
);

// 알림 설정 on/off 탭
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
        <Bell className="w-5 h-5 mr-2" /> 알림 수신 설정
      </h3>
      <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
        <SettingToggle label="이메일 알림 (진료/예약 관련)" keyName="email" />
        <SettingToggle label="문자(SMS) 알림 (긴급 정보)" keyName="sms" />
        <SettingToggle label="푸시 알림 (앱 사용 시)" keyName="push" />
        <SettingToggle label="마케팅 정보 수신 (선택)" keyName="marketing" />
      </div>
      <p className="text-sm text-gray-500 pt-2">
        필수 알림(법적 의무 사항 등)은 미수신 설정과 관계없이 발송될 수
        있습니다.
      </p>
    </div>
  );
};

// 환자 기록 탭
const PatientRecords = ({ title, icon: Icon }) => (
  <div className="p-6 space-y-4">
    <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
      <Icon className="w-5 h-5 mr-2" /> {title}
    </h3>
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {[
          "2025-10-15 외과 진료",
          "2025-09-20 내과 진료",
          "2025-08-01 건강 검진",
        ].map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center p-4 hover:bg-gray-50 transition cursor-pointer"
          >
            <span>{item}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </li>
        ))}
      </ul>
    </div>
    <button className="w-full py-2 border border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition">
      더 많은 기록 보기
    </button>
  </div>
);

// 실시간 상담 아이콘 -> 클릭 시 채팅 시작 (임의 구현)
const ChatFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-20">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <header className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <span className="font-semibold">실시간 상담</span>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </header>
          <div className="flex-grow p-4 overflow-y-auto text-sm text-gray-600">
            {/* Chat Messages Mock */}
            <p className="mb-2 text-right">안녕하세요, 무엇을 도와드릴까요?</p>
            <p className="mb-2 text-left bg-gray-100 p-2 rounded-lg inline-block">
              예약 변경 문의드립니다.
            </p>
          </div>
          <footer className="p-3 border-t">
            <input
              type="text"
              placeholder="메시지 입력..."
              className="w-full p-2 border rounded-lg"
            />
          </footer>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-green-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition transform hover:scale-105"
        title="실시간 상담"
      >
        <MessageSquare className="w-7 h-7" />
      </button>
    </div>
  );
};

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------

const MyPage = () => {
  // 사용자의 현재 탭 상태 관리
  const [activeTab, setActiveTab] = useState("info_edit");

  // 마이페이지 메뉴 정의
  // 환자 ID에 해당하는 메뉴들은 'patient' 그룹으로 묶음
  const menuItems = useMemo(
    () => [
      {
        id: "info_edit",
        label: "회원 정보 변경",
        icon: User,
        group: "profile",
      },
      {
        id: "password_change",
        label: "비밀번호 변경",
        icon: Lock,
        group: "profile",
      },
      {
        id: "notification_settings",
        label: "알림 수신 설정",
        icon: Bell,
        group: "profile",
      },

      {
        id: "med_records",
        label: "진료 기록 조회",
        icon: FileText,
        group: "patient",
      },
      {
        id: "reservations",
        label: "예약 조회 및 변경",
        icon: Calendar,
        group: "patient",
      },
      { id: "tests", label: "검사 결과 조회", icon: Search, group: "patient" },
      {
        id: "insurance_payment",
        label: "보험/수납 관련",
        icon: Wallet,
        group: "patient",
      },
    ],
    []
  );

  // 탭 콘텐츠 맵핑
  const renderContent = () => {
    switch (activeTab) {
      case "info_edit":
        return <UserInfoEdit />;
      case "password_change":
        return <PasswordChange />;
      case "notification_settings":
        return <NotificationSettings />;
      case "med_records":
        return <PatientRecords title="진료 기록" icon={FileText} />;
      case "reservations":
        return <PatientRecords title="예약 조회 및 변경" icon={Calendar} />;
      case "tests":
        return <PatientRecords title="검사 결과 조회" icon={Search} />;
      case "insurance_payment":
        return <PatientRecords title="보험/수납 내역" icon={Wallet} />;
      default:
        return <div className="p-6 text-gray-500">선택된 메뉴가 없습니다.</div>;
    }
  };

  // 현재 선택된 메뉴 항목의 라벨을 헤더에 표시
  const activeLabel =
    menuItems.find((item) => item.id === activeTab)?.label || "마이페이지";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 font-pretendard">
        {/* 상단 섹션 */}
        <section className="px-4 md:px-8 pt-12 pb-16 bg-gradient-to-l from-white to-sky-100 shadow-inner">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">
              환영합니다, <span className="text-blue-600">홍길동</span> 님!
            </h1>
            <p className="text-gray-500 mt-1">
              이곳에서 당신의 정보를 안전하게 관리하고 기록을 확인하세요.
            </p>
          </div>
        </section>

        {/* 메인 콘텐츠 영역 (사이드바 + 내용) */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row mt-8 px-4 md:px-8">
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
              <p className="text-sm font-bold text-gray-500 uppercase mt-6 mb-2 border-b pb-1">
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
              <h2 className="text-2xl font-bold text-gray-700">
                {activeLabel}
              </h2>
            </header>
            {renderContent()}
          </main>
        </div>
      </div>
      <ChatFloatingButton /> {/* 실시간 상담 아이콘 */}
      <Footer />
    </div>
  );
};

export default MyPage;
