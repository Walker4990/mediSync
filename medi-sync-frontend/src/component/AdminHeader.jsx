import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { useNotifications } from "../context/NotificationContext";
import { Bell } from "lucide-react";
import axios from "axios";

export default function AdminHeader() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [adminName, setAdminName] = useState("관리자");
  const [adminId, setAdminId] = useState(null);
  const navigate = useNavigate();

  // 🔔 알림 애니메이션 효과
  useEffect(() => {
    if (unreadCount > 0) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // 전역 Axios 인터셉터 설정 (모든 페이지 적용)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, // 정상 응답은 그대로 반환
      (error) => {
        // 401(인증 실패) 또는 403(권한 없음) 에러 감지
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          // 중복 알림 방지를 위해 현재 경로가 이미 로그인 페이지가 아닐 때만 실행
          if (window.location.pathname !== "/admin") {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");

            // 로그아웃 처리 (토큰 및 정보 삭제)
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_data");
            delete axios.defaults.headers.common["Authorization"];

            // 로그인 페이지로 강제 이동
            navigate("/admin");
          }
        }
        return Promise.reject(error);
      }
    );

    // 컴포넌트 언마운트 시 인터셉터 제거 (메모리 누수 방지)
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // 컴포넌트 마운트 시 관리자 정보 불러오기
  useEffect(() => {
    const fetchAdminInfo = async () => {
      const storedData = localStorage.getItem("admin_data");

      if (storedData) {
        const admin = JSON.parse(storedData);
        setAdminName(admin.name || "관리자");
        setAdminId(admin.adminId);
      } else {
        try {
          // 토큰은 있는데 데이터가 없는 경우 API 호출
          const token = localStorage.getItem("admin_token");
          if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const response = await axios.get("/api/admins/mypage");
            if (response.data && response.data.name) {
              setAdminName(response.data.name);
              setAdminId(response.data.adminId);
              localStorage.setItem("admin_data", JSON.stringify(response.data));
            }
          }
        } catch (error) {
          console.error("관리자 정보 로드 실패:", error);
        }
      }
    };
    fetchAdminInfo();
  }, []);

  // 로그아웃 함수
  const handleLogout = () => {
    const confirmLogout = window.confirm("정말 로그아웃 하시겠습니까?");
    if (confirmLogout) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_data");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/admin");
    }
  };

  const styledAdminTitle = (
    <span className="flex items-center space-x-1 text-sm">
      <span className="font-semibold text-white text-base">{adminName}</span>
      <span className="text-blue-200">님</span>
    </span>
  );

  const handleMyPageClick = () => {
    if (adminId) {
      navigate(`/admin/mypage`);
    } else {
      alert("관리자 정보를 찾을 수 없습니다.");
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-md fixed top-0 left-0 w-full z-50 font-pretendard">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-3">
        {/* 로고 */}
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
              { name: "대시보드 (관리자전용)", href: "/admin/dashboard/hr" },
            ]}
          />
          <Link to="/admin/insurance" className="hover:text-blue-200">
            보험관리
          </Link>
        </nav>

        {/* 우측 사용자 + 알림 */}
        <div className="flex items-center gap-6 relative">
          {/* 알림 아이콘 */}
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

          {/* 알림 드롭다운 */}
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
          <DropdownMenu
            title={styledAdminTitle}
            items={[
              { name: "사원등록", href: "/admin/register" },
              { name: "마이페이지", onClick: handleMyPageClick },
            ]}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
