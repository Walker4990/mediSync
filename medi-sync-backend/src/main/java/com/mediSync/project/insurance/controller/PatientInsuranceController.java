package com.mediSync.project.insurance.controller;

import com.mediSync.project.insurance.service.PatientInsuranceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@Slf4j
@RestController
@RequestMapping("/api/patient-insurance")
@RequiredArgsConstructor
public class PatientInsuranceController {

    private final PatientInsuranceService patientInsuranceService;
    // 가입 보험 목록 조회
    @GetMapping("/{patientId}")
    public ResponseEntity<?> getInsurances(@PathVariable Long patientId) {
        log.info("보험 목록 요청{}", patientId);
        return ResponseEntity.ok(patientInsuranceService.selectByPatientIdOrderByCoverageDesc(patientId));
    }

    // 보험사 동기화
    @PostMapping("/{patientId}/sync")
    public ResponseEntity<?> syncInsurances(@PathVariable Long patientId) {
        Map<String, Object> result = patientInsuranceService.syncWithKftc(patientId);
        return ResponseEntity.ok(result);
    }

    // 청구 이력 조회
    @GetMapping("/{patientId}/claims")
    public ResponseEntity<?> getClaimHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientInsuranceService.getClaimHistory(patientId));
    }
}
