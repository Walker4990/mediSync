import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  isConfirm = false,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fadeIn">
        <header
          className={`p-4 flex items-center ${
            isConfirm ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          {isConfirm ? (
            <AlertTriangle className="w-6 h-6 text-white mr-2" />
          ) : (
            <CheckCircle className="w-6 h-6 text-white mr-2" />
          )}
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </header>
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-line">{message}</p>
        </div>
        <footer className="p-4 bg-gray-50 flex justify-end space-x-3">
          {isConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              확인
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 ${
              isConfirm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } rounded-lg font-medium transition`}
          >
            {isConfirm ? "취소" : "닫기"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AlertModal;
