import React, { useEffect, useState } from "react";
import axios from "axios";
import FinanceHeader from "../../component/FinanceHeader";
import FinanceKpiSection from "../../component/FinanceKpiSection";
import FinanceTopCharts from "../../component/FinanceTopCharts";
import FinanceBottomCharts from "../../component/FinanceBottomChart";

// 📌 분리한 컴포넌트 import

// 증가율 계산 함수
const calcRate = (prev, curr) => {
    if (!prev || prev === 0) return "+0%";
    const rate = ((curr - prev) / prev) * 100;
    const sign = rate >= 0 ? "+" : "";
    return `${sign}${rate.toFixed(1)}%`;
};

export default function Dashboard() {
    const [dailyData, setDailyData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [deptIncome, setDeptIncome] = useState([]);
    const [deptProfit, setDeptProfit] = useState([]);

    useEffect(() => {
        axios.get("http://192.168.0.24:8080/api/finance/summary")
            .then((res) => {
                setDailyData(res.data.dailyData || []);
                setStatusData(res.data.statusData || []);
            });

        axios.get("http://192.168.0.24:8080/api/finance/dept-income")
            .then((res) => setDeptIncome(res.data));

        axios.get("http://192.168.0.24:8080/api/finance/dept-net-profit")
            .then((res) => setDeptProfit(res.data));
    }, []);

    // --- KPI 계산 ---
    const totalIncome = dailyData.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = dailyData.reduce((sum, d) => sum + d.expense, 0);

    const prevIncome = dailyData.reduce((sum, d) => sum + (d.prevIncome || 0), 0);
    const prevExpense = dailyData.reduce((sum, d) => sum + (d.prevExpense || 0), 0);

    const incomeRate = calcRate(prevIncome, totalIncome);
    const expenseRate = calcRate(prevExpense, totalExpense);

    const completedNow = statusData.find(s => s.name === "COMPLETED")?.value || 0;
    const completedPrev = statusData.find(s => s.name === "COMPLETED")?.prev || 0;
    const completedRate = calcRate(completedPrev, completedNow);

    const refundedNow = statusData.find(s => s.name === "REFUNDED")?.value || 0;
    const refundedPrev = statusData.find(s => s.name === "REFUNDED")?.prev || 0;
    const refundedRate = calcRate(refundedPrev, refundedNow);

    return (
        <div className="bg-gray-50 min-h-screen font-pretendard">
            <FinanceHeader />

            <main className="max-w-7xl mx-auto pt-24 px-4 sm:px-8 pb-16">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-blue-600">재무 대시보드</h1>
                    <p className="text-gray-500">최근 수익/지출 및 부서 수익 현황을 확인하세요.</p>
                </div>

                {/* ----- KPI 섹션 ----- */}
                <FinanceKpiSection
                    totalIncome={totalIncome}
                    incomeRate={incomeRate}
                    totalExpense={totalExpense}
                    expenseRate={expenseRate}
                    completedNow={completedNow}
                    completedRate={completedRate}
                    refundedNow={refundedNow}
                    refundedRate={refundedRate}
                />

                {/* ----- 상단 차트 ----- */}
                <FinanceTopCharts
                    dailyData={dailyData}
                    statusData={statusData}
                />

                {/* ----- 하단 차트 ----- */}
                <FinanceBottomCharts
                    deptIncome={deptIncome}
                    deptProfit={deptProfit}
                />
            </main>
        </div>
    );
}
