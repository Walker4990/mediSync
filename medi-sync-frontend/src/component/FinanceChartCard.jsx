export default function FinanceChartCard({ title, children }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
            <div className="h-80">{children}</div>
        </div>
    );
}
