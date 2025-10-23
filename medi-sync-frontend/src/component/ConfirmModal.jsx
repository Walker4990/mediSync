import React from "react";

/**
 * 삭제 확인 모달 컴포넌트
 * @param {string} message - 모달에 표시할 메시지
 * @param {function} onConfirm - 확인(삭제) 버튼 클릭 시 실행할 함수
 * @param {function} onCancel - 취소 버튼 클릭 시 실행할 함수
 */
const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
        <h3 className="text-xl font-bold text-red-600 mb-4">경고</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
