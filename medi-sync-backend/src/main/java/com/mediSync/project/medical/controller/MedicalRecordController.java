package com.mediSync.project.medical.controller;

import com.mediSync.project.medical.service.MedicalRecordService;
import com.mediSync.project.medical.vo.MedicalRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping("/all")
    public List<MedicalRecord> selectRecordAll() {
        return medicalRecordService.selectRecordAll();
    }
    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> selectRecordByPatientId(@PathVariable("patientId") Long patientId) {
        return medicalRecordService.selectRecordAllByPatientId(patientId);
    }
    @PostMapping
    public ResponseEntity<Map<String, Object>> insertRecord(@RequestBody MedicalRecord mr) {
        int result = medicalRecordService.insertRecord(mr);

        Map<String, Object> map = new HashMap<>();
        map.put("success", result > 0);
        map.put("message", result > 0 ? "진료 등록 완료" : "등록 실패");

        // ✅ 추가: recordId 리턴 (PDF 자동 발행용)
        if (result > 0 && mr.getRecordId() != null) {
            map.put("recordId", mr.getRecordId());
        }

        return ResponseEntity.ok(map);
    }

    @GetMapping("/reserved")
    public ResponseEntity<List<MedicalRecord>> getReservedRecords(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<MedicalRecord> records = medicalRecordService.selectReservedRecords(date);
        return ResponseEntity.ok(records);
    }
    @GetMapping("/cost/preview")
    public ResponseEntity<Map<String, Object>> previewCost(
            @RequestParam Long doctorId,
            @RequestParam Long patientId) {

        MedicalRecord mr = new MedicalRecord();
        mr.setDoctorId(doctorId);
        mr.setPatientId(patientId);
        medicalRecordService.calculateCost(mr); // 기존 로직 재사용

        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        map.put("totalCost", mr.getTotalCost());
        map.put("insuranceAmount", mr.getInsuranceAmount());
        map.put("patientPay", mr.getPatientPay());
        return ResponseEntity.ok(map);
    }


}
