import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { useNotifications } from "../context/NotificationContext";
import { Bell } from "lucide-react"; // ✅ 추가

export default function AdminHeader() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (unreadCount > 0) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <header className="bg-blue-600 text-white shadow-md fixed top-0 left-0 w-full z-50 font-pretendard">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-3">
        {/* 로고 / 타이틀 */}
        <Link to="/admin/main" className="text-xl font-bold tracking-wide">
          MediSync <span className="text-blue-200">Admin</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex gap-6 text-sm">
          <Link to="/admin/drug" className="hover:text-blue-200">
            약품관리
          </Link>
          <Link to="/admin/medicalRecord" className="hover:text-blue-200">
            진료관리
          </Link>
          <DropdownMenu
            title="검사관리"
            items={[
              { name: "영상 검사", href: "/admin/test/imaging" },
              { name: "내시경/초음파 검사", href: "/admin/test/endoscope" },
              { name: "기초 검사", href: "/admin/test/basic" },
              { name: "기타 검사", href: "/admin/test/other" },
            ]}
          />
          <Link to="/admin/operation" className="hover:text-blue-200">
            수술관리
          </Link>
          <DropdownMenu
            title="고객관리"
            items={[
              { name: "환자정보", href: "/admin/patients" },
              { name: "진료내역", href: "/admin/history" },
              { name: "입원관리", href: "/admin/admission" },
              { name: "실시간 상담", href: "/admin/chat" },
            ]}
          />
          <DropdownMenu
            title="인사관리"
            items={[
              { name: "의사정보", href: "/admin/doctor" },
              { name: "의료진정보", href: "/admin/staff" },
              { name: "일정확인", href: "/admin/schedule" },
            ]}
          />
          <Link to="/admin/insurance" className="hover:text-blue-200">
            보험관리
          </Link>
          <Link to="/admin/finance" className="hover:text-blue-200">
            회계관리
          </Link>
        </nav>

        {/* 우측 사용자 + 알림 */}
        <div className="flex items-center gap-6 relative">
          {/* 🔔 알림 아이콘 */}
          <div
            className="relative cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {/* 드롭다운 */}
          {open && (
            <div className="absolute right-0 top-8 bg-white text-gray-800 shadow-lg rounded-lg w-72 overflow-hidden z-50">
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <span className="font-semibold">알림 ({unreadCount})</span>
                <button
                  onClick={markAllRead}
                  className="text-blue-500 text-xs hover:underline"
                >
                  모두 읽음
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-2 border-b hover:bg-gray-100 text-sm"
                    >
                      <p className="font-medium">{n.patientName}</p>
                      <p className="text-gray-500 text-xs">
                        {n.message || n.testName}
                      </p>
                      <p className="text-gray-400 text-xs">{n.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-400 text-sm">
                    새 알림이 없습니다
                  </div>
                )}
              </div>
            </div>
          )}

          <Link to="/admin/register" className="text-sm text-blue-100">
            관리자
          </Link>
          <Link
            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
            to="/admin"
          >
            로그아웃
          </Link>
        </div>
      </div>
    </header>
  );
}
