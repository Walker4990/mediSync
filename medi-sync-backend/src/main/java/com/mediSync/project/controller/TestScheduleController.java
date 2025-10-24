package com.mediSync.project.controller;


import com.mediSync.project.dto.TestScheduleDTO;
import com.mediSync.project.service.TestScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/testSchedule")
@RequiredArgsConstructor
public class TestScheduleController {
    private final TestScheduleService testScheduleService;

    @GetMapping("/check")
    public ResponseEntity<?> checkAvailability(@RequestParam String testCode, @RequestParam String testDate, @RequestParam String testTime){
        boolean available = testScheduleService.checkAvailability(testCode, testDate, testTime);
        return ResponseEntity.ok(Map.of("available", available));
    }
    @PostMapping("/reserve")
    public ResponseEntity<Map<String, Object>> reserveSlot(@RequestBody Map<String, Object> request) {
        String testCode = (String) request.get("testCode");
        LocalDate testDate = LocalDate.parse((String) request.get("testDate"));
        String testTime = (String) request.get("testTime");
        int result = testScheduleService.reserveSlot(testCode, testDate, testTime);

        Map<String, Object> res = new HashMap<>();
        res.put("success", result > 0);
        res.put("message", result > 0 ? "예약 성공" : "예약 실패 (정원 초과)");
        return ResponseEntity.ok(res);
    }
}
