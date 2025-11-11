package com.mediSync.project.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Billing {
    private Long billId;
    private Long recordId;
    private BigDecimal totalAmount;
    private BigDecimal discount;
    private String status;
    private LocalDateTime createdAt;
}
