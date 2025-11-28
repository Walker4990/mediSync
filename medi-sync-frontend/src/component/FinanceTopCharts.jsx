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

import FinanceChartCard from "./FinanceChartCard";

const STATUS_COLORS = {
    COMPLETED: "#10B981",
    PENDING: "#FACC15",
    REFUNDED: "#F87171",
};

export default function FinanceTopCharts({ dailyData, statusData }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

            <FinanceChartCard title="최근 7일 수익 / 지출 추이">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(v) => v.toLocaleString()} />
                        <Legend />
                        <Bar dataKey="income" name="수익" fill="#3B82F6" />
                        <Bar dataKey="expense" name="지출" fill="#EF4444" />
                    </BarChart>
                </ResponsiveContainer>
            </FinanceChartCard>

            <FinanceChartCard title="거래 상태 비율">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            label
                        >
                            {statusData.map((entry, i) => (
                                <Cell key={i} fill={STATUS_COLORS[entry.name]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </FinanceChartCard>

        </div>
    );
}
