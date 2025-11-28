import FinanceStatCard from "./FinanceStatCard";
import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";

export default function FinanceKpiSection({
                                              totalIncome,
                                              totalExpense,
                                              incomeRate,
                                              expenseRate,
                                              completedNow,
                                              completedRate,
                                              refundedNow,
                                              refundedRate
                                          }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            <FinanceStatCard
                title="총 수익(최근 7일)"
                value={totalIncome.toLocaleString()}
                subValue={`${incomeRate} 변화`}
                icon={TrendingUp}
                color="bg-blue-500"
            />

            <FinanceStatCard
                title="총 지출(최근 7일)"
                value={totalExpense.toLocaleString()}
                subValue={`${expenseRate} 변화`}
                icon={TrendingDown}
                color="bg-red-500"
            />

            <FinanceStatCard
                title="완료된 거래"
                value={completedNow}
                subValue={`${completedRate} 변화`}
                icon={Wallet}
                color="bg-green-500"
            />

            <FinanceStatCard
                title="환불"
                value={refundedNow}
                subValue={`${refundedRate} 변화`}
                icon={CreditCard}
                color="bg-orange-500"
            />
        </div>
    );
}
