package com.mediSync.project.controller;

import com.mediSync.project.service.OperationService;
import com.mediSync.project.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/operation")
public class OperationController {
    private final OperationService operationService;

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
        operationService.completeOperation(operation);
        return ResponseEntity.ok("✅ 수술 결과가 등록되었습니다.");
    }
    // ✅ 중복 체크용
    @GetMapping("/check")
    public ResponseEntity<?> checkAvailability(
            @RequestParam String scheduledDate,
            @RequestParam String scheduledTime,
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
    public List<MedicalStaff> selectStaffByOperationId(@PathVariable Long operationId) {
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

}
