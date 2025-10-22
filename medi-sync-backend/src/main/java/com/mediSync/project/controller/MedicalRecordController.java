package com.mediSync.project.controller;

import com.mediSync.project.service.MedicalRecordService;
import com.mediSync.project.vo.MedicalRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

        Map<String,Object> map = new HashMap<>();
        map.put( "success", result > 0 );
        map.put( "message", result > 0 ? "진료 등록 완료" : "등록 실패" );
        return ResponseEntity.ok(map);
    }
}
