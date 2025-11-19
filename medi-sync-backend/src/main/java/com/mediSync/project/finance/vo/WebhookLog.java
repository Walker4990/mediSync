package com.mediSync.project.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("webhook")
public class WebhookLog {
    private Long logId;
    private String paymentKey;
    private String eventType;
    private String rawPayload;
    private LocalDateTime createdAt;
}
