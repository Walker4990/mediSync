import React from "react";
import AdminHeader from "../../component/AdminHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Users, UserMinus, UserPlus, AlertCircle, Clock } from "lucide-react";

// --- 더미 데이터 ---
const staffCompositionData = [
  { name: "간호사", value: 450 },
  { name: "의사", value: 120 },
  { name: "의료기사", value: 80 },
  { name: "행정/원무", value: 60 },
  { name: "진료보조", value: 40 },
];

const departmentHeadcountData = [
  { name: "내과", count: 45, ot: 120 },
  { name: "외과", count: 38, ot: 150 },
  { name: "응급실", count: 50, ot: 200 },
  { name: "중환자실", count: 40, ot: 180 },
  { name: "영상의학", count: 25, ot: 30 },
  { name: "원무팀", count: 20, ot: 10 },
];

const turnoverTrendData = [
  { month: "1월", 입사: 10, 퇴사: 5, 이직률: 2.1 },
  { month: "2월", 입사: 15, 퇴사: 8, 이직률: 3.2 },
  { month: "3월", 입사: 25, 퇴사: 10, 이직률: 3.8 },
  { month: "4월", 입사: 8, 퇴사: 4, 이직률: 1.5 },
  { month: "5월", 입사: 12, 퇴사: 6, 이직률: 2.4 },
  { month: "6월", 입사: 20, 퇴사: 12, 이직률: 4.5 },
];

const licenseExpiryData = [
  {
    id: 1,
    name: "김간호",
    dept: "응급실",
    license: "BLS",
    expiry: "2024-05-15",
    status: "Urgent",
  },
  {
    id: 2,
    name: "이방사",
    dept: "영상의학",
    license: "RI면허",
    expiry: "2024-06-01",
    status: "Warning",
  },
  {
    id: 3,
    name: "박의사",
    dept: "내과",
    license: "의사면허",
    expiry: "2024-06-20",
    status: "Warning",
  },
  {
    id: 4,
    name: "최임상",
    dept: "진단검사",
    license: "임상병리",
    expiry: "2024-07-10",
    status: "Normal",
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// --- 카드 컴포넌트 ---
const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p
        className={`text-xs mt-2 ${
          subValue.includes("+") ? "text-green-600" : "text-red-500"
        }`}
      >
        {subValue}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export default function HospitalHRDashboard() {
  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      <AdminHeader />
      <main className="max-w-7xl mx-auto pt-24 px-4 sm:px-8 mb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            가상 인적자원 현황 (HR Dashboard)
          </h1>
          <p className="text-gray-500">
            전체 의료진 및 행정 인력 실시간 모니터링
          </p>
        </div>

        {/* 1. KPI 카드 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="총 재직 인원"
            value="750명"
            subValue="+12명 (전월 대비)"
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="이번 달 신규 입사"
            value="20명"
            subValue="+5명 (전월 대비)"
            icon={UserPlus}
            color="bg-green-500"
          />
          <StatCard
            title="이번 달 퇴사자"
            value="12명"
            subValue="-2명 (전월 대비)"
            icon={UserMinus}
            color="bg-orange-500"
          />
          <StatCard
            title="면허/자격 갱신 필요"
            value="8건"
            subValue="30일 이내 만료"
            icon={AlertCircle}
            color="bg-red-500"
          />
        </div>

        {/* 2. 차트 영역 (상단) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 직군별 구성비 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              직군별 인력 구성
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staffCompositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {staffCompositionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 월별 입/퇴사 및 이직률 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              월별 입/퇴사 및 이직률 추이
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={turnoverTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" unit="%" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="입사"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="퇴사"
                    stackId="1"
                    stroke="#ff8042"
                    fill="#ff8042"
                    fillOpacity={0.3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="이직률"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. 차트 및 테이블 영역 (하단) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 부서별 인원 및 초과근무 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                부서별 인원 및 월 평균 초과근무(OT)
              </h3>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" /> 단위: 시간
              </span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentHeadcountData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#ff7300" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="인원(명)"
                    fill="#8884d8"
                    barSize={40}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    dataKey="ot"
                    name="총 OT(시간)"
                    type="monotone"
                    stroke="#ff7300"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 면허 만료 임박 리스트 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              자격/면허 만료 임박
            </h3>
            <div className="overflow-y-auto h-80">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">이름/부서</th>
                    <th className="px-4 py-3">자격명</th>
                    <th className="px-4 py-3">만료일</th>
                  </tr>
                </thead>
                <tbody>
                  {licenseExpiryData.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.name} <br />
                        <span className="text-xs text-gray-400 font-normal">
                          {item.dept}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.license}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === "Urgent"
                              ? "bg-red-100 text-red-800"
                              : item.status === "Warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.expiry}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
