package com.mediSync.project.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("payment")
public class Payment {
    private Long paymentId;
    private String orderId;
    private String paymentKey;
    private String pgProvider;
    private Long patientId;
    private Long recordId;
    private Double amount;
    private String currency;
    private String status;
    private Long financeId;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime successAt;
    private LocalDateTime canceledAt;
    private LocalDateTime refundedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
