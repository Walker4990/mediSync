import { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../component/AdminHeader";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

import "../../style/calendar.css";

export default function AdminSchedule() {
  const ScheduleHeader = () => {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");

    // 초기 데이터 불러오기
    useEffect(() => {
      fetchPatients();
    }, []);

    const fetchPatients = async () => {
      try {
        const res = await axios.get("http://192.168.0.24:8080/api/patients");
        setPatients(res.data);
      } catch (err) {
        console.error("환자 조회 실패:", err);
      }
    };

    return (
      <div className="bg-gray-50 min-h-screen font-pretendard">
        {/* 상단 고정 관리자 헤더 */}
        <AdminHeader />

        {/* 컨텐츠 영역 */}
        <main className="max-w-7xl mx-auto pt-24 px-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-8">
            예약일정확인
          </h1>

          <ViewReservation title="예약일정" icon={() => <></>} />
        </main>
      </div>
    );
  };

  // 환자 일정 탭
  const ViewReservation = ({ title, icon: Icon }) => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    // 로그인 유저 임시 번호
    const fetchCalendarData = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/calendar/all`);
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
        <div className="bg-white rounded-lg shadow-md p-2 h-[850px]">
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
            height="100%"
          ></FullCalendar>
        </div>
        {/* 기존 상세 모달 */}
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
                {/* 버튼 */}
                <div className="flex justify-end space-x-3 pt-4">
                  {new Date(selectedEvent.start) > new Date() && (
                    <button
                      onClick={() => {
                        setIsCancelModalOpen(true);
                        setIsCalendarModalOpen(false);
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

        {/*취소 사유 입력 모달 */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[420px] rounded-2xl shadow-xl p-6 space-y-4 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800">
                예약 취소 사유 입력
              </h2>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="취소 사유를 입력하세요"
                className="w-full border border-gray-300 rounded-md p-3 h-32 focus:outline-none focus:ring2  focus:ring-blue-400 resize-none"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setCancelReason("");
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={async () => {
                    if (!cancelReason.trim()) {
                      alert("취소 사유를 입력해주세요.");
                      return;
                    }
                    try {
                      await axios.put(
                        `http://localhost8080/api/calendar/admin/cancel`,
                        null,
                        {
                          params: {
                            id: selectedEvent.id,
                            type: selectedEvent.type,
                            startDate: selectedEvent.start,
                            reason: cancelReason,
                          },
                        }
                      );
                      alert("예약이 취소되었습니다.");
                      setIsCancelModalOpen(false);
                      setCancelReason("");
                      await fetchCalendarData();
                    } catch (error) {
                      console.error("예약 취소 오류 :", error);
                      alert("예약 취소 중 오류가 발생했습니다.");
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  제출
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <ScheduleHeader />
    </div>
  );
}
