package com.mediSync.project.insurance.controller;

import com.mediSync.project.insurance.mapper.InsurerMapper;
import com.mediSync.project.insurance.service.InsurerSyncService;
import com.mediSync.project.insurance.vo.Insurer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/insurer")
public class InsurerController {
    private final InsurerSyncService insurerSyncService;
    private final InsurerMapper insurerMapper;

    // ✅ 보험사 목록 조회
    @GetMapping("/list")
    public ResponseEntity<?> getInsurerList() {
        return ResponseEntity.ok(insurerMapper.findAll());
    }

    @PostMapping("/sync")
    public ResponseEntity<?> manualSync(){
        int count = insurerSyncService.syncMock();
        return ResponseEntity.ok(Map.of("updated", count));
    }

    @GetMapping("/code")
    public List<Insurer> getInsurerCode(){
        return insurerSyncService.getInsurerCode();
    }
}
