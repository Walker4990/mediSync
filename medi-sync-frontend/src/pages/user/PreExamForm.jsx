import React, { useState, useEffect } from "react";
import { ClipboardList, User, AlertTriangle, CheckSquare } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export default function PreExamForm() {
  const [showMedicationInput, setShowMedicationInput] = useState(false);
  const [showAllergyInput, setShowAllergyInput] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const reservationPayload = location.state?.reservationPayload;

  // 예약 정보가 없으면(잘못된 접근) 뒤로 가기
  useEffect(() => {
    if (!reservationPayload) {
      toast.error("잘못된 접근입니다. 예약 정보를 선택해주세요.");
      navigate(-1);
    }
  }, [reservationPayload, navigate]);

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
    isPregnant: "",
    checkup: "",
    consent: false,
  });

  // 상세 입력란 표시 상태 업데이트
  useEffect(() => {
    setShowMedicationInput(formData.medicationStatus === "yes");
    setShowAllergyInput(formData.allergyStatus === "yes");
  }, [formData.medicationStatus, formData.allergyStatus]);

  // 폼 입력 변경
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "medicalHistory") {
        setFormData((prev) => {
          let newMedicalHistory = [...prev.medicalHistory];

          if (value === "없음") {
            // '없음' 선택
            if (checked) {
              // '없음'을 추가하고 나머지 항목은 모두 제거
              newMedicalHistory = ["없음"];
            } else {
              // '없음' 체크를 해제했을 때: 빈 배열로 초기화
              newMedicalHistory = [];
            }
          } else {
            // '없음' 외의 항목을 선택
            if (checked) {
              // 해당 항목을 추가하고, '없음' 항목이 있다면 제거
              newMedicalHistory = [
                ...newMedicalHistory.filter((item) => item !== "없음"),
                value,
              ];
            } else {
              // 해당 항목 제거
              newMedicalHistory = newMedicalHistory.filter(
                (item) => item !== value
              );
            }
          }

          return { ...prev, medicalHistory: newMedicalHistory };
        });
      } else {
        // single-check (consent)
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      // radio, text(area)
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 필수 텍스트/영역 검사
    if (!formData.mainSymptom.trim()) {
      toast.error("⚠️ 1. 주요 증상을 입력해 주세요.");
      return;
    }
    if (!formData.symptomStartDate.trim()) {
      toast.error("⚠️ 2. 증상 시작일을 입력해 주세요.");
      return;
    }

    // 2. 과거 병력 검사 (최소 하나 선택)
    if (formData.medicalHistory.length === 0) {
      toast.error(
        "⚠️ 3. 과거 진단받은 질환을 하나 이상 선택해 주세요. (없음 포함)"
      );
      return;
    }

    // 3. 복용 중인 약 검사
    if (!formData.medicationStatus) {
      toast.error("⚠️ 4. 현재 복용 중인 약 여부를 선택해 주세요.");
      return;
    }
    if (
      formData.medicationStatus === "yes" &&
      !formData.medicationDetails.trim()
    ) {
      toast.error("⚠️ 4. 복용 중인 약의 상세 내용을 입력해 주세요.");
      return;
    }

    // 4. 알레르기 검사
    if (!formData.allergyStatus) {
      toast.error("⚠️ 5. 약물/음식 알레르기 여부를 선택해 주세요.");
      return;
    }
    if (formData.allergyStatus === "yes" && !formData.allergyDetails.trim()) {
      toast.error("⚠️ 5. 알레르기 상세 내용을 입력해 주세요.");
      return;
    }

    // 5. 흡연/음주/임신/건강검진 상태 검사 (라디오)
    if (!formData.smokingStatus) {
      toast.error("⚠️ 6. 현재 흡연 여부를 선택해 주세요.");
      return;
    }
    if (!formData.alcoholStatus) {
      toast.error("⚠️ 7. 평소 음주 여부를 선택해 주세요.");
      return;
    }
    if (!formData.isPregnant) {
      toast.error("⚠️ 8. 임신/수유 여부를 선택해 주세요.");
      return;
    }
    if (!formData.checkup) {
      toast.error("⚠️ 9. 최근 1년 이내 건강검진 여부를 선택해 주세요.");
      return;
    }

    // 6. 정보 제공 동의 검사
    if (!formData.consent) {
      toast.error("⚠️ 정보 제공 동의에 체크해야 문진표를 제출할 수 있습니다.");
      return;
    }

    // ------------------------------------
    // API 통신 시작
    // ------------------------------------

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    // 토큰에서 user_id 추출
    let userId = null;
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch (err) {
      console.error("토큰 디코딩 실패:", err);
      alert("사용자 정보를 확인할 수 없습니다.");
      return;
    }

    try {
      // 예약 정보에 userId 추가
      const finalReservationPayload = {
        ...reservationPayload,
        userId: userId, // 추출한 userId 추가
      };

      // 1. 예약 정보 제출
      const reservationRes = await axios.post(
        "http://192.168.0.24:8080/api/reservation/addReservation",
        finalReservationPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newReservationId = reservationRes.data.reservationId;

      if (!newReservationId) {
        throw new Error("예약 생성에 실패했습니다. (ID 없음)");
      }

      // 2. 문진표 데이터 제출
      const surveyPayload = {
        reservation_id: newReservationId,
        user_id: userId, // 여기서 추출한 userId 명시적 전달
        survey_data: {
          ...formData,
          // medicalHistory 배열은 그대로 전송
          // medicationDetails, allergyDetails는 'no'일 경우 빈 문자열로 전송됨
        },
      };

      await axios.post(
        "http://192.168.0.24:8080/api/questionnaire/submit",
        surveyPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "예약 및 문진표 제출이 완료되었습니다! 상담 페이지로 이동합니다."
      );
      window.location.href = "/user/consult";
    } catch (error) {
      console.error("처리 중 오류 발생:", error);
      alert(
        "오류가 발생했습니다: " +
          (error.response?.data?.message || error.message)
      );
    }
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
    // 오류 메시지 스타일
    errorText: "text-red-500 text-sm mt-1 ml-1",
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 font-pretendard">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <ClipboardList size={48} className="mx-auto text-blue-600" />
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4">
            온라인 사전 문진표
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            보다 정확한 진료를 위해, 내원 전 정보를 입력해주세요.
          </p>
        </div>

        {/* 문진표 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 주요 증상 */}
          <div className={styles.section}>
            <label htmlFor="mainSymptom" className={styles.label}>
              1. 현재 가장 불편한 증상이 무엇인가요?{" "}
              <span className="text-red-500">*</span>
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

          {/* 증상 시작일 */}
          <div className={styles.section}>
            <label htmlFor="symptomStartDate" className={styles.label}>
              2. 증상이 언제부터 시작되었나요?{" "}
              <span className="text-red-500">*</span>
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

          {/* 과거 병력 (다중 선택) */}
          <div className={styles.section}>
            <label className={styles.label}>
              3. 과거에 진단받은 질환이 있나요? (모두 선택){" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["고혈압", "당뇨", "천식", "심장질환", "간질환", "없음"].map(
                (disease) => {
                  // '없음' 외의 항목일 때, '없음'이 선택되어 있으면 비활성화
                  const isOtherItemDisabled =
                    disease !== "없음" &&
                    formData.medicalHistory.includes("없음");

                  // '없음' 항목일 때, 다른 항목이 선택되어 있으면 비활성화
                  const isNoneItemDisabled =
                    disease === "없음" &&
                    formData.medicalHistory.length > 0 &&
                    !formData.medicalHistory.includes("없음");

                  const isDisabled = isOtherItemDisabled || isNoneItemDisabled;

                  return (
                    <label
                      key={disease}
                      className={`${styles.radioLabel} ${
                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="medicalHistory"
                        value={disease}
                        className={styles.radioInput}
                        onChange={handleChange}
                        checked={formData.medicalHistory.includes(disease)}
                        disabled={isDisabled}
                      />
                      <span>{disease}</span>
                    </label>
                  );
                }
              )}
            </div>
          </div>

          {/* 복용 중인 약 */}
          <div className={styles.section}>
            <label className={styles.label}>
              4. 현재 복용 중인 약이 있나요?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="medicationStatus"
                  value="yes"
                  className={styles.radioInput}
                  onChange={handleChange}
                  checked={formData.medicationStatus === "yes"}
                />
                <span>예</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="medicationStatus"
                  value="no"
                  className={styles.radioInput}
                  onChange={handleChange}
                  checked={formData.medicationStatus === "no"}
                />
                <span>아니오</span>
              </label>
            </div>
            {/* '예' 선택 시 표시 */}
            {formData.medicationStatus === "yes" && (
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

          {/* 알레르기 */}
          <div className={styles.section}>
            <label className={styles.label}>
              5. 약물이나 음식에 알레르기가 있나요?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="allergyStatus"
                  value="yes"
                  className={styles.radioInput}
                  onChange={handleChange}
                  checked={formData.allergyStatus === "yes"}
                />
                <span>예</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="allergyStatus"
                  value="no"
                  className={styles.radioInput}
                  onChange={handleChange}
                  checked={formData.allergyStatus === "no"}
                />
                <span>아니오</span>
              </label>
            </div>
            {/* '예' 선택 시 표시 */}
            {formData.allergyStatus === "yes" && (
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

          {/* 흡연 */}
          <div className={styles.section}>
            <label className={styles.label}>
              6. 현재 흡연 중이신가요? <span className="text-red-500">*</span>
            </label>
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
                      checked={formData.smokingStatus === status}
                    />
                    <span>{status}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* 음주 */}
          <div className={styles.section}>
            <label className={styles.label}>
              7. 평소 음주를 하시나요? <span className="text-red-500">*</span>
            </label>
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
                      checked={formData.alcoholStatus === status}
                    />
                    <span>{status}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* 임신/출산 */}
          <div className={styles.section}>
            <label className={styles.label}>
              8. (여성만 해당) 현재 임신 또는 수유 중이신가요?{" "}
              <span className="text-red-500">*</span>
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
                    checked={formData.isPregnant === status}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 건강검진 */}
          <div className={styles.section}>
            <label className={styles.label}>
              9. 최근 1년 이내 건강검진을 받으신 적이 있나요?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className={styles.radioGroup}>
              {["예", "아니오"].map((status) => (
                <label key={status} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="checkup"
                    value={status.toLowerCase()} // 'yes'/'no'로 저장되도록
                    className={styles.radioInput}
                    onChange={handleChange}
                    checked={formData.checkup === status.toLowerCase()}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 정보 제공 동의 */}
          <div className={`${styles.section} bg-blue-50 border-blue-200`}>
            <div className="flex items-start space-x-3">
              <CheckSquare size={20} className="text-blue-700 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800">
                  정보 제공 동의 <span className="text-red-500">*</span>
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

          {/* 제출 버튼 */}
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
