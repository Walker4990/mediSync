package com.mediSync.project.notification.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("notiset")
public class NotificationSetting {

    private long notificationId;
    private long patientId;
    private boolean emailEnabled;
    private boolean pushEnabled;
    private boolean marketingEnabled;
}
