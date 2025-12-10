package com.mediSync.project.patient.controller;

import com.mediSync.project.patient.dto.QuestionnaireDTO;
import com.mediSync.project.patient.service.QuestionnaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/questionnaire")
public class QuestionnaireController {

    @Autowired
    private QuestionnaireService questionnaireService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuestionnaire(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal String userIdFromToken
    ) {
        try {
            // 1. 프론트엔드 payload 파싱
            Object userIdObj = payload.get("user_id");
            if (userIdObj == null) {
                throw new RuntimeException("user_id가 전달되지 않았습니다.");
            }
            Long userId = Long.valueOf(String.valueOf(userIdObj));
            Long reservationId = Long.valueOf(String.valueOf(payload.get("reservation_id")));
            Map<String, Object> surveyData = (Map<String, Object>) payload.get("survey_data");

            // 2. DTO 생성 및 데이터 세팅
            QuestionnaireDTO dto = new QuestionnaireDTO();
            dto.setReservationId(reservationId);
            dto.setUserId(userId);
            dto.setSurveyData(surveyData);

            // 3. 사용자 ID 세팅
            // 실제 구현에서는 Spring Security의 Principal이나 JWT 유틸리티를 사용해 ID를 가져옵니다.
            if (userIdFromToken != null) {
                dto.setUserId(Long.parseLong(userIdFromToken));
            }

            // 4. 서비스 호출
            questionnaireService.submitQuestionnaire(dto);

            return ResponseEntity.ok("문진표가 성공적으로 저장되었습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("저장 실패: " + e.getMessage());
        }
    }

    // 예약 ID로 문진표 조회
    @GetMapping("/{reservationId}")
    public ResponseEntity<?> getQuestionnaire(@PathVariable Long reservationId) {
        try {
            QuestionnaireDTO dto = questionnaireService.getQuestionnaireByReservationId(reservationId);

            if (dto != null) {
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.noContent().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("조회 실패: " + e.getMessage());
        }
    }
}