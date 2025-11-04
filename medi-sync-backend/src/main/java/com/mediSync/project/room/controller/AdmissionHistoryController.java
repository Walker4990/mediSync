package com.mediSync.project.room.controller;

import com.mediSync.project.room.mapper.AdmissionHistoryMapper;
import com.mediSync.project.room.service.AdmissionHistoryService;
import com.mediSync.project.room.vo.AdmissionHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissionHistory")
@RequiredArgsConstructor
public class AdmissionHistoryController {

    private final AdmissionHistoryService admissionHistoryService;

    @GetMapping
    public ResponseEntity<List<AdmissionHistory>> selectAllHistory() {
        return ResponseEntity.ok(admissionHistoryService.selectAllHistory());
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<List<AdmissionHistory>> selectHistoryByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(admissionHistoryService.selectHistoryByPatient(patientId));
    }


}
