package com.mediSync.project.patient.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class QuestionnaireDTO {
    private Long questionId;
    private Long userId;          // 사용자 ID
    private Long reservationId;   // 예약 ID
    private LocalDateTime createdAt;
    // survey_data 객체를 담을 Map을 JSON 문자열로 변환하여 저장
    private Map<String, Object> surveyData;
}
