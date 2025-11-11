import React, { useEffect, useState } from "react";
import axios from "axios";
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
import FinanceHeader from "../../component/FinanceHeader";

const STATUS_COLORS = {
    COMPLETED: "#10B981", // 초록
    PENDING: "#FACC15",   // 노랑
    REFUNDED: "#F87171",  // 빨강
};

const ChartCard = ({ title, children }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span role="img" aria-label="chart"></span>
                {title}
            </h2>
            <div className="h-[4px] w-10 bg-blue-500 rounded-full"></div>
        </div>
        <div className="h-[25rem] flex justify-center items-center">{children}</div>
    </div>
);

export default function DashBoard() {
    const [dailyData, setDailyData] = useState([]);
    const [statusData, setStatusData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get("http://192.168.0.24:8080/api/finance/summary");
            setDailyData(res.data.dailyData || []);
            setStatusData(res.data.statusData || []);
        } catch (err) {
            console.error("❌ 대시보드 데이터 로드 실패:", err);
        }
    };

    return (
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-pretendard">
            <FinanceHeader />

            <main className="max-w-7xl mx-auto pt-24 pb-16 px-6">
                <div className="mb-10 text-center">

                    <p className="text-gray-500 mt-2 text-sm">
                        최근 수익/지출 및 거래 상태를 한눈에 확인하세요
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* 📊 최근 7일 수익 / 지출 추이 */}
                    <ChartCard title="최근 7일 수익 / 지출 추이">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(v) =>
                                        v.toLocaleString("ko-KR", {
                                            style: "currency",
                                            currency: "KRW",
                                        })
                                    }
                                />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                                <Bar
                                    dataKey="income"
                                    fill="#3B82F6"
                                    name="수익"
                                    radius={[8, 8, 0, 0]}
                                    barSize={35}
                                />
                                <Bar
                                    dataKey="expense"
                                    fill="#EF4444"
                                    name="지출"
                                    radius={[8, 8, 0, 0]}
                                    barSize={35}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 💰 거래 상태별 비율 */}
                    <ChartCard title="거래 상태별 비율">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={4}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, value }) => `${name} (${value})`}
                                >
                                    {statusData.map((entry, i) => (
                                        <Cell
                                            key={`cell-${i}`}
                                            fill={STATUS_COLORS[entry.name] || "#CBD5E1"}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => `${v}건`} />
                                <Legend
                                    iconType="circle"
                                    layout="horizontal"
                                    align="center"
                                    verticalAlign="top"
                                    wrapperStyle={{
                                        fontSize: "13px",
                                        marginBottom: "10px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </main>
        </div>
    );
}
