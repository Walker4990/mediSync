import React from "react";
import {FaEdit, FaTrashAlt} from "react-icons/fa";

export default function DrugTable({ drugs, onEdit, onDelete }) {
    return (
        <table className="min-w-full border mt-4 text-sm">
            <thead>
            <tr className="bg-gray-100 text-center">
                <th className="border p-2">코드</th>
                <th className="border p-2">약품명</th>
                <th className="border p-2">단가</th>
                <th className="border p-2">재고</th>
                <th className="border p-2">보관 장소</th>
                <th className="border p-2">보험코드</th>
                <th className="border p-2">보험사명</th>
                <th className="border p-2">유통기한</th>
                <th className="border p-2">공급처</th>
                <th className="border p-2">수정일자</th>
                <th className="border p-2">관리</th>
            </tr>
            </thead>
            <tbody>
            {drugs.map((drug) => (
                <tr key={`${drug.drugCode}-${drug.createdAt}`} className="text-center">
                    <td className="border p-2">{drug.drugCode}</td>
                    <td className="border p-2">{drug.drugName}</td>
                    <td className="border p-2">{drug.unitPrice?.toLocaleString()}원</td>
                    <td className="border p-2">{drug.quantity}</td>
                    <td className="border p-2">{drug.location}</td>
                    <td className="border p-2">{drug.insurerCode}</td>
                    <td className="border p-2">{drug.insurerName || '-'}</td>
                    <td className="border p-2">{drug.expirationDate || '-'}</td>
                    <td className="border p-2">{drug.supplier}</td>
                    <td className="border p-2">{drug.updatedAt || '-'}</td>
                    <td className="border p-2 space-x-2">
                        <button
                            onClick={() => onEdit(drug)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition duration-150 ease-in-out"
                        >
                            <FaEdit className="w-5 h-5" />{" "}
                        </button>
                        <button
                            onClick={() => onDelete(drug.drugCode)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-md transition duration-150 ease-in-out"
                        >
                            <FaTrashAlt className="w-5 h-5" />{" "}
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
