import React from "react";

export default function FinanceStatCard({ title, value, subValue, icon: Icon, color }) {
    return (
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
}
