package com.mediSync.project.room.controller;

import com.mediSync.project.room.mapper.AdmissionMapper;
import com.mediSync.project.room.service.AdmissionService;
import com.mediSync.project.room.vo.Admission;
import com.mediSync.project.room.vo.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admission")
@RequiredArgsConstructor
public class AdmissionController {

    private final AdmissionService admissionService;
    private final AdmissionMapper admissionMapper;
    private final SimpMessagingTemplate messagingTemplate;
    @GetMapping("/list")
    public ResponseEntity<List<Admission>> getAllAdmissions() {
        return ResponseEntity.ok(admissionService.getAdmissionList());
    }

    @PutMapping("/{admissionId}/discharge")
    public ResponseEntity<?> discharge(@PathVariable Long admissionId) {
        int result = admissionService.updateDischarge(admissionId);
        boolean success = result > 0;

        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "퇴원 처리 완료" : "퇴원 처리 실패"
        ));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Admission>> getAdmissionsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(admissionService.getAdmissionsByRoom(roomId));
    }

    @PutMapping("/{admissionId}/dischargedAt")
    public ResponseEntity<?> dischargedAt(
            @PathVariable Long admissionId,
            @RequestBody Map<String, String> payload) {

        String text = payload.get("dischargedAt");

        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body("퇴원일이 비어 있습니다.");
        }

        LocalDateTime dischargedAt = LocalDateTime.parse(text + "T00:00:00");
        int result = admissionService.updateExpectedDischargeDate(dischargedAt, admissionId);

        return ResponseEntity.ok(Map.of("success", result > 0));
    }

    @GetMapping("/alert/list")
    public ResponseEntity<?> sendDischargeAlerts() {
        List<Admission> alerts = admissionMapper.getDischargeAlertsDday();
        if (alerts.isEmpty()) {
            return ResponseEntity.ok("퇴원 예정자 없음");
        }

        // ✅ 중복 전송 방지 (같은 ID 반복 시 무시)
        Set<Long> sentIds = new HashSet<>();
        alerts.removeIf(a -> !sentIds.add(a.getAdmissionId()));

        messagingTemplate.convertAndSend("/topic/admission/discharge", alerts);
        System.out.println("⚡ WebSocket 전송 완료: " + alerts.size() + "명");
        return ResponseEntity.ok("퇴원 알림 전송 완료 (" + alerts.size() + "명)");
    }
    @GetMapping("/{roomId}/transfer-options")
    public ResponseEntity<?> getTransferOptions(@PathVariable Long roomId) {
        Room currentRoom = admissionMapper.findRoomById(roomId);
        if (currentRoom == null || currentRoom.getDepartment() == null) {
            return ResponseEntity.badRequest().body("잘못된 병실 정보");
        }

        List<Room> availableRooms =
                admissionService.findAvailableRoomsForTransfer(currentRoom.getDepartment(), roomId);

        return ResponseEntity.ok(availableRooms);
    }
    @PutMapping("/{admissionId}/transfer")
    public ResponseEntity<?> transferRoom(
            @PathVariable Long admissionId,
            @RequestBody Map<String, Long> payload) {

        Long newRoomId = payload.get("newRoomId");
        if (newRoomId == null) {
            return ResponseEntity.badRequest().body("잘못된 요청");
        }

        int result = admissionService.transferRoom(admissionId, newRoomId);
        return ResponseEntity.ok(Map.of("success", result > 0));
    }
    @PostMapping("/process-scheduled")
    public ResponseEntity<String> processScheduledAdmissions() {
        admissionService.processScheduledAdmission();
        return ResponseEntity.ok("🏥 수동 입원 스케줄 실행 완료");
    }
}
