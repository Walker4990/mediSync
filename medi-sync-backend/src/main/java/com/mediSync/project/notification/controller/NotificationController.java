package com.mediSync.project.notification.controller;

import com.mediSync.project.notification.dto.NotificationSettingDTO;
import com.mediSync.project.notification.service.NotificationService;
import com.mediSync.project.notification.vo.NotificationSetting;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;


    //회원의 알림설정 가져오기
    @GetMapping("/{patientId}")
    public ResponseEntity<NotificationSetting> getNotificationSetting(@PathVariable Long patientId){
        System.out.println("✅ GET 요청 도착: " + patientId);
        NotificationSetting setting = notificationService.getNotificationSetting(patientId);
        return ResponseEntity.ok(setting);
    }


    //알림 설정 업데이트
    @PutMapping("/{patientId}")
    public ResponseEntity<?> updatedNotificationSetting(
            @PathVariable Long patientId,
            @RequestBody NotificationSettingDTO dto){
        System.out.println("변경된 키:"+ dto.getKey());
        System.out.println("변경된 값: "+ dto.getValue());
        if(dto.getKey().equals("sms")){
            return ResponseEntity.ok("알림설정이 완료되었습니다.");
        }

        notificationService.updateSetEnabled(patientId, dto.getKey(), dto.getValue());
        return  ResponseEntity.ok("알림설정이 완료되었습니다.");
    }
}
