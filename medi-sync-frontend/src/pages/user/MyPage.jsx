import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
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

// 회원정보 수정 탭 - currentUser 데이터를 prop으로 받도록 수정
const UserInfoEdit = ({ currentUser }) => {
  // currentUser가 null 또는 로딩 중일 때를 대비해 기본값 설정
  const initialName = currentUser?.username || "";
  const initialPhone = currentUser?.userphone || "";
  const initialEmail = currentUser?.email || "";

  // isStaff는 role 또는 별도의 플래그로 결정됩니다.
  const [isStaff, setIsStaff] = useState(currentUser?.isStaff || false);
  const [isChecking, setIsChecking] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [checkResult, setCheckResult] = useState(
    isStaff ? "✅ 직원 사번이 확인되었습니다." : ""
  );

  // 폼 상태 (사용자 이름, 연락처, 이메일은 여기서 관리)
  const [formData, setFormData] = useState({
    username: initialName,
    userphone: initialPhone,
    email: initialEmail,
  });

  // currentUser 정보가 업데이트될 때 폼 데이터를 초기화 (로그인 직후 데이터 반영)
  useEffect(() => {
    if (currentUser && typeof currentUser === "object") {
      setFormData({
        username: currentUser.username || "",
        userphone: currentUser.userphone || "",
        email: currentUser.email || "",
      });
      // isStaff 정보도 여기서 업데이트
      setIsStaff(currentUser.isStaff || false);
      if (currentUser.isStaff) {
        setCheckResult("✅ 직원 사번이 확인되었습니다.");
      }
    }
  }, [currentUser]);

  // 사번 조회(직원 인증)
  const handleStaffCheck = async () => {
    if (!staffId) {
      setCheckResult("사번을 입력해주세요.");
      return;
    }
    setIsChecking(true);
    setCheckResult("");

    // 사번 체크 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChecking(false);

    if (staffId === "MS999") {
      // Mock 성공
      setIsStaff(true);
      setCheckResult("✅ 직원 사번이 확인되었습니다.");
    } else {
      // Mock Failure
      setIsStaff(false);
      setCheckResult("❌ 유효하지 않은 사번입니다.");
    }
  };

  // input 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //회원 정보 변경 클릭 시 화면 단
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

      {/* 기본 정보 입력 필드 - currentUser 정보 반영 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="username"
          placeholder="이름"
          className="p-3 border rounded-lg"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="tel"
          name="userphone"
          placeholder="연락처"
          className="p-3 border rounded-lg"
          value={formData.userphone}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="이메일"
          className="p-3 border rounded-lg"
          value={formData.email}
          onChange={handleChange}
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

  let patientId = 1;
  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await axios.put(`http://localhost:8080/api/notification/${patientId}`, {
        key,
        value: newSettings[key],
        setting: newSettings,
      });
    } catch (erorr) {
      console.error("알림설정 업데이트 실패");
    }
  };
  //새로고침 시 가져오기
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
          sms: false,
        });
      } catch (error) {
        console.error("알림 설정 조회 실패 : ", error);
      }
    };

    fatchsettings();
  }, [patientId]);

  //알림설정 css
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
  //알림 설정 화면단
  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
        <Bell className="w-5 h-5 mr-2" /> 알림 수신 설정
      </h3>
      <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
        <SettingToggle label="이메일 알림 (진료/예약 관련)" keyName="email" />
        <SettingToggle label="SMS 수신 동의 (긴습사항)" keyName="sms" />
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

//환자 기록 탭
const PatientRecords = ({ title, icon: Icon }) => {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 5;
  const patientId = 1;

  //진료 기록 불러오기
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

  //진료 상세 페이지 열기
  const openRecordDetail = (recordId) => {
    window.open(
      `/user/medicalDetail/${recordId}`,
      "_blank",
      "width=800,height=600,top=100,left=200,resizable=yes,scrollbars=yes"
    );
  };

  //더보기 버튼
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

  //로그인 유저 임시 번호
  const patient_id = 1;
  const fetchCalendarData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/calendar?patient_id=${patient_id}`
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

  // ----------------------------------------------------
  // Tailwind로 구현된 간단한 달력 그리드 컴포넌트
  // FullCalendar 대신 예약 일정을 표시하기 위해 사용됩니다.
  // ----------------------------------------------------
  const SimpleCalendarGrid = ({ events }) => {
    // 현재 날짜 기준 달력 데이터 생성
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 for Sunday

    const days = [];
    for (let i = 1; i <= daysInMonth(currentYear, currentMonth); i++) {
      days.push(i);
    }

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    // 이벤트 매핑: 이벤트 시작일이 특정 날짜와 일치하는지 확인
    const getEventsForDate = (day) => {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      return events.filter(
        (event) => event.start && event.start.startsWith(dateString)
      );
    };

    return (
      <div className="space-y-4">
        <div className="text-xl font-bold text-center text-gray-700">
          {currentYear}년 {currentMonth + 1}월
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold border-b pb-2">
          {dayNames.map((name, index) => (
            <div
              key={name}
              className={
                index === 0
                  ? "text-red-500"
                  : index === 6
                  ? "text-blue-500"
                  : "text-gray-600"
              }
            >
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 h-[450px]">
          {/* 첫날 공백 패딩 */}
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={`pad-${i}`} className="p-2"></div>
          ))}

          {/* 날짜 셀 */}
          {days.map((day) => {
            const isToday =
              day === today.getDate() && currentMonth === today.getMonth();
            const dayEvents = getEventsForDate(day);

            return (
              <div
                key={day}
                className={`p-1 border rounded-lg overflow-hidden cursor-pointer transition duration-100 ease-in-out ${
                  isToday
                    ? "bg-blue-100 border-blue-500"
                    : "bg-white hover:bg-gray-50"
                } ${
                  dayEvents.length > 0 ? "border-green-400 bg-green-50" : ""
                }`}
              >
                <div
                  className={`text-xs font-bold ${
                    isToday ? "text-blue-800" : "text-gray-800"
                  }`}
                >
                  {day}
                </div>
                {dayEvents.slice(0, 2).map((event, index) => (
                  <p
                    key={index}
                    className="text-[10px] text-left text-green-700 truncate mt-0.5"
                    title={event.title}
                  >
                    • {event.title.substring(0, 10)}
                  </p>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-left text-green-700 mt-0.5">
                    + {dayEvents.length - 2}개
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 환자 일정 탭 - FullCalendar 대신 SimpleCalendarGrid 사용
  const ViewReservation = ({ title, icon: Icon, currentUser }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthString = String(currentMonth + 1).padStart(2, "0");

    // 이벤트 목업 데이터 (SimpleCalendarGrid 테스트용)
    const mockEvents = useMemo(
      () => [
        {
          title: "내과 진료 예약",
          start: `${currentYear}-${monthString}-05`,
          color: "blue",
        },
        {
          title: "건강 검진",
          start: `${currentYear}-${monthString}-15`,
          color: "red",
        },
        {
          title: "약물 수령",
          start: `${currentYear}-${monthString}-15`,
          color: "orange",
        }, // 다중 이벤트 테스트
        {
          title: "정기 검진",
          start: `${currentYear}-${monthString}-15`,
          color: "purple",
        }, // 다중 이벤트 테스트
        {
          title: "재활 치료",
          start: `${currentYear}-${monthString}-28`,
          color: "green",
        },
      ],
      [currentUser]
    );

    const [events, setEvents] = useState(mockEvents);
    const userId = currentUser?.userId;

    useEffect(() => {
      if (!userId) return; // userId가 없으면 API 호출 방지

      // axios를 통한 일정 데이터 호출 로직은 유지 (API가 실제로 작동한다면)
      // 현재는 목업 데이터로 대체되어 있어 이 부분은 테스트되지 않음.
      // axios
      //     .get(`/api/calender/?userId=${userId}`)
      //     .then((res) => {
      //         const formatted = res.data.map((item) => ({
      //             title: item.title,
      //             start: item.startDate,
      //             end: item.startDate,
      //             color: item.color || "blue",
      //         }));
      //         setEvents(formatted);
      //     })
      //     .catch((err) => {
      //         console.log(`[USER_ID: ${userId}] 일정 조회 실패`, err);
      //     });
    }, [userId]);

    return (
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2 flex items-center">
          <Icon className="w-5 h-5 mr-2" /> {title}
        </h3>
        <div className="bg-white rounded-lg shadow-md p-2">
          {!userId ? (
            <p className="text-center text-red-500 py-4">
              사용자 정보를 불러오는 중입니다...
            </p>
          ) : (
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
                  console.warn(
                    "일치하는 이벤트를 찾을 수 없습니다:",
                    info.event
                  );
                }
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
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
          )}
        </div>
        {isCalendarModalOpen && selectedEvent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden  animate-fadeIn ">
              {/*상단 해더 */}
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
              {/*본문 내용*/}
              <div className="p-6 space-y-4">
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">
                      예약종류
                    </span>
                    <span className="text-gray-800">{selectedEvent.type}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">환자</span>
                    <span className="text-gray-800">
                      {selectedEvent.patientName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">
                      담당 의사
                    </span>
                    <span className="text-gray-800">
                      {selectedEvent.doctorName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">아이디</span>
                    <span className="text-gray-800">{selectedEvent.id}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-600">
                      예약 시간
                    </span>
                    <span className="text-gray-800">
                      {selectedEvent.start
                        ? new Date(selectedEvent.start).toLocaleString("ko-KR")
                        : "시간 정보 없음"}
                    </span>
                  </div>
                </div>
                {/*버튼*/}
                <div className="flex justify-end space-x-3 pt-4">
                  {new Date(selectedEvent.start) > new Date() && (
                    <button
                      onClick={async () => {
                        if (!window.confirm("예약을 취소하시겠습니까?")) {
                          return;
                        }
                        try {
                          await axios.delete(
                            `http://localhost:8080/api/calendar`,
                            {
                              params: {
                                id: selectedEvent.id,
                                type: selectedEvent.type,
                                startDate: selectedEvent.start,
                              },
                            }
                          );
                          //모달 닫기
                          alert("예약을 취소하였습니다.");
                          setIsCalendarModalOpen(false);
                          setSelectedEvent(null);

                          //달력 리로드
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
              <p className="mb-2 text-right">
                안녕하세요, 무엇을 도와드릴까요?
              </p>
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
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
      setTimeout(() => {
        setCurrentUser("");
        setIsLoading(false);
      }, 500);
    }, []);

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
          label: "보험/수납 관련",
          icon: Wallet,
          group: "patient",
        },
      ],
      []
    );

    // 탭 콘텐츠 맵핑 - currentUser를 props로 전달
    const renderContent = () => {
      if (isLoading) {
        return (
          <div className="p-10 text-center text-gray-500">
            사용자 정보를 불러오는 중입니다...
          </div>
        );
      }

      switch (activeTab) {
        case "info_edit":
          return <UserInfoEdit currentUser={currentUser} />;
        case "password_change":
          return <PasswordChange />;
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
            <ViewReservation
              title="보험/수납 내역"
              icon={Wallet}
              currentUser={currentUser}
            />
          );
        default:
          return (
            <div className="p-6 text-gray-500">선택된 메뉴가 없습니다.</div>
          );
      }
    };

    // 현재 선택된 메뉴 항목의 라벨을 헤더에 표시
    const activeLabel =
      menuItems.find((item) => item.id === activeTab)?.label || "마이페이지";

    // 사용자 이름이 로딩 중일 때는 '...' 표시, 로딩 완료 후 값이 없으면 '사용자' 표시
    const userName = currentUser?.name || (isLoading ? "..." : "사용자");

    return (
      <div className="font-pretendard">
        {/* 상단 섹션: 사용자 이름 동적 반영 */}
        <section className="pt-12 pb-16 bg-gradient-to-l from-white to-sky-100 shadow-inner">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h1 className="text-3xl font-bold text-gray-800">
              환영합니다, <span className="text-blue-600">{userName}</span> 님!
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
        <ChatFloatingButton /> {/* 실시간 상담 아이콘 */}
      </div>
    );
  };
};
export default MyPage;
