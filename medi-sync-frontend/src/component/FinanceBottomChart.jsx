import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import FinanceChartCard from "./FinanceChartCard";

export default function FinanceBottomCharts({ deptIncome, deptProfit }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <FinanceChartCard title="부서별 수익">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptIncome}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="deptName" />
                        <YAxis />
                        <Tooltip formatter={(v) => v.toLocaleString()} />
                        <Bar dataKey="income" fill="#6366F1" />
                    </BarChart>
                </ResponsiveContainer>
            </FinanceChartCard>

            <FinanceChartCard title="부서별 순이익">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptProfit}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="deptName" />
                        <YAxis />
                        <Tooltip formatter={(v) => v.toLocaleString()} />
                        <Bar dataKey="netProfit" fill="#14B8A6" />
                    </BarChart>
                </ResponsiveContainer>
            </FinanceChartCard>

        </div>
    );
}
