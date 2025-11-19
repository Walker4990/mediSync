package com.mediSync.project.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("refund")
public class RefundRequest {
    private Long refundId;
    private String orderId;
    private Long patientId;
    private double amount;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String refundStatus;


}
