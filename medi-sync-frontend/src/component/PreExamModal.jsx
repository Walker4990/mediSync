import React from "react";
import {
  X,
  FileText,
  AlertCircle,
  Calendar,
  Activity,
  Pill,
  Wine,
  Cigarette,
  Baby,
} from "lucide-react";

export default function PreExamModal({ isOpen, onClose, data, patientName }) {
  if (!isOpen) return null;

  const survey = data || {};

  // '예/아니오'에 따른 배지 스타일
  const getStatusBadge = (status) => {
    if (status === "yes" || status === "예") {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-600">
          YES
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500">
        NO
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-pretendard">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <h2 className="text-lg font-bold">사전 문진 내역 조회</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-1 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {/* 환자 정보 요약 */}
          <div className="mb-6 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-800">{patientName}</h3>
            <span className="text-gray-500">환자님의 작성 내역</span>
          </div>

          <div className="space-y-4">
            {/* 1. 주요 증상 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-blue-600 font-semibold border-b pb-2 border-gray-100">
                <Activity size={18} />
                <span>주요 증상 및 시기</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-400 mb-1">증상 상세</p>
                  <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                    {survey.mainSymptom || "입력된 증상이 없습니다."}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 text-sm font-semibold mb-1">
                    <Calendar size={14} /> 증상 시작일
                  </div>
                  <p className="text-gray-700 font-medium">
                    {survey.symptomStartDate || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. 과거 병력 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-gray-400" /> 과거 병력
              </p>
              <div className="flex flex-wrap gap-2">
                {survey.medicalHistory && survey.medicalHistory.length > 0 ? (
                  survey.medicalHistory.map((history, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
                    >
                      {history}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">없음</span>
                )}
              </div>
            </div>

            {/* 3. 약물 및 알레르기 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 약물 복용 */}
              <div
                className={`p-4 rounded-lg border ${
                  survey.medicationStatus === "yes"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Pill
                      size={16}
                      className={
                        survey.medicationStatus === "yes"
                          ? "text-orange-500"
                          : "text-gray-400"
                      }
                    />
                    복용 중인 약
                  </div>
                  {getStatusBadge(survey.medicationStatus)}
                </div>
                {survey.medicationStatus === "yes" && (
                  <p className="text-sm text-gray-800 mt-2 font-medium bg-white/60 p-2 rounded">
                    {survey.medicationDetails}
                  </p>
                )}
              </div>

              {/* 알레르기 */}
              <div
                className={`p-4 rounded-lg border ${
                  survey.allergyStatus === "yes"
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <AlertCircle
                      size={16}
                      className={
                        survey.allergyStatus === "yes"
                          ? "text-red-500"
                          : "text-gray-400"
                      }
                    />
                    알레르기
                  </div>
                  {getStatusBadge(survey.allergyStatus)}
                </div>
                {survey.allergyStatus === "yes" && (
                  <p className="text-sm text-red-700 mt-2 font-medium bg-white/60 p-2 rounded">
                    {survey.allergyDetails}
                  </p>
                )}
              </div>
            </div>

            {/* 4. 생활 습관 및 기타 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm grid grid-cols-3 gap-4 divide-x divide-gray-100">
              <div className="text-center">
                <div className="flex justify-center text-gray-400 mb-1">
                  <Cigarette size={20} />
                </div>
                <p className="text-xs text-gray-500">흡연 여부</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {survey.smokingStatus || "-"}
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center text-gray-400 mb-1">
                  <Wine size={20} />
                </div>
                <p className="text-xs text-gray-500">음주 여부</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {survey.alcoholStatus || "-"}
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center text-gray-400 mb-1">
                  <Baby size={20} />
                </div>
                <p className="text-xs text-gray-500">임신 여부</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {survey.isPregnant || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
