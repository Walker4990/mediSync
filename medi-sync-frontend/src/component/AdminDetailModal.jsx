import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  User,
  Settings,
  Calendar,
  Smartphone,
  Mail,
  Hash,
  Briefcase,
  Building,
} from "lucide-react";

// 직책(Position) 옵션
const POSITION_OPTIONS = [
  { value: "NURSE", label: "간호사" },
  { value: "RADIOLOGIST", label: "방사선사" },
  { value: "LAB_TECH", label: "임상병리사" },
  { value: "ASSISTANT", label: "진료보조" },
  { value: "ADMIN", label: "원무/행정" },
  { value: "DOCTOR", label: "의사" },
];

// 재직 상태(Status) 옵션
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직 중" },
  { value: "LEAVE", label: "휴직" },
  { value: "RETIRED", label: "퇴사" },
];

// 옵션 라벨 헬퍼
const getOptionLabel = (options, value) => {
  const option = options.find((opt) => String(opt.value) === String(value));
  return option ? option.label : value;
};

const AdminDetailModal = ({ isOpen, onClose, adminId }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const API_URL = "http://192.168.0.24:8080/api/admins";
  const DEPT_API_URL = "http://192.168.0.24:8080/api/departments";
  const BASE_URL = "http://192.168.0.24:8080";

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (!isOpen || !adminId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. 부서 정보 로드
        const deptRes = await axios.get(DEPT_API_URL);
        const opts = Array.isArray(deptRes.data)
          ? deptRes.data.map((d) => ({
              value: String(d.deptId),
              label: String(d.deptName),
            }))
          : [];
        setDepartmentOptions(opts);

        // 2. 관리자 상세 정보 로드
        const adminRes = await axios.get(`${API_URL}/${adminId}`);
        setAdmin(adminRes.data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, adminId]);

  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setAdmin(null);
      setLoading(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 값 표시 헬퍼 함수
  const displayValue = (fieldName, options = []) => {
    if (!admin) return "-";
    const value = admin[fieldName];

    if (value === undefined || value === null || value === "") return "-";

    // 옵션 매핑이 필요한 경우
    if (options.length > 0) {
      return getOptionLabel(options, value);
    }

    // 날짜 처리
    if (fieldName === "hiredDate") return new Date(value).toLocaleDateString();
    if (fieldName === "createdAt") return new Date(value).toLocaleString();

    return value;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-blue-600" />
            직원 상세 정보
            <span className="text-base font-normal text-gray-500 ml-2">
              (ID: {adminId})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">
                정보를 불러오는 중입니다...
              </p>
            </div>
          ) : !admin ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <XCircle className="w-12 h-12 mb-2 text-red-400" />
              <p>데이터를 찾을 수 없습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 왼쪽: 프로필 이미지 및 요약 */}
              <div className="w-full lg:w-1/3 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-full p-1 border-4 border-blue-100 shadow-xl overflow-hidden bg-white">
                    <img
                      src={
                        admin.profileImgUrl
                          ? `${BASE_URL}${admin.profileImgUrl}`
                          : "/no_image.png"
                      }
                      alt="프로필"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => (e.target.src = "/no_image.png")}
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {admin.name}
                    </h3>
                    <p className="text-blue-600 font-medium mt-1">
                      {displayValue("deptId", departmentOptions)} /{" "}
                      {displayValue("position", POSITION_OPTIONS)}
                    </p>
                    <span
                      className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${
                        admin.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : admin.status === "LEAVE"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {displayValue("status", STATUS_OPTIONS)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 상세 정보 그리드 */}
              <div className="w-full lg:w-2/3 space-y-8">
                {/* 기본 정보 섹션 */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2 border-gray-200">
                    <User size={18} className="text-blue-500" /> 기본 정보
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    <InfoItem
                      icon={Hash}
                      label="직원 ID"
                      value={admin.adminId}
                    />
                    <InfoItem
                      icon={Briefcase}
                      label="사번"
                      value={admin.empId}
                    />
                    <InfoItem icon={User} label="이름" value={admin.name} />
                    <InfoItem
                      icon={Hash}
                      label="면허 번호"
                      value={admin.licenseNo}
                    />
                    <InfoItem
                      icon={Smartphone}
                      label="휴대폰 번호"
                      value={admin.phone}
                    />
                    <InfoItem icon={Mail} label="이메일" value={admin.email} />
                  </div>
                </div>

                {/* 근무 정보 섹션 */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2 border-gray-200">
                    <Settings size={18} className="text-green-500" /> 근무 정보
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    <InfoItem
                      icon={Building}
                      label="부서"
                      value={displayValue("deptId", departmentOptions)}
                    />
                    <InfoItem
                      icon={Briefcase}
                      label="직책"
                      value={displayValue("position", POSITION_OPTIONS)}
                    />
                    <InfoItem
                      icon={Calendar}
                      label="입사일"
                      value={displayValue("hiredDate")}
                    />
                    <InfoItem
                      icon={Calendar}
                      label="계정 생성일"
                      value={displayValue("createdAt")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end sticky bottom-0 z-10 backdrop-blur-md">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all shadow-md font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

// 정보 아이템 컴포넌트 (재사용)
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 p-2 bg-white rounded-lg shadow-sm text-gray-400">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-gray-800 font-medium break-all">{value || "-"}</p>
    </div>
  </div>
);

// 데이터 없음 아이콘용 컴포넌트
function XCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

export default AdminDetailModal;
