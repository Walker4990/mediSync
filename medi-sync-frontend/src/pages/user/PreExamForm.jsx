import React, { useState } from "react";
import { ClipboardList, User, AlertTriangle, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PreExamForm() {
  const [showMedicationInput, setShowMedicationInput] = useState(false);
  const [showAllergyInput, setShowAllergyInput] = useState(false);
  const navigate = useNavigate();

  // 폼 데이터 상태 (필요에 따라 확장)
  const [formData, setFormData] = useState({
    mainSymptom: "",
    symptomStartDate: "",
    medicalHistory: [],
    medicationStatus: "no",
    medicationDetails: "",
    allergyStatus: "no",
    allergyDetails: "",
    smokingStatus: "",
    alcoholStatus: "",
    isPregnant: "no",
    consent: false,
  });

  // 폼 입력 변경 핸들러 (간단한 예시)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // (체크박스 - 다중 선택)
      if (name === "medicalHistory") {
        setFormData((prev) => ({
          ...prev,
          medicalHistory: checked
            ? [...prev.medicalHistory, value]
            : prev.medicalHistory.filter((item) => item !== value),
        }));
      } else {
        // (체크박스 - 단일)
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      // (라디오, 텍스트, 텍스트에어리어)
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert("정보 제공 동의에 체크해주세요.");
      return;
    }
    console.log("제출할 문진표 데이터:", formData);
    // TODO: 이 곳에서 formData를 서버로 전송 (axios.post 등)
    alert("사전 문진표가 성공적으로 제출되었습니다.");
    window.location.href = "/user/consult";
  };

  const styles = {
    // 질문 섹션
    section: "bg-white p-6 rounded-lg shadow-sm border border-gray-100",
    // 질문 제목
    label: "block text-lg font-semibold text-gray-800 mb-3",
    // 기본 입력창
    input:
      "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150",
    // 라디오/체크박스 그룹
    radioGroup: "flex flex-wrap gap-x-6 gap-y-2",
    // 라디오/체크박스 라벨
    radioLabel: "flex items-center space-x-2 text-gray-700 cursor-pointer",
    // 라디오/체크박스 인풋
    radioInput: "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500",
  };

  return (
    // 전체 페이지 배경 (이미지의 흰색/밝은 회색 테마)
    <div className="bg-gray-50 min-h-screen p-4 font-pretendard">
      <div className="max-w-4xl mx-auto">
        {/* === 1. 헤더 === */}
        <div className="text-center mb-10">
          <ClipboardList size={48} className="mx-auto text-blue-600" />
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4">
            온라인 사전 문진표
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            보다 정확한 진료를 위해, 내원 전 정보를 입력해주세요.
          </p>
        </div>

        {/* === 2. 문진표 폼 === */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* --- 1. 주요 증상 --- */}
          <div className={styles.section}>
            <label htmlFor="mainSymptom" className={styles.label}>
              1. 현재 가장 불편한 증상이 무엇인가요?
            </label>
            <textarea
              id="mainSymptom"
              name="mainSymptom"
              rows={4}
              className={styles.input}
              placeholder="예) 3일 전부터 열이 나고 목이 아픕니다."
              onChange={handleChange}
              value={formData.mainSymptom}
            ></textarea>
          </div>

          {/* --- 2. 증상 시작일 --- */}
          <div className={styles.section}>
            <label htmlFor="symptomStartDate" className={styles.label}>
              2. 증상이 언제부터 시작되었나요?
            </label>
            <input
              type="text"
              id="symptomStartDate"
              name="symptomStartDate"
              className={styles.input}
              placeholder="예) 3일 전 / 11월 7일"
              onChange={handleChange}
              value={formData.symptomStartDate}
            />
          </div>

          {/* --- 3. 과거 병력 (다중 선택) --- */}
          <div className={styles.section}>
            <label className={styles.label}>
              3. 과거에 진단받은 질환이 있나요? (모두 선택)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["고혈압", "당뇨", "천식", "심장질환", "간질환", "없음"].map(
                (disease) => (
                  <label key={disease} className={styles.radioLabel}>
                    <input
                      type="checkbox"
                      name="medicalHistory"
                      value={disease}
                      className={styles.radioInput}
                      onChange={handleChange}
                    />
                    <span>{disease}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* --- 4. 복용 중인 약 --- */}
          <div className={styles.section}>
            <label className={styles.label}>
              4. 현재 복용 중인 약이 있나요?
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="medicationStatus"
                  value="yes"
                  className={styles.radioInput}
                  onChange={(e) => {
                    handleChange(e);
                    setShowMedicationInput(true);
                  }}
                />
                <span>예</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="medicationStatus"
                  value="no"
                  className={styles.radioInput}
                  onChange={(e) => {
                    handleChange(e);
                    setShowMedicationInput(false);
                  }}
                  defaultChecked
                />
                <span>아니오</span>
              </label>
            </div>
            {/* '예' 선택 시 표시 */}
            {showMedicationInput && (
              <textarea
                name="medicationDetails"
                rows={3}
                className={`${styles.input} mt-4`}
                placeholder="복용 중인 약의 이름을 모두 적어주세요."
                onChange={handleChange}
                value={formData.medicationDetails}
              ></textarea>
            )}
          </div>

          {/* --- 5. 알레르기 --- */}
          <div className={styles.section}>
            <label className={styles.label}>
              5. 약물이나 음식에 알레르기가 있나요?
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="allergyStatus"
                  value="yes"
                  className={styles.radioInput}
                  onChange={(e) => {
                    handleChange(e);
                    setShowAllergyInput(true);
                  }}
                />
                <span>예</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="allergyStatus"
                  value="no"
                  className={styles.radioInput}
                  onChange={(e) => {
                    handleChange(e);
                    setShowAllergyInput(false);
                  }}
                  defaultChecked
                />
                <span>아니오</span>
              </label>
            </div>
            {/* '예' 선택 시 표시 */}
            {showAllergyInput && (
              <textarea
                name="allergyDetails"
                rows={3}
                className={`${styles.input} mt-4`}
                placeholder="알레르기 종류를 모두 적어주세요. (예: 페니실린, 견과류)"
                onChange={handleChange}
                value={formData.allergyDetails}
              ></textarea>
            )}
          </div>

          {/* --- 6. 흡연 --- */}
          <div className={styles.section}>
            <label className={styles.label}>6. 현재 흡연 중이신가요?</label>
            <div className={styles.radioGroup}>
              {["비흡연", "과거 흡연 (현재 중단)", "현재 흡연"].map(
                (status) => (
                  <label key={status} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="smokingStatus"
                      value={status}
                      className={styles.radioInput}
                      onChange={handleChange}
                    />
                    <span>{status}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* --- 7. 음주 --- */}
          <div className={styles.section}>
            <label className={styles.label}>7. 평소 음주를 하시나요?</label>
            <div className={styles.radioGroup}>
              {["안 함", "월 1~2회", "주 1~2회", "주 3회 이상"].map(
                (status) => (
                  <label key={status} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="alcoholStatus"
                      value={status}
                      className={styles.radioInput}
                      onChange={handleChange}
                    />
                    <span>{status}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* --- 8. (여성) 임신/출산 --- */}
          <div className={styles.section}>
            <label className={styles.label}>
              8. (여성만 해당) 현재 임신 또는 수유 중이신가요?
            </label>
            <div className={styles.radioGroup}>
              {["예", "아니오", "해당 없음"].map((status) => (
                <label key={status} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="isPregnant"
                    value={status}
                    className={styles.radioInput}
                    onChange={handleChange}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* --- 9. 건강검진 --- */}
          <div className={styles.section}>
            <label className={styles.label}>
              9. 최근 1년 이내 건강검진을 받으신 적이 있나요?
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="checkup"
                  value="yes"
                  className={styles.radioInput}
                  onChange={handleChange}
                />
                <span>예</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="checkup"
                  value="no"
                  className={styles.radioInput}
                  onChange={handleChange}
                />
                <span>아니오</span>
              </label>
            </div>
          </div>

          {/* --- 10. 정보 제공 동의 --- */}
          <div className={`${styles.section} bg-blue-50 border-blue-200`}>
            <div className="flex items-start space-x-3">
              <CheckSquare size={20} className="text-blue-700 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800">
                  정보 제공 동의
                </h3>
                <p className="text-gray-700 mt-1 mb-3">
                  작성된 모든 내용은 의료법에 따라 안전하게 처리되며, 진료
                  목적으로만 사용됩니다.
                </p>
                <label className={styles.radioLabel}>
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    className={styles.radioInput}
                    onChange={handleChange}
                    checked={formData.consent}
                  />
                  <span className="font-medium text-gray-800">
                    위 내용에 동의하며, 정확한 정보를 제공합니다.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* === 3. 제출 버튼 === */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              className="w-full py-3 px-6 bg-white text-blue-600 border border-blue-600 rounded-lg font-bold hover:bg-blue-50 transition duration-300"
              onClick={() => navigate(-1)}
            >
              이전으로
            </button>
            <button
              type="submit"
              className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300"
            >
              문진표 제출하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
