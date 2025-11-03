package com.mediSync.project.notification.mapper;

import com.mediSync.project.notification.vo.NotificationSetting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {
    int insertNotificationSetting(long patientId);
    NotificationSetting getNotificationSetting(long patientId);
    int updateSetEnabled(@Param("patientId")long patientId,
                         @Param("key") String key,
                        @Param("value") Boolean value);
}
