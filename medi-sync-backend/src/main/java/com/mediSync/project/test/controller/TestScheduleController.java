package com.mediSync.project.test.controller;


import com.mediSync.project.test.service.TestScheduleService;
import com.mediSync.project.test.vo.TestSchedule;
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
    public ResponseEntity<?> checkAvailability(@RequestParam(required = false) String testCode, @RequestParam String testDate, @RequestParam String testTime){
        boolean available = testScheduleService.checkAvailability(testCode, testDate, testTime);
        return ResponseEntity.ok(Map.of("available", available));
    }
    @PostMapping("/reserve")
    public ResponseEntity<?> reserveSlot(@RequestBody Map<String, String> body) {

        int result = testScheduleService.reserveSlot(body.get("testCode"),
                LocalDate.parse(body.get("testDate")),
                body.get("testTime"));

        if (result == -1) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "동시 요청이 많아 잠시 후 다시 시도해주세요 (락 경합)"
            ));
        }

        if (result == 0) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "예약 실패 (정원 초과)"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "예약 성공"
        ));
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<?> updateTestSchedule(@PathVariable Long scheduleId, @RequestBody TestSchedule schedule) {
        schedule.setScheduleId(scheduleId);
        testScheduleService.updateTestSchedule(schedule);
        return ResponseEntity.ok(Map.of("success", true, "message", "일정 수정 완료"));
    }

}
