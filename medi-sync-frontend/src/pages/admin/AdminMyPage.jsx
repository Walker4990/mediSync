import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Camera,
  XCircle,
  User,
  Settings,
  Lock,
  Calendar,
  BarChart,
  ChevronDown,
} from "lucide-react";
import AdminHeader from "../../component/AdminHeader";
import {
  API_URL,
  UPLOAD_API_URL,
  DEPT_API_URL,
} from "../../api/AdminConstants";
import PasswordChangeModal from "../../component/PasswordChangeModal";
import ProfileManagement from "../../component/ProfileManagement";

// 사이드바 메뉴 버튼
const MenuButton = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors duration-200
                ${
                  isActive
                    ? "bg-blue-500 text-white font-semibold shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="text-sm">{label}</span>
    </button>
  );
};

// 임시 컴포넌트
const MySchedule = () => (
  <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
      <span className="bg-yellow-100 p-2 rounded-full mr-3 text-yellow-600">
        <Calendar className="w-5 h-5" />
      </span>
      나의 주간 일정 / 당직표
    </h2>
    <div className="text-gray-600 h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
      <p className="text-lg italic">
        나의 주간/월간 스케줄 데이터가 여기에 표시됩니다.
      </p>
    </div>
  </div>
);

const MyStatistics = () => (
  <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
      <span className="bg-red-100 p-2 rounded-full mr-3 text-red-600">
        <BarChart className="w-5 h-5" />
      </span>
      나의 진료 통계
    </h2>
    <div className="text-gray-600 h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
      <p className="text-lg italic">
        월별 환자 수, 진료 시간, 수술 건수 등 개인 통계 차트가 표시됩니다.
      </p>
    </div>
  </div>
);

// 메인 컴포넌트
const AdminMyPage = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [viewMode, setViewMode] = useState("profile");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isDeptLoading, setIsDeptLoading] = useState(true);

  // 관리자 데이터 로딩
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL);
        const data = response.data;

        setAdmin(data);
        setFormData(data || {});

        // 로컬 스토리지에도 업데이트하여 동기화
        localStorage.setItem("admin_data", JSON.stringify(data));
      } catch (error) {
        console.error("데이터 로드 오류:", error);

        const storedData = localStorage.getItem("admin_data");
        if (storedData) {
          const data = JSON.parse(storedData);
          setAdmin(data);
          setFormData(data || {});
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // 부서 데이터 로딩
  useEffect(() => {
    let mounted = true;
    const loadDepartments = async () => {
      try {
        const res = await axios.get(DEPT_API_URL);
        if (!mounted) return;
        const opts = Array.isArray(res.data)
          ? res.data.map((d) => ({
              value: String(d.deptId),
              label: String(d.deptName),
              name: String(d.deptName),
            }))
          : [];
        setDepartmentOptions([
          { value: "", label: "부서 선택", disabled: true },
          ...opts,
        ]);
      } catch (err) {
        console.warn("부서 로드 실패:", err);
        setDepartmentOptions([]);
      } finally {
        setIsDeptLoading(false);
      }
    };
    loadDepartments();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 이미지 파일 선택
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 프로필 이미지 업로드
  const uploadProfileImage = async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await axios.post(UPLOAD_API_URL, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  // 이미지 및 정보 저장
  const handleSave = async () => {
    if (uploading) return;
    setUploading(true);

    try {
      let finalFormData = { ...formData };

      // 1. 선택된 파일이 있다면 업로드 먼저 수행
      if (selectedFile) {
        const uploadedUrl = await uploadProfileImage(selectedFile);
        finalFormData.profileImgUrl = uploadedUrl;
      }

      // 2. 부서명 처리
      if (finalFormData.deptId) {
        const dept = departmentOptions.find(
          (d) => d.value === String(finalFormData.deptId)
        );
        if (dept) finalFormData.deptName = dept.label;
      } else {
        delete finalFormData.deptId;
      }

      // 3. 최종 정보 DB 업데이트
      const res = await axios.put(API_URL, finalFormData);

      setAdmin(res.data);
      setFormData(res.data);
      setIsEditing(false);

      // 상태 초기화
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      alert("✅ 정보가 수정되었습니다.");
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData(admin || {});
    setIsEditing(false);
    // 취소 시 이미지 미리보기 초기화
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  if (loading) return <div className="pt-24 text-center">로딩 중...</div>;
  if (!admin) return <div className="pt-24 text-center">정보 없음</div>;

  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />

      <main className="max-w-7xl mx-auto pt-24 px-8 pb-12">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 border-b pb-4">
          마이페이지
          {/* <span className="text-gray-500 text-2xl font-semibold ml-3">
            (ID: {admin?.adminId || "N/A"})
          </span> */}
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* 사이드 메뉴 */}
          <aside className="w-full md:w-1/4 bg-white p-6 shadow-xl rounded-xl h-fit sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              개인 업무 관리
            </h3>
            <nav className="space-y-2">
              <MenuButton
                icon={User}
                label="개인 정보 수정"
                isActive={viewMode === "profile"}
                onClick={() => {
                  setViewMode("profile");
                  setIsEditing(false);
                }}
              />
              <MenuButton
                icon={Calendar}
                label="나의 일정 관리"
                isActive={viewMode === "schedule"}
                onClick={() => setViewMode("schedule")}
              />
              <MenuButton
                icon={BarChart}
                label="나의 진료 통계"
                isActive={viewMode === "stats"}
                onClick={() => setViewMode("stats")}
              />
              <div className="border-t pt-2 mt-2">
                <MenuButton
                  icon={Lock}
                  label="비밀번호 변경"
                  isActive={false}
                  onClick={() => setIsPasswordModalOpen(true)}
                />
              </div>
            </nav>
          </aside>

          {/* 컨텐츠 영역 */}
          <section className="w-full md:w-3/4">
            {viewMode === "profile" && (
              <div className="relative">
                <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100 mb-8">
                  <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                        <User className="w-5 h-5" />
                      </span>
                      개인 정보 관리
                    </h2>
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSave}
                          disabled={uploading}
                          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow font-medium"
                        >
                          {uploading ? "업로드 중..." : "저장"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-5 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 shadow font-medium"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 shadow font-medium"
                      >
                        정보 수정
                      </button>
                    )}
                  </div>
                  <ProfileManagement
                    isEditing={isEditing}
                    formData={formData}
                    handleChange={handleChange}
                    handleFileChange={handleFileChange}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                    departmentOptions={departmentOptions}
                    isDeptLoading={isDeptLoading}
                  />
                </div>
              </div>
            )}
            {viewMode === "schedule" && <MySchedule />}
            {viewMode === "stats" && <MyStatistics />}
          </section>
        </div>
      </main>

      {/* 비밀번호 변경 모달 */}
      {admin && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          adminId={admin.adminId}
        />
      )}
    </div>
  );
};

export default AdminMyPage;
