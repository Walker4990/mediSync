package com.mediSync.project.notification.dto;

import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.util.Map;

@Alias("notiSetDTO")
@Data
public class NotificationSettingDTO {
    private String key;
    private Boolean value;
    private Map<String, Boolean> settings;
}
