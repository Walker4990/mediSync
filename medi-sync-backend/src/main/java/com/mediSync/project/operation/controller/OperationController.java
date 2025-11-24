package com.mediSync.project.operation.controller;

import com.mediSync.project.medical.vo.AdminAccount;
import com.mediSync.project.operation.mapper.OperationMapper;
import com.mediSync.project.operation.vo.*;
import com.mediSync.project.operation.service.OperationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/operation")
public class OperationController {
    private final OperationService operationService;
    private final OperationMapper operationMapper;
    @PostMapping("/reserve")
    public ResponseEntity<?> reserve(@RequestBody Operation operation) {
        try {
            boolean result = operationService.reserveOperation(operation);
            return ResponseEntity.ok().body(
                    result ? "✅ 수술 예약이 완료되었습니다." : "❌ 예약 실패"
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/list")
    public List<Operation> list() {
        return operationService.selectOperationList();
    }

    @PutMapping("/{operationId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long operationId,
            @RequestParam String status
    ) {
        operationService.updateOperationStatus(operationId, status);
        return ResponseEntity.ok("✅ 상태가 " + status + "로 변경되었습니다.");
    }

    @PutMapping("/{operationId}/complete")
    public ResponseEntity<?> complete(@PathVariable Long operationId,
                                      @RequestBody Operation operation) {
        operation.setOperationId(operationId);
        operationService.completeOperation(operationId);
        return ResponseEntity.ok("✅ 수술 결과가 등록되었습니다.");
    }
    // ✅ 중복 체크용
    @GetMapping("/check")
    public ResponseEntity<?> checkAvailability(
            @RequestParam LocalDate scheduledDate,
            @RequestParam LocalTime scheduledTime,
            @RequestParam(required = false, defaultValue = "1") int roomId
    ) {
        boolean available = operationService.isAvailable(scheduledDate, scheduledTime, roomId);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/{operationId}")
    public ResponseEntity<?> getOperationById(@PathVariable Long operationId) {
        try {
            Operation op = operationService.getOperationById(operationId);
            return ResponseEntity.ok(op);
        } catch (Exception e) {
            e.printStackTrace(); // 🔥 콘솔에 실제 원인 표시
            return ResponseEntity.internalServerError().body("❌ 오류: " + e.getMessage());
        }
    }

    @PutMapping("/{operationId}/update")
    public ResponseEntity<String> updateOperation(
            @PathVariable Long operationId,
            @RequestBody Operation operation
    ) {
        operation.setOperationId(operationId);
        operationService.updateOperation(operation);
        return ResponseEntity.ok("✅ 수술 정보가 수정되었습니다.");
    }

    @PostMapping("/{operationId}/staff")
    public ResponseEntity<String> addStaff(
            @PathVariable Long operationId,
            @RequestBody OperationStaff staff
    ) {
        staff.setOperationId(operationId);
        operationService.addStaff(staff);
        return ResponseEntity.ok("✅ 의료진 추가 완료");
    }

    @GetMapping("/{operationId}/logs")
    public ResponseEntity<List<OperationLog>> getLogs(@PathVariable Long operationId) {
        return ResponseEntity.ok(operationService.getOperationLogs(operationId));
    }

    @GetMapping("/{operationId}/staff")
    public ResponseEntity<List<OperationStaff>> getStaffList(@PathVariable Long operationId) {
        return ResponseEntity.ok(operationService.getStaffList(operationId));
    }
    @GetMapping("/room")
    public ResponseEntity<List<OperationRoom>> getRoomList() {
        return ResponseEntity.ok(operationService.selectOperationRoomList());
    }
    @GetMapping("/{operationId}/operationStaffs")
    public List<AdminAccount> selectStaffByOperationId(@PathVariable Long operationId) {
        return operationService.selectStaffByOperationId(operationId);
    }
    @DeleteMapping("/{operationId}/staff/{staffId}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long operationId,
                                         @PathVariable Long staffId) {
        try {
            operationService.deleteOperationStaff(operationId, staffId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "의료진 삭제 완료"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "삭제 중 오류 발생"));
        }
    }

    @GetMapping("/{operationId}/report")
    public ResponseEntity<byte[]> getOperationReport(@PathVariable Long operationId) {
        byte[] pdf = operationService.generateOperationReport(operationId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String fileName = URLEncoder.encode("수술기록_" + operationId + ".pdf", StandardCharsets.UTF_8);
        headers.add("Content-Disposition", "inline; filename=" + fileName);

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
    @PostMapping("/{operationId}/complete")
    public ResponseEntity<?> completeOperation(@PathVariable Long operationId){
        operationService.completeOperation(operationId);
        return ResponseEntity.ok("수술이 완료되었습니다.");
    }

    @GetMapping("/todayList")
    public List<Operation> todayList(@RequestParam LocalDate scheduledDate) {
        return operationService.selectByDate(scheduledDate);
    }

    @GetMapping("/cost/list")
    public List<OperationCost> operationCostList() {
        return operationMapper.getOperationCostList();
    }
}
