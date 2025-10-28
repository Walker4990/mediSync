import React from "react";
// Recharts 라이브러리 임포트 (설치 필요: npm install recharts)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import AdminHeader from "../../component/AdminHeader";

// 가상의 데이터를 생성합니다.
const dailyData = [
  { name: "월", 환자수: 4000, 청구액: 2400 },
  { name: "화", 환자수: 3000, 청구액: 1398 },
  { name: "수", 환자수: 2000, 청구액: 9800 },
  { name: "목", 환자수: 2780, 청구액: 3908 },
  { name: "금", 환자수: 1890, 청구액: 4800 },
  { name: "토", 환자수: 2390, 청구액: 3800 },
];

const statusData = [
  { name: "심사 완료", value: 400 },
  { name: "심사 중", value: 300 },
  { name: "청구 대기", value: 300 },
  { name: "반려/보완", value: 200 },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// 📊 개별 차트 카드 컴포넌트
const ChartCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-white rounded-lg shadow-xl p-6 h-96 transition duration-300 hover:shadow-2xl ${className}`}
  >
    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
      {title}
    </h2>
    <div className="h-[calc(100%-48px)]">
      {" "}
      {/* 제목 높이만큼 빼서 차트 공간 확보 */}
      {children}
    </div>
  </div>
);

export default function DashBoard() {
  return (
    <div className="bg-gray-50 min-h-screen font-pretendard">
      {/* 상단 고정 관리자 헤더 */}
      <AdminHeader />

      {/* 컨텐츠 영역 */}
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          admin님 안녕하세요!
        </h1>

        {/* 2x2 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. 주간 환자수 및 진료비 청구액 (BarChart) */}
          <ChartCard title="주간 환자 및 청구액 현황">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#333" tick={{ fontSize: 13 }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#8884d8"
                  tick={{ fontSize: 13 }}
                />{" "}
                {/* 환자수 */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#82ca9d"
                  tick={{ fontSize: 13 }}
                />{" "}
                {/* 청구액 */}
                <Tooltip contentStyle={{ fontSize: "14px" }} />
                <Legend wrapperStyle={{ fontSize: "13px" }} />
                <Bar
                  yAxisId="left"
                  dataKey="환자수"
                  fill="#3b82f6"
                  name="환자 수 (명)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="청구액"
                  fill="#10b981"
                  name="청구액 (천원)"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. 보험 청구 심사 진행 상태 (PieChart) */}
          <ChartCard title="보험 청구 심사 진행 상태">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={{ fontSize: 14 }}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: "14px" }}
                  formatter={(value, name, props) => [`${value}건`, name]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: "14px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3. Placeholder */}
          <ChartCard title="월별 매출 추이">
            <div className="text-center pt-16 text-gray-500">
              <p className="text-4xl mb-4">📈</p>
              <p className="text-g">
                데이터 분석 로드맵에 따라 차트가 표시될 예정입니다.
              </p>
              <p>실제 API 연동 후 구현</p>
            </div>
          </ChartCard>

          {/* 4. Placeholder */}
          <ChartCard title="인사 관리 현황">
            <div className="text-center pt-16 text-gray-500">
              <p className="text-4xl mb-4">🧑</p>
              <p className="text-g">
                사용자별 상세 데이터는 인사관리 모듈과 연동됩니다.
              </p>
              <p>실제 API 연동 후 구현</p>
            </div>
          </ChartCard>
        </div>
      </main>
    </div>
  );
}
