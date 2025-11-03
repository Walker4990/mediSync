package com.mediSync.project.notification.service;

import com.mediSync.project.notification.mapper.NotificationMapper;
import com.mediSync.project.notification.vo.NotificationSetting;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService{

    private final NotificationMapper notificationMapper;

    //환자가 회원가입 시 알림설정 생성
    public int insertNotificationSetting(long patientId) {
        return notificationMapper.insertNotificationSetting(patientId);
    }

    public NotificationSetting getNotificationSetting(long patientId){
        return notificationMapper.getNotificationSetting(patientId);
    }

    public int updateSetEnabled(long patientId, String key, Boolean value){
        return notificationMapper.updateSetEnabled(patientId,key,value);
    }
}
