package com.mediSync.project.insurance.controller;

import com.mediSync.project.insurance.dto.ClaimRequestDto;
import com.mediSync.project.insurance.dto.TreatmentDto;
import com.mediSync.project.insurance.service.ClaimOrchestrator;
import com.mediSync.project.insurance.vo.Insurer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claim")
@RequiredArgsConstructor
public class ClaimController {
    private final ClaimOrchestrator claimService;

    /** 환자별 진료내역 조회 */
    @GetMapping("/treatment/{patientId}")
    public ResponseEntity<List<TreatmentDto>> getTreatmentList(@PathVariable Long patientId) {
        return ResponseEntity.ok(claimService.getTreatmentList(patientId));
    }

    /** 보험사 목록 조회 */
    @GetMapping("/insurance/list")
    public ResponseEntity<List<Insurer>> getInsurerList() {
        return ResponseEntity.ok(claimService.getInsurerList());
    }
    // 환자별 청구 내역 조회
    @GetMapping("/{patientId}/claims")
    public ResponseEntity<?> getClaimHistory(@PathVariable Long patientId,
                                             @RequestParam(defaultValue = "1") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(claimService.selectClaimHistoryByPatient(patientId, page, size));
    }

    /** 보험금 청구 등록 */
    @PostMapping("/submit")
    public ResponseEntity<?> submitClaim(@RequestBody ClaimRequestDto dto) {
        claimService.submitClaim(dto);
        return ResponseEntity.ok(Map.of("message", "보험금 청구가 정상적으로 접수되었습니다."));
    }
}
