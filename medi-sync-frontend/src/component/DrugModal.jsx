import React, { useState, useEffect } from "react";

export default function DrugModal({ visible, onClose, onSave, editData }) {
    const [form, setForm] = useState({
        drugCode: "",
        drugName: "",
        unitPrice: "",
        quantity: "",
        expirationDate: "",
        insurerCode: "",
        supplier: ""
    });

    useEffect(() => {
        if (editData) setForm(editData);
        else {
            setForm({
                drugCode: "DR" + crypto.randomUUID().slice(-6).toUpperCase(), // 자동 코드 생성
                drugName: "",
                unitPrice: "",
                quantity: "",
                expirationDate: "",
                insurerCode: "",
                supplier: ""
            });
        }
    }, [editData]);

    if (!visible) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        const data = {
            ...form,
            // ✅ 숫자/날짜 변환
            unitPrice: Number(form.unitPrice),
            quantity: Number(form.quantity),
            expirationDate: form.expirationDate // yyyy-MM-dd → 문자열 그대로 (백엔드에서 LocalDate로 파싱)
        };

        console.log("📤 변환 후 전송할 데이터:", data);
        onSave(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white shadow-2xl rounded-2xl w-[420px] p-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center border-b pb-3">
                    {editData ? "💊 약품 정보 수정" : "➕ 약품 등록"}
                </h2>

                <div className="space-y-3">
                    {[
                        { label: "약품 코드 (자동)", name: "drugCode", readOnly: true },
                        { label: "약품명", name: "drugName", type: "text" },
                        { label: "단위 (정/캡슐/액상 등)", name: "unit" },
                        { label: "단가 (원)", name: "unitPrice", type: "number" },
                        { label: "재고 수량", name: "quantity", type: "number" },
                        { label: "유통기한", name: "expirationDate", type: "date" },
                        { label: "보험 코드", name: "insuranceCode", type: "text" },
                        { label: "공급처", name: "supplier", type: "text" },
                    ].map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                            </label>
                            <input
                                type={field.type || "text"}
                                name={field.name}
                                value={form[field.name] || ""}
                                onChange={handleChange}
                                readOnly={field.readOnly}
                                className={`border rounded-md w-full p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                                    field.readOnly
                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                        : "border-gray-300"
                                }`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
