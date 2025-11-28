import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
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
import "../../style/calendar.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import SupportChatWidget from "./SupportChatPage";
import PatientInsurancePage from "./PatientInsurancePage";
import PaymentPage from "../../component/PaymentPage";
import UserInfoEdit from "../../component/UserInfoEdit";

const token = localStorage.getItem("token");
const decoded = token ? jwtDecode(token) : null;
const patientId = decoded?.userId || null;
const API_BASE_URL = "http://192.168.0.24:8080/api/notification";
const API_TEST_URL = "http://localhost:8080/api/notification";

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
